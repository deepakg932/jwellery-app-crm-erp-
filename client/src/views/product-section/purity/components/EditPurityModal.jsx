import React, { useState, useEffect, useRef, useCallback } from "react";
import { FiUpload, FiImage, FiX } from "react-icons/fi";

const EditPurityModal = ({ 
  show, 
  onHide, 
  onSubmit, 
  purity, 
  loading = false,
  metalOptions = [] 
}) => {
  const [purity_name, setPurityName] = useState("");
  const [metal_type, setMetalType] = useState("");
  const [percentage, setPercentage] = useState("");
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [dragActive, setDragActive] = useState(false);
  const [error, setError] = useState("");
  const fileInputRef = useRef(null);

  useEffect(() => {
    if (purity) {
      setPurityName(purity.purity_name || "");
      setMetalType(purity.metal_type || "");
      setPercentage(purity.percentage ? purity.percentage.toString() : "");
      const imageUrl = purity.imageUrl || "";
      setImagePreview(imageUrl ? imageUrl : null);
      setImageFile(null);
      setError("");
    }
  }, [purity]);

  // Handle cleanup on unmount
  useEffect(() => {
    return () => {
      // Clean up any blob URLs
      if (imageFile && imagePreview && imagePreview.startsWith('blob:')) {
        URL.revokeObjectURL(imagePreview);
      }
    };
  }, [imageFile, imagePreview]);

  const handleSubmit = useCallback(async (e) => {
    e.preventDefault();
    
    if (!purity_name.trim()) {
      setError("Please enter a purity name");
      return;
    }

    if (!metal_type.trim()) {
      setError("Please select metal type");
      return;
    }

    if (!percentage.trim()) {
      setError("Please enter percentage");
      return;
    }

    const perc = parseFloat(percentage);
    if (isNaN(perc) || perc < 0 || perc > 100) {
      setError("Percentage must be between 0 and 100");
      return;
    }

    console.log("Submitting purity update:", {
      purity_name: purity_name,
      metal_type: metal_type,
      percentage: perc,
      hasImageFile: !!imageFile,
      purityId: purity?._id,
    });

    try {
      await onSubmit({
        purity_name: purity_name,
        metal_type: metal_type,
        percentage: perc,
        imageFile: imageFile,
      });
    } catch (err) {
      console.error("Form submission error:", err);
      setError("Failed to update. Please try again.");
    }
  }, [purity_name, metal_type, percentage, imageFile, purity, onSubmit]);

  const handleImageChange = useCallback((file) => {
    if (file) {
      // Validate file size (5MB max)
      if (file.size > 5 * 1024 * 1024) {
        setError("File size should be less than 5MB");
        return;
      }
      
      // Validate file type
      if (!file.type.startsWith('image/')) {
        setError("Please upload an image file");
        return;
      }
      
      // Clean up previous blob URL if exists
      if (imageFile && imagePreview && imagePreview.startsWith('blob:')) {
        URL.revokeObjectURL(imagePreview);
      }
      
      setImageFile(file);
      const previewUrl = URL.createObjectURL(file);
      setImagePreview(previewUrl);
      setError("");
    }
  }, [imageFile, imagePreview]);

  const handleFileInput = useCallback((e) => {
    const file = e.target.files[0];
    if (file) {
      handleImageChange(file);
    }
  }, [handleImageChange]);

  const handleDrag = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  }, []);

  const handleDrop = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    const files = e.dataTransfer.files;
    if (files && files[0]) {
      handleImageChange(files[0]);
    }
  }, [handleImageChange]);

  const removeImage = useCallback(() => {
    if (imageFile && imagePreview && imagePreview.startsWith('blob:')) {
      URL.revokeObjectURL(imagePreview);
    }
    setImageFile(null);
    // Reset to original image URL if it exists
    setImagePreview(purity?.imageUrl || null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  }, [imageFile, imagePreview, purity]);

  const handleClose = useCallback(() => {
    // Clean up object URL if we created one
    if (imageFile && imagePreview && imagePreview.startsWith('blob:')) {
      URL.revokeObjectURL(imagePreview);
    }
    setImageFile(null);
    setError("");
    onHide();
  }, [imageFile, imagePreview, onHide]);

  const validatePercentage = (value) => {
    if (value === "") return true;
    const num = parseFloat(value);
    return !isNaN(num) && num >= 0 && num <= 100;
  };

  // Don't render if not shown
  if (!show) return null;

  return (
    <div className="modal fade show d-block" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }} tabIndex="-1">
      <div className="modal-dialog modal-dialog-centered">
        <div className="modal-content rounded-3">
          
          {/* Header */}
          <div className="modal-header border-bottom pb-3">
            <h5 className="modal-title fw-bold fs-5">Edit Purity</h5>
            <button
              type="button"
              className="btn-close"
              onClick={handleClose}
              disabled={loading}
              aria-label="Close"
            />
          </div>

          {/* Error Alert */}
          {error && (
            <div className="alert alert-danger m-3 py-2" role="alert">
              {error}
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit}>
            <div className="modal-body">
              
              {/* Purity Name */}
              <div className="mb-2">
                <label className="form-label fw-medium">
                  Purity Name <span className="text-danger">*</span>
                </label>
                <input
                  type="text"
                  className="form-control form-control-l"
                  value={purity_name}
                  onChange={(e) => {
                    setPurityName(e.target.value);
                    setError("");
                  }}
                  required
                  disabled={loading}
                />
              </div>

              {/* Metal Type Dropdown */}
              <div className="mb-2">
                <label className="form-label fw-medium">
                  Metal Type <span className="text-danger">*</span>
                </label>
                <select
                  className="form-select form-select-l"
                  value={metal_type}
                  onChange={(e) => {
                    setMetalType(e.target.value);
                    setError("");
                  }}
                  required
                  disabled={loading}
                >
                  <option value="">Select metal type</option>
                  {metalOptions.map((metal) => (
                    <option key={metal.id} value={metal.name}>
                      {metal.name}
                    </option>
                  ))}
                </select>
              </div>

              {/* Percentage */}
              <div className="mb-2">
                <label className="form-label fw-medium">
                  Percentage (%) <span className="text-danger">*</span>
                </label>
                <input
                  type="number"
                  className={`form-control form-control-l ${
                    percentage && !validatePercentage(percentage) ? 'is-invalid' : ''
                  }`}
                  value={percentage}
                  onChange={(e) => {
                    setPercentage(e.target.value);
                    setError("");
                  }}
                  min="0"
                  max="100"
                  step="0.1"
                  required
                  disabled={loading}
                />
                {percentage && !validatePercentage(percentage) && (
                  <div className="invalid-feedback">
                    Percentage must be between 0 and 100
                  </div>
                )}
                <small className="text-muted">
                  Enter purity percentage (0-100%)
                </small>
              </div>

              {/* Image Upload */}
              <div className="mb-2">
                <label className="form-label fw-medium">Image</label>
                
                {/* Current Image Preview */}
                {imagePreview ? (
                  <div className="mb-3 position-relative d-inline-block">
                    <img
                      src={imagePreview}
                      alt="Preview"
                      className="img-thumbnail rounded border"
                      style={{ width: '120px', height: '120px', objectFit: 'cover' }}
                      onError={(e) => {
                        // If image fails to load, show placeholder
                        e.target.style.display = 'none';
                        const parent = e.target.parentElement;
                        const placeholder = document.createElement('div');
                        placeholder.className = 'd-flex align-items-center justify-content-center rounded border';
                        placeholder.style.width = '120px';
                        placeholder.style.height = '120px';
                        placeholder.innerHTML = '<FiImage class="text-muted" size={24} />';
                        parent.appendChild(placeholder);
                      }}
                      key={`preview-${imagePreview}`}
                    />
                    {imageFile && ( // Only show remove button for newly selected image
                      <button
                        type="button"
                        onClick={removeImage}
                        className="btn btn-danger btn-sm position-absolute top-0 start-100 translate-middle rounded-circle p-1"
                        style={{ transform: 'translate(-50%, -50%)' }}
                        disabled={loading}
                        aria-label="Remove image"
                      >
                        <FiX size={12} />
                      </button>
                    )}
                    <p className="small text-muted mt-1 mb-0">
                      {imageFile ? "New image selected" : "Current image"}
                    </p>
                  </div>
                ) : (
                  <div className="mb-3 d-flex align-items-center gap-2">
                    <div
                      className="d-flex align-items-center justify-content-center rounded border"
                      style={{ width: '80px', height: '80px' }}
                    >
                      <FiImage className="text-muted" size={24} />
                    </div>
                    <p className="small text-muted mb-0">No image set</p>
                  </div>
                )}
                
                {/* Change Image Section */}
                <label className="form-label fw-medium d-block mb-2">
                  {imagePreview ? "Change Image" : "Upload Image"}
                </label>
                <div
                  className={`border-2 border-dashed rounded-3 text-center cursor-pointer ${
                    dragActive 
                      ? "border-primary bg-primary bg-opacity-10" 
                      : "border-muted hover:border-primary hover:bg-light"
                  }`}
                  onDragEnter={handleDrag}
                  onDragLeave={handleDrag}
                  onDragOver={handleDrag}
                  onDrop={handleDrop}
                  onClick={() => fileInputRef.current?.click()}
                  style={{ padding: '20px' }}
                >
                  <input
                    type="file"
                    ref={fileInputRef}
                    onChange={handleFileInput}
                    accept="image/*"
                    className="d-none"
                    disabled={loading}
                  />
                  
                  <FiImage className="mb-2 text-muted" size={24} />
                  <p className="text-muted small mb-0">
                    Drop new image here or browse
                  </p>
                  <p className="text-muted small">
                    Supports JPG, PNG, WEBP • Max 5MB
                  </p>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="modal-footer border-top pt-3">
              <button
                type="button"
                className="btn btn-outline-secondary"
                onClick={handleClose}
                disabled={loading}
              >
                Cancel
              </button>
              <button
                type="submit"
                className="btn btn-primary d-flex align-items-center gap-2"
                disabled={loading || !validatePercentage(percentage)}
              >
                {loading ? (
                  <>
                    <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                    Updating...
                  </>
                ) : (
                  <>
                    <FiUpload size={16} />
                    Update Purity
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default EditPurityModal;