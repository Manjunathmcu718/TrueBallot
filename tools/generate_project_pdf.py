from pathlib import Path
import textwrap


ROOT = Path(__file__).resolve().parents[1]
SOURCE = ROOT / "PROJECT_EXPLANATION.md"
OUTPUT = ROOT / "PROJECT_EXPLANATION.pdf"


PAGE_WIDTH = 595
PAGE_HEIGHT = 842
LEFT = 50
TOP = 60
BOTTOM = 50
FONT_SIZE = 11
LEADING = 16
MAX_COLS = 88


def escape_pdf_text(text: str) -> str:
    return text.replace("\\", "\\\\").replace("(", "\\(").replace(")", "\\)")


def parse_source_lines(text: str):
    lines = []
    for raw in text.splitlines():
        stripped = raw.rstrip()
        if not stripped:
            lines.append("")
            continue

        if stripped.startswith("# "):
            title = stripped[2:].strip().upper()
            lines.append(("title", title))
            continue

        if stripped.startswith("## "):
            heading = stripped[3:].strip()
            lines.append(("heading", heading))
            continue

        if stripped.startswith("### "):
            subheading = stripped[4:].strip()
            lines.append(("subheading", subheading))
            continue

        if stripped.startswith("- "):
            wrapped = textwrap.wrap(stripped[2:].strip(), width=MAX_COLS - 4) or [""]
            for idx, chunk in enumerate(wrapped):
                prefix = "- " if idx == 0 else "  "
                lines.append(prefix + chunk)
            continue

        if stripped.startswith(("1. ", "2. ", "3. ", "4. ", "5. ", "6. ", "7. ", "8. ", "9. ")):
            wrapped = textwrap.wrap(stripped, width=MAX_COLS) or [""]
            lines.extend(wrapped)
            continue

        wrapped = textwrap.wrap(stripped, width=MAX_COLS) or [""]
        lines.extend(wrapped)

    return lines


def build_pages(parsed_lines):
    pages = []
    current = []
    y = PAGE_HEIGHT - TOP

    def consume(extra=LEADING):
        nonlocal y, current, pages
        if y - extra < BOTTOM:
            pages.append(current)
            current = []
            y = PAGE_HEIGHT - TOP

    for item in parsed_lines:
        if isinstance(item, tuple):
            kind, text = item
            if kind == "title":
                consume(26)
                current.append(("F2", 18, LEFT, y, text))
                y -= 28
            elif kind == "heading":
                consume(22)
                current.append(("F2", 14, LEFT, y, text))
                y -= 22
            elif kind == "subheading":
                consume(18)
                current.append(("F2", 12, LEFT, y, text))
                y -= 18
        else:
            consume(LEADING)
            current.append(("F1", FONT_SIZE, LEFT, y, item))
            y -= LEADING

    if current:
        pages.append(current)

    return pages


def content_stream(page_items, page_no, total_pages):
    parts = ["BT"]
    for font_name, font_size, x, y, text in page_items:
        safe = escape_pdf_text(text)
        parts.append(f"/{font_name} {font_size} Tf")
        parts.append(f"1 0 0 1 {x} {y} Tm")
        parts.append(f"({safe}) Tj")

    footer = f"Page {page_no} of {total_pages}"
    parts.append("/F1 10 Tf")
    parts.append(f"1 0 0 1 {PAGE_WIDTH - 120} 25 Tm")
    parts.append(f"({escape_pdf_text(footer)}) Tj")
    parts.append("ET")
    return "\n".join(parts).encode("latin-1", errors="replace")


def add_object(objects, data: bytes) -> int:
    objects.append(data)
    return len(objects)


def main():
    source_text = SOURCE.read_text(encoding="utf-8")
    parsed = parse_source_lines(source_text)
    pages = build_pages(parsed)

    objects = []

    font1_id = add_object(objects, b"<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>")
    font2_id = add_object(objects, b"<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica-Bold >>")

    page_ids = []
    content_ids = []

    total_pages = len(pages)
    for idx, page in enumerate(pages, start=1):
        stream = content_stream(page, idx, total_pages)
        content_obj = (
            f"<< /Length {len(stream)} >>\nstream\n".encode("latin-1")
            + stream
            + b"\nendstream"
        )
        content_ids.append(add_object(objects, content_obj))

    # Reserve object ids up front so page objects can point to the real Pages tree id.
    next_obj_id = len(objects) + 1
    reserved_page_ids = [next_obj_id + i for i in range(len(content_ids))]
    pages_tree_id = next_obj_id + len(content_ids)
    catalog_id = pages_tree_id + 1

    for i, content_id in enumerate(content_ids):
        page_obj = (
            f"<< /Type /Page /Parent {pages_tree_id} 0 R "
            f"/MediaBox [0 0 {PAGE_WIDTH} {PAGE_HEIGHT}] "
            f"/Resources << /Font << /F1 {font1_id} 0 R /F2 {font2_id} 0 R >> >> "
            f"/Contents {content_id} 0 R >>"
        ).encode("latin-1")
        actual_id = add_object(objects, page_obj)
        page_ids.append(actual_id)

        expected_id = reserved_page_ids[i]
        if actual_id != expected_id:
            raise RuntimeError(f"Unexpected PDF object id allocation: expected {expected_id}, got {actual_id}")

    kids = " ".join(f"{pid} 0 R" for pid in page_ids)
    actual_pages_tree_id = add_object(
        objects,
        f"<< /Type /Pages /Kids [{kids}] /Count {len(page_ids)} >>".encode("latin-1"),
    )
    if actual_pages_tree_id != pages_tree_id:
        raise RuntimeError(f"Unexpected Pages object id allocation: expected {pages_tree_id}, got {actual_pages_tree_id}")

    actual_catalog_id = add_object(objects, f"<< /Type /Catalog /Pages {pages_tree_id} 0 R >>".encode("latin-1"))
    if actual_catalog_id != catalog_id:
        raise RuntimeError(f"Unexpected Catalog object id allocation: expected {catalog_id}, got {actual_catalog_id}")

    pdf = bytearray(b"%PDF-1.4\n%\xe2\xe3\xcf\xd3\n")
    offsets = [0]

    for obj_num, obj in enumerate(objects, start=1):
        offsets.append(len(pdf))
        pdf.extend(f"{obj_num} 0 obj\n".encode("latin-1"))
        pdf.extend(obj)
        pdf.extend(b"\nendobj\n")

    xref_pos = len(pdf)
    pdf.extend(f"xref\n0 {len(objects) + 1}\n".encode("latin-1"))
    pdf.extend(b"0000000000 65535 f \n")
    for off in offsets[1:]:
        pdf.extend(f"{off:010d} 00000 n \n".encode("latin-1"))

    trailer = (
        f"trailer\n<< /Size {len(objects) + 1} /Root {catalog_id} 0 R >>\n"
        f"startxref\n{xref_pos}\n%%EOF"
    )
    pdf.extend(trailer.encode("latin-1"))

    OUTPUT.write_bytes(pdf)
    print(f"Created: {OUTPUT}")


if __name__ == "__main__":
    main()
