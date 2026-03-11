import React, { useState, useRef } from "react";
import { Camera, Upload, X, AlertCircle, CheckCircle } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

const ImageUpload = ({ onImageChange }) => {
  const [image, setImage] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [validationErrors, setValidationErrors] = useState([]);
  const [isValidating, setIsValidating] = useState(false);
  const [dragActive, setDragActive] = useState(false);

  const fileInputRef = useRef(null);

  // Validate Image
  const validateImage = (file) => {
    return new Promise((resolve) => {
      const errors = [];

      const allowedTypes = ["image/jpeg", "image/jpg", "image/png"];
      if (!allowedTypes.includes(file.type)) {
        errors.push("Only JPG, JPEG, PNG allowed.");
      }

      const sizeKB = file.size / 1024;

      if (sizeKB < 50) {
        errors.push("Image too small (min 50KB)");
      }

      if (sizeKB > 100) {
        errors.push("Image too large (max 100KB)");
      }

      const img = new Image();

      img.onload = () => {
        const width = img.width;
        const height = img.height;

        if (Math.abs(width - 530) > 60) {
          errors.push(`Width should be around 530px. Current: ${width}px`);
        }

        if (Math.abs(height - 413) > 60) {
          errors.push(`Height should be around 413px. Current: ${height}px`);
        }

        resolve(errors);
      };

      img.onerror = () => {
        errors.push("Image failed to load");
        resolve(errors);
      };

      img.src = URL.createObjectURL(file);
    });
  };

  // Handle file
  const handleFileSelect = async (file) => {
    if (!file) return;

    setIsValidating(true);
    setValidationErrors([]);

    const errors = await validateImage(file);

    if (errors.length > 0) {
      setValidationErrors(errors);
      setImage(null);
      setImagePreview(null);

      if (onImageChange) onImageChange(null);
    } else {
      const reader = new FileReader();

      reader.onload = (e) => {
        const base64 = e.target.result;

        setImage(file);
        setImagePreview(base64);

        if (onImageChange) onImageChange(base64);
      };

      reader.readAsDataURL(file);
    }

    setIsValidating(false);
  };

  const handleChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      handleFileSelect(e.target.files[0]);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileSelect(e.dataTransfer.files[0]);
    }
  };

  const removeImage = () => {
    setImage(null);
    setImagePreview(null);
    setValidationErrors([]);

    if (onImageChange) onImageChange(null);

    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  return (
    <div className="space-y-4">

      {/* Label */}
      <div className="flex justify-between items-center">
        <label className="text-sm font-medium text-gray-700">
          Voter Photo
        </label>
        <span className="text-xs text-gray-500">
          4.5×3.5cm • 50‑100KB • JPG/PNG
        </span>
      </div>

      {/* Image Preview */}
      {imagePreview ? (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="relative"
        >
          <img
            src={imagePreview}
            alt="preview"
            className="max-w-sm mx-auto rounded-lg border shadow"
          />

          <button
            onClick={removeImage}
            className="absolute -top-2 -right-2 bg-red-600 text-white p-2 rounded-full"
          >
            <X size={16} />
          </button>
        </motion.div>
      ) : (
        <div
          className={`border-2 border-dashed p-8 rounded-lg text-center cursor-pointer transition ${
            dragActive
              ? "border-blue-500 bg-blue-50"
              : "border-gray-300 hover:border-gray-400 bg-gray-50"
          }`}
          onClick={() => {
  if (fileInputRef.current) {
    fileInputRef.current.click();
  }
}}
          onDragOver={(e) => e.preventDefault()}
          onDragEnter={() => setDragActive(true)}
          onDragLeave={() => setDragActive(false)}
          onDrop={handleDrop}
        >
          <Camera className="mx-auto mb-3 text-gray-400" size={40} />

          <p className="font-semibold">
            Click to upload or drag & drop
          </p>

          <p className="text-xs text-gray-500">
            JPG, JPEG, PNG • 4.5cm × 3.5cm • 50‑100KB
          </p>

          <input
            ref={fileInputRef}
            type="file"
            accept="image/jpeg,image/png,image/jpg"
            onChange={handleChange}
            className="hidden"
          />
        </div>
      )}

      {/* Validation */}
      <AnimatePresence>

        {isValidating && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex items-center gap-2 text-blue-600"
          >
            <Upload size={16} className="animate-pulse" />
            Validating image...
          </motion.div>
        )}

        {validationErrors.length > 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="bg-red-50 border border-red-200 p-3 rounded"
          >
            {validationErrors.map((err, i) => (
              <div key={i} className="flex gap-2 text-sm text-red-700">
                <AlertCircle size={16} />
                {err}
              </div>
            ))}
          </motion.div>
        )}

        {image && validationErrors.length === 0 && !isValidating && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="bg-green-50 border border-green-200 p-3 rounded flex items-center gap-2 text-green-700"
          >
            <CheckCircle size={16} />
            Image is valid
          </motion.div>
        )}

      </AnimatePresence>
    </div>
  );
};

