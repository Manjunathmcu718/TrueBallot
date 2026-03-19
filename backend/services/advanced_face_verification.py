import cv2
import numpy as np
import base64
from io import BytesIO
from PIL import Image
import requests

class AdvancedFaceVerification:
    def __init__(self):
        print("[OK] Advanced Face Verification initialized")

    def _load_deepface(self):
        # Import DeepFace only when face verification is requested so the API can boot
        # without loading the full TensorFlow stack on startup.
        from deepface import DeepFace

        return DeepFace
    
    def detect_anti_spoof(self, image):
        """Detect photo/screen spoofing"""
        # Normalize size to make heuristics less sensitive to camera resolution.
        # Very small / heavily compressed frames often look "flat" and trigger false positives.
        h, w = image.shape[:2]
        if h < 120 or w < 120:
            return {
                'is_real': True,
                'confidence': 60.0,
                'indicators': ['Frame too small for reliable anti-spoof; skipping strict checks']
            }

        target_w = 360
        if w > target_w:
            scale = target_w / float(w)
            image = cv2.resize(image, (target_w, int(h * scale)), interpolation=cv2.INTER_AREA)

        gray = cv2.cvtColor(image, cv2.COLOR_BGR2GRAY)
        
        # Glare detection (screen replay often shows large blown-out regions)
        _, thresh = cv2.threshold(gray, 250, 255, cv2.THRESH_BINARY)
        glare_ratio = np.sum(thresh == 255) / (image.shape[0] * image.shape[1])
        
        # Texture: Laplacian variance is sensitive to blur + aggressive denoising.
        laplacian = cv2.Laplacian(gray, cv2.CV_64F)
        texture_variance = laplacian.var()
        
        # Edges: low edge density can mean blurred/washed-out frame (common on webcams).
        edges = cv2.Canny(gray, 50, 150)
        edge_density = np.sum(edges > 0) / (image.shape[0] * image.shape[1])
        
        spoof_indicators = []
        confidence = 100.0
        
        if glare_ratio > 0.08:
            spoof_indicators.append('Screen glare detected')
            confidence -= 25
            
        # Relaxed thresholds to reduce false positives on real webcam frames.
        if texture_variance < 18:
            spoof_indicators.append('Low texture - possible flat photo')
            confidence -= 30
            
        if edge_density < 0.02:
            spoof_indicators.append('Unnatural edge distribution')
            confidence -= 20
        
        return {
            # Keep this lenient; DeepFace match is the real gate.
            'is_real': confidence > 40,
            'confidence': max(0, confidence),
            'indicators': spoof_indicators
        }
    
    def comprehensive_verification(self, stored_image_url, live_image_base64):
        """Complete verification with DeepFace"""
        
        # Handle stored image - can be URL or base64 data URL
        print("[INFO] Processing stored image...")
        if stored_image_url.startswith('data:image'):
            # Base64 data URL
            if 'base64,' in stored_image_url:
                stored_image_base64 = stored_image_url.split('base64,')[1]
            else:
                stored_image_base64 = stored_image_url
            stored_image_bytes = base64.b64decode(stored_image_base64)
            stored_img = Image.open(BytesIO(stored_image_bytes))
        else:
            # Regular URL - download it
            print(f"[INFO] Downloading stored image from: {stored_image_url}")
            response = requests.get(stored_image_url)
            stored_img = Image.open(BytesIO(response.content))
        stored_cv = cv2.cvtColor(np.array(stored_img), cv2.COLOR_RGB2BGR)
        
        # Decode live image
        if 'base64,' in live_image_base64:
            live_image_base64 = live_image_base64.split('base64,')[1]
        
        live_image_bytes = base64.b64decode(live_image_base64)
        live_img = Image.open(BytesIO(live_image_bytes))
        live_cv = cv2.cvtColor(np.array(live_img), cv2.COLOR_RGB2BGR)
        
        print("[INFO] Running anti-spoof detection...")
        spoof_result = self.detect_anti_spoof(live_cv)
        
        if not spoof_result['is_real']:
            print("[WARN] Spoofing detected!")
            return {
                'match': False,
                'confidence': 0,
                'reason': 'Spoofing detected: ' + ', '.join(spoof_result['indicators']),
                'detailed_scores': {
                    'anti_spoof_score': f"{spoof_result['confidence']:.1f}%",
                    'final_confidence': '0%'
                }
            }
        
        # Face verification with DeepFace
        try:
            print("[INFO] Running DeepFace verification...")
            DeepFace = self._load_deepface()
            result = DeepFace.verify(
                stored_cv, 
                live_cv,
                model_name='Facenet',
                enforce_detection=True
            )
            
            distance = result['distance']
            threshold = result['threshold']
            # Map distance to an intuitive 0-100 score.
            # Using (1 - distance) is less harsh than (1 - distance/threshold) and works better for demo UX.
            embedding_score = max(0.0, min(100.0, (1.0 - float(distance)) * 100.0))

            # Lightweight "geometry" proxy (NOT landmark-based):
            # compares face box aspect ratios when available from DeepFace.
            geometry_score = 88.0
            try:
                facial_areas = result.get("facial_areas") or result.get("facial_area")
                if isinstance(facial_areas, dict) and "img1" in facial_areas and "img2" in facial_areas:
                    a1 = facial_areas["img1"]
                    a2 = facial_areas["img2"]
                    r1 = float(a1.get("w", 0)) / max(1.0, float(a1.get("h", 1)))
                    r2 = float(a2.get("w", 0)) / max(1.0, float(a2.get("h", 1)))
                    diff = abs(r1 - r2)
                    geometry_score = max(0.0, 100.0 - (diff * 120.0))
            except Exception:
                pass
            
            final_confidence = (
                embedding_score * 0.70 +
                geometry_score * 0.10 +
                spoof_result['confidence'] * 0.20
            )
            
            # DeepFace's verified flag is the primary gate; final_confidence is for UX + a light extra gate.
            match = bool(result.get('verified')) and final_confidence >= 45
            
            print(f"[OK] Verification complete: {match} (confidence: {final_confidence:.1f}%)")
            
            return {
                'match': match,
                'confidence': round(final_confidence / 100, 2),
                'reason': 'Verification successful' if match else 'Low confidence match',
                'detailed_scores': {
                    'face_embedding_score': f"{embedding_score:.1f}%",
                    'geometry_score': f"{geometry_score:.1f}%",
                    'anti_spoof_score': f"{spoof_result['confidence']:.1f}%",
                    'final_confidence': f"{final_confidence:.1f}%",
                    'distance': f"{float(distance):.4f}",
                    'threshold': f"{float(threshold):.4f}"
                }
            }
            
        except Exception as e:
            print(f"[ERROR] DeepFace error: {e}")
            return {
                'match': False,
                'confidence': 0,
                'reason': f'Face not detected: {str(e)}',
                'detailed_scores': None
            }
