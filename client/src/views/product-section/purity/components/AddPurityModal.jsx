import React, { useState, useRef, useEffect, useCallback } from "react";
import { FiUpload, FiX, FiImage } from "react-icons/fi";

const AddPurityModal = ({ onClose, onSave, loading = false, metalOptions = [] }) => {
  const [purity_name, setPurityName] = useState("");
  const [metal_type, setMetalType] = useState("");
  const [percentage, setPercentage] = useState("");
  const [image, setImage] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [dragActive, setDragActive] = useState(false);
  const [error, setError] = useState("");
  const fileInputRef = useRef(null);

  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (!purity_name.trim()) {
      setError("Please enter purity name");
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
    
    onSave({
      purity_name: purity_name.trim(),
      metal_type: metal_type,
      percentage: perc,
      imageFile: image,
    });
    
    // Reset form
    setPurityName("");
    setMetalType("");
    setPercentage("");
    setImage(null);
    setImagePreview(null);
    setError("");
  };

  const handleImageChange = useCallback(
    (file) => {
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
        if (image && imagePreview && imagePreview.startsWith('blob:')) {
          URL.revokeObjectURL(imagePreview);
        }
        
        setImage(file);
        const previewUrl = URL.createObjectURL(file);
        setImagePreview(previewUrl);
        setError("");
      }
    },
    [image, imagePreview]
  );

  const handleFileInput = useCallback(
    (e) => {
      const file = e.target.files[0];
      if (file) {
        handleImageChange(file);
      }
    },
    [handleImageChange]
  );

  const handleDrag = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  }, []);

  const handleDrop = useCallback(
    (e) => {
      e.preventDefault();
      e.stopPropagation();
      setDragActive(false);
      
      const files = e.dataTransfer.files;
      if (files && files[0]) {
        handleImageChange(files[0]);
      }
    },
    [handleImageChange]
  );

  const removeImage = useCallback(() => {
    if (imagePreview && imagePreview.startsWith('blob:')) {
      URL.revokeObjectURL(imagePreview);
    }
    setImage(null);
    setImagePreview(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
    setError("");
  }, [imagePreview]);

  const handleClose = useCallback(() => {
    if (imagePreview && imagePreview.startsWith('blob:')) {
      URL.revokeObjectURL(imagePreview);
    }
    onClose();
  }, [imagePreview, onClose]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (imagePreview && imagePreview.startsWith('blob:')) {
        URL.revokeObjectURL(imagePreview);
      }
    };
  }, [imagePreview]);

  const validatePercentage = (value) => {
    if (value === "") return true;
    const num = parseFloat(value);
    return !isNaN(num) && num >= 0 && num <= 100;
  };

  return (
    <div className="modal fade show d-block" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }} tabIndex="-1">
      <div className="modal-dialog modal-dialog-centered">
        <div className="modal-content rounded-3">
          
          {/* Header */}
          <div className="modal-header border-bottom pb-3">
            <h5 className="modal-title fw-bold fs-5">Add Purity</h5>
            <button
              type="button"
              className="btn-close"
              onClick={handleClose}
              disabled={loading}
            ></button>
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
              <div className="mb-3">
                <label className="form-label fw-medium">
                  Purity Name <span className="text-danger">*</span>
                </label>
                <input
                  type="text"
                  className="form-control form-control-lg"
                  placeholder="e.g., 24K, 925, 18K, 22K"
                  value={purity_name}
                  onChange={(e) => {
                    setPurityName(e.target.value);
                    setError("");
                  }}
                  required
                  disabled={loading}
                />
                <small className="text-muted">
                  Enter the purity name (e.g., 24K for gold, 925 for silver)
                </small>
              </div>

              {/* Metal Type Dropdown */}
              <div className="mb-3">
                <label className="form-label fw-medium">
                  Metal Type <span className="text-danger">*</span>
                </label>
                <select
                  className="form-select form-select-lg"
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
                {metalOptions.length === 0 && !loading && (
                  <div className="form-text text-warning">
                    No metal types available. Please add metal types first.
                  </div>
                )}
              </div>

              {/* Percentage */}
              <div className="mb-3">
                <label className="form-label fw-medium">
                  Percentage (%) <span className="text-danger">*</span>
                </label>
                <input
                  type="number"
                  className={`form-control form-control-lg ${
                    percentage && !validatePercentage(percentage) ? 'is-invalid' : ''
                  }`}
                  placeholder="e.g., 99.9, 92.5, 75.0"
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
              <div className="mb-3">
                <label className="form-label fw-medium">Purity Image</label>
                
                {/* Drag & Drop Area */}
                <div
                  className={`border-2 border-dashed rounded-3 p-4 text-center cursor-pointer ${
                    dragActive ? 'border-primary bg-primary bg-opacity-10' : 'border-secondary-subtle'
                  }`}
                  onDragEnter={handleDrag}
                  onDragLeave={handleDrag}
                  onDragOver={handleDrag}
                  onDrop={handleDrop}
                  onClick={() => fileInputRef.current?.click()}
                >
                  <input
                    type="file"
                    ref={fileInputRef}
                    onChange={handleFileInput}
                    accept="image/*"
                    className="d-none"
                    disabled={loading}
                  />
                  
                  {imagePreview ? (
                    <div className="position-relative d-inline-block">
                      <img
                        src={imagePreview}
                        alt="Preview"
                        className="img-thumbnail rounded"
                        style={{ width: '120px', height: '120px', objectFit: 'cover' }}
                        key={imagePreview}
                      />
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          removeImage();
                        }}
                        className="btn btn-danger btn-sm position-absolute top-0 start-100 translate-middle rounded-circle p-1"
                        style={{ transform: 'translate(-50%, -50%)' }}
                        disabled={loading}
                      >
                        <FiX size={12} />
                      </button>
                    </div>
                  ) : (
                    <>
                      <FiImage className="text-secondary" size={40} />
                      <p className="mb-1">
                        Drop your image here or{" "}
                        <span className="text-primary">browse</span>
                      </p>
                      <p className="text-secondary small mb-0">
                        Supports JPG, PNG, WEBP • Max 5MB
                      </p>
                    </>
                  )}
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
                disabled={!purity_name.trim() || !metal_type.trim() || !percentage.trim() || !validatePercentage(percentage) || loading}
              >
                {loading ? (
                  <>
                    <span className="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span>
                    Saving...
                  </>
                ) : (
                  <>
                    <FiUpload size={16} />
                    Save Purity
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

export default AddPurityModal;