export default ImageUpload;
// import React, { useState, useRef } from 'react';
// import { Camera, Upload, X, AlertCircle, CheckCircle } from 'lucide-react';
// import { motion, AnimatePresence } from 'framer-motion';

// const ImageUpload = ({ onImageChange, error }) => {
//     const [image, setImage] = useState(null);
//     const [imagePreview, setImagePreview] = useState(null);
//     const [dragActive, setDragActive] = useState(false);
//     const [validationErrors, setValidationErrors] = useState([]);
//     const [isValidating, setIsValidating] = useState(false);
//     const fileInputRef = useRef(null);

//     // Image constraints for display
//     const constraints = {
//         'Format': 'JPG, JPEG, PNG only',
//         'Size': '4.5cm × 3.5cm (530×413 pixels)',
//         'File Size': '50KB - 100KB',
//         'Quality': 'Clear, sharp, frontal view',
//         'Orientation': 'Not tilted or upside down'
//     };

//     const validateImage = (file) => {
//         return new Promise((resolve) => {
//             const errors = [];
            
//             const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png'];
//             if (!allowedTypes.includes(file.type)) {
//                 errors.push('Invalid format. Only JPG, JPEG, PNG allowed.');
//             }
            
//             const sizeKB = file.size / 1024;
//             if (sizeKB < 50) {
//                 errors.push('File too small. Minimum 50KB required.');
//             }
//             if (sizeKB > 100) {
//                 errors.push('File too large. Maximum 100KB required.');
//             }
            
//             const img = new Image();
//             img.onload = () => {
//                 const requiredWidth = 530; 
//                 const requiredHeight = 413;
//                 const tolerance = 0.1;
                
//                 const widthDiff = Math.abs(img.width - requiredWidth) / requiredWidth;
//                 const heightDiff = Math.abs(img.height - requiredHeight) / requiredHeight;
                
//                 if (widthDiff > tolerance) {
//                     errors.push(`Width should be ~530px (4.5cm). Current: ${img.width}px`);
//                 }
//                 if (heightDiff > tolerance) {
//                     errors.push(`Height should be ~413px (3.5cm). Current: ${img.height}px`);
//                 }
                
//                 resolve(errors);
//             };
            
//             img.onerror = () => {
//                 errors.push('Failed to load image for validation.');
//                 resolve(errors);
//             };
            
//             img.src = URL.createObjectURL(file);
//         });
//     };

//     const handleFileSelect = async (file) => {
//         if (!file) return;
//         setIsValidating(true);
//         setValidationErrors([]);
        
//         try {
//             const errors = await validateImage(file);
//             setValidationErrors(errors);
            
//             if (errors.length === 0) {
//                 const reader = new FileReader();
//                 reader.onload = (e) => {
//                     const base64Data = e.target.result;
//                     setImage(file);
//                     setImagePreview(base64Data);
//                     onImageChange(base64Data);
//                 };
//                 reader.readAsDataURL(file);
//             } else {
//                 setImage(null);
//                 setImagePreview(null);
//                 onImageChange(null);
//             }
//         } catch (error) {
//             setValidationErrors(['Failed to validate image.']);
//         }
        
//         setIsValidating(false);
//     };

//     const handleDrop = (e) => {
//         e.preventDefault();
//         e.stopPropagation();
//         setDragActive(false);
//         if (e.dataTransfer.files && e.dataTransfer.files[0]) {
//             handleFileSelect(e.dataTransfer.files[0]);
//         }
//     };

//     const handleChange = (e) => {
//         e.preventDefault();
//         if (e.target.files && e.target.files[0]) {
//             handleFileSelect(e.target.files[0]);
//         }
//     };

//     const removeImage = () => {
//         setImage(null);
//         setImagePreview(null);
//         setValidationErrors([]);
//         onImageChange(null);
//         if (fileInputRef.current) {
//             fileInputRef.current.value = '';
//         }
//     };

//     return (
//         <div className="space-y-4">
//             <div className="flex justify-between items-center">
//                 <label className="block text-sm font-medium text-gray-700">
//                     Voter Photo
//                 </label>
//                 <span className="text-xs text-gray-500">Required: 4.5×3.5cm, 50-100KB, JPG/PNG</span>
//             </div>

//             {imagePreview ? (
//                 <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="relative group">
//                     <img src={imagePreview} alt="Voter preview" className="w-full max-w-sm mx-auto rounded-lg shadow-md border" />
//                     <button
//                         type="button"
//                         onClick={removeImage}
//                         className="absolute -top-2 -right-2 bg-red-600 text-white rounded-full p-1.5 shadow-lg hover:bg-red-700 transition-transform transform group-hover:scale-110"
//                         aria-label="Remove image"
//                     >
//                         <X className="w-4 h-4" />
//                     </button>
//                 </motion.div>
//             ) : (
//                 <>
//     {/* Hidden File Input */}
//     <input
//         ref={fileInputRef}
//         type="file"
//         accept="image/jpeg,image/png,image/jpg"
//         className="hidden"
//         onChange={handleChange}
//     />

//     {/* Upload Area */}
//     <div
//         onClick={() => fileInputRef.current?.click()}
//         className={`relative block w-full p-8 text-center border-2 border-dashed rounded-lg cursor-pointer transition-colors ${
//             dragActive
//                 ? "border-blue-500 bg-blue-50"
//                 : "border-gray-300 hover:border-gray-400 bg-gray-50"
//         }`}
//         onDragEnter={(e) => {
//             e.preventDefault();
//             e.stopPropagation();
//             setDragActive(true);
//         }}
//         onDragLeave={(e) => {
//             e.preventDefault();
//             e.stopPropagation();
//             setDragActive(false);
//         }}
//         onDragOver={(e) => {
//             e.preventDefault();
//             e.stopPropagation();
//         }}
//         onDrop={handleDrop}
//     >
//         <div className="flex flex-col items-center justify-center space-y-2 text-gray-500">
//             <Camera className="w-10 h-10" />
//             <p className="font-semibold">Click to upload or drag & drop</p>
//             <p className="text-xs">JPG, JPEG, PNG • 4.5cm × 3.5cm • 50-100KB</p>
//         </div>
//     </div>
// </>
//             )}

//             <AnimatePresence>
//                 {isValidating && (
//                     <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="flex items-center gap-2 text-sm text-blue-600">
//                         <Upload className="w-4 h-4 animate-pulse" /> Validating image...
//                     </motion.div>
//                 )}
//                 {validationErrors.length > 0 && (
//                     <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="p-3 bg-red-50 rounded-lg border border-red-200 space-y-1">
//                         {validationErrors.map((err, index) => (
//                             <div key={index} className="flex items-start gap-2 text-sm text-red-700">
//                                 <AlertCircle className="w-4 h-4 mt-0.5 flex-shrink-0" />
//                                 <span>{err}</span>
//                             </div>
//                         ))}
//                     </motion.div>
//                 )}
//                 {image && validationErrors.length === 0 && !isValidating && (
//                     <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="p-3 bg-green-50 rounded-lg border border-green-200 flex items-center gap-2 text-sm text-green-700">
//                         <CheckCircle className="w-4 h-4" />
//                         <span>Image is valid and ready for upload.</span>
//                     </motion.div>
//                 )}
//             </AnimatePresence>
//         </div>
//     );
// };

// export default ImageUpload;
// // import React, { useState, useRef } from 'react';
// // import { Upload, Camera, X, CheckCircle, AlertTriangle } from 'lucide-react';

// // const ImageUpload = ({ onImageUpload, existingImage = null }) => {
// //   const [preview, setPreview] = useState(existingImage);
// //   const [isValidating, setIsValidating] = useState(false);
// //   const [validationErrors, setValidationErrors] = useState([]);
// //   const [validationSuccess, setValidationSuccess] = useState(false);
// //   const fileInputRef = useRef(null);

// //   const validateImageConstraints = (file) => {
// //     const errors = [];
    
// //     // File size validation (50KB - 100KB)
// //     const sizeKB = file.size / 1024;
// //     if (sizeKB < 50) {
// //       errors.push("Image too small. Minimum 50KB required.");
// //     }
// //     if (sizeKB > 100) {
// //       errors.push("Image too large. Maximum 100KB allowed.");
// //     }
    
// //     // File format validation
// //     const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png'];
// //     if (!allowedTypes.includes(file.type)) {
// //       errors.push("Invalid format. Only JPG, JPEG, and PNG allowed.");
// //     }
    
// //     return errors;
// //   };

// //   const validateImageDimensions = (file) => {
// //     return new Promise((resolve) => {
// //       const img = new Image();
// //       img.onload = () => {
// //         const errors = [];
        
// //         // Expected dimensions: 4.5cm x 3.5cm at 300 DPI
// //         const expectedWidth = Math.round(4.5 * 300 / 2.54); // ~531px
// //         const expectedHeight = Math.round(3.5 * 300 / 2.54); // ~413px
        
// //         // Allow 10% tolerance
// //         const widthTolerance = expectedWidth * 0.1;
// //         const heightTolerance = expectedHeight * 0.1;
        
// //         if (Math.abs(img.width - expectedWidth) > widthTolerance) {
// //           errors.push(`Invalid width: ${img.width}px. Expected: ~${expectedWidth}px (4.5cm at 300 DPI)`);
// //         }
        
// //         if (Math.abs(img.height - expectedHeight) > heightTolerance) {
// //           errors.push(`Invalid height: ${img.height}px. Expected: ~${expectedHeight}px (3.5cm at 300 DPI)`);
// //         }
        
// //         resolve(errors);
// //       };
// //       img.src = URL.createObjectURL(file);
// //     });
// //   };

// //   const handleFileSelect = async (event) => {
// //     const file = event.target.files[0];
// //     if (!file) return;

// //     setIsValidating(true);
// //     setValidationErrors([]);
// //     setValidationSuccess(false);

// //     try {
// //       // Basic validations
// //       const basicErrors = validateImageConstraints(file);
      
// //       // Dimension validation
// //       const dimensionErrors = await validateImageDimensions(file);
      
// //       const allErrors = [...basicErrors, ...dimensionErrors];
      
// //       if (allErrors.length > 0) {
// //         setValidationErrors(allErrors);
// //         setPreview(null);
// //         setIsValidating(false);
// //         return;
// //       }

// //       // Convert to base64 for preview and upload
// //       const reader = new FileReader();
// //       reader.onload = (e) => {
// //         const imageData = e.target.result;
// //         setPreview(imageData);
// //         setValidationSuccess(true);
// //         setIsValidating(false);
        
// //         // Call parent callback
// //         if (onImageUpload) {
// //           onImageUpload(imageData);
// //         }
// //       };
// //       reader.readAsDataURL(file);

// //     } catch (error) {
// //       setValidationErrors([`Error processing image: ${error.message}`]);
// //       setIsValidating(false);
// //     }
// //   };

// //   const clearImage = () => {
// //     setPreview(null);
// //     setValidationErrors([]);
// //     setValidationSuccess(false);
// //     fileInputRef.current.value = '';
// //     if (onImageUpload) {
// //       onImageUpload(null);
// //     }
// //   };

// //   return (
// //     <div className="space-y-4">
// //       <div className="flex items-center justify-between">
// //         <label className="block text-sm font-medium text-gray-700">
// //           Voter Photo
// //         </label>
// //         <div className="text-xs text-gray-500">
// //           Required: 4.5×3.5cm, 50-100KB, JPG/PNG
// //         </div>
// //       </div>

// //       {/* Upload Area */}
// //       <div className="relative">
// //         {!preview ? (
// //           <div
// //             onClick={() => fileInputRef.current?.click()}
// //             className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-gray-400 cursor-pointer transition-colors"
// //           >
// //             <Camera className="w-12 h-12 text-gray-400 mx-auto mb-4" />
// //             <p className="text-sm text-gray-600 mb-2">Click to upload voter photo</p>
// //             <p className="text-xs text-gray-500">
// //               JPG, JPEG, PNG • 4.5cm × 3.5cm • 50-100KB
// //             </p>
// //           </div>
// //         ) : (
// //           <div className="relative inline-block">
// //             <img
// //               src={preview}
// //               alt="Voter preview"
// //               className="w-32 h-24 object-cover rounded-lg border-2 border-gray-300"
// //             />
// //             <button
// //               onClick={clearImage}
// //               className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600 transition-colors"
// //             >
// //               <X className="w-4 h-4" />
// //             </button>
// //           </div>
// //         )}
// //       </div>

// //       {/* Hidden File Input */}
// //       <input
// //         ref__={fileInputRef}
// //         type="file"
// //         accept="image/jpeg,image/jpg,image/png"
// //         onChange={handleFileSelect}
// //         className="hidden"
// //       />

// //       {/* Validation Status */}
// //       {isValidating && (
// //         <div className="flex items-center gap-2 text-blue-600">
// //           <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
// //           <span className="text-sm">Validating image...</span>
// //         </div>
// //       )}

// //       {validationSuccess && (
// //         <div className="flex items-center gap-2 text-green-600 bg-green-50 p-2 rounded">
// //           <CheckCircle className="w-4 h-4" />
// //           <span className="text-sm">Image validation successful!</span>
// //         </div>
// //       )}

// //       {/* Validation Errors */}
// //       {validationErrors.length > 0 && (
// //         <div className="bg-red-50 border border-red-200 rounded-lg p-3">
// //           <div className="flex items-start gap-2">
// //             <AlertTriangle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
// //             <div>
// //               <h4 className="text-sm font-medium text-red-800">Image Validation Failed</h4>
// //               <ul className="mt-1 text-xs text-red-700 list-disc list-inside">
// //                 {validationErrors.map((error, index) => (
// //                   <li key={index}>{error}</li>
// //                 ))}
// //               </ul>
// //             </div>
// //           </div>
// //         </div>
// //       )}
// //     </div>
// //   );
// // };

// // export default ImageUpload;