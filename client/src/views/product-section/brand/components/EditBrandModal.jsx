import React, { useState, useEffect, useRef } from "react";
import { FiUpload, FiImage } from "react-icons/fi";

const EditBrandModal = ({ show, onHide, onSubmit, brand }) => {
  const [brandName, setBrandName] = useState("");
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [dragActive, setDragActive] = useState(false);
  const [error, setError] = useState("");
  const fileInputRef = useRef(null);

  useEffect(() => {
    if (brand) {
      setBrandName(brand.name);
      setImagePreview(brand.image);
    }
  }, [brand]);

  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (!brandName.trim()) {
      setError("Please enter a brand name");
      return;
    }

    const updatedBrand = {
      ...brand,
      name: brandName,
      image: imageFile ? URL.createObjectURL(imageFile) : imagePreview,
    };
    
    onSubmit(updatedBrand);
  };

  const handleImageChange = (file) => {
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
      
      setImageFile(file);
      setImagePreview(URL.createObjectURL(file));
      setError("");
    }
  };

  const handleFileInput = (e) => {
    const file = e.target.files[0];
    if (file) {
      handleImageChange(file);
    }
  };

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    const files = e.dataTransfer.files;
    if (files && files[0]) {
      handleImageChange(files[0]);
    }
  };

  const handleClose = () => {
    // Clean up object URL if we created one
    if (imageFile && imagePreview) {
      URL.revokeObjectURL(imagePreview);
    }
    setImageFile(null);
    setError("");
    onHide();
  };

  return (
    <div className="modal fade show d-block" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }} tabIndex="-1">
      <div className="modal-dialog modal-dialog-centered">
        <div className="modal-content rounded-3">
          
          {/* Header */}
          <div className="modal-header border-bottom pb-3">
            <h5 className="modal-title fw-bold fs-5">Edit Brand</h5>
            <button
              type="button"
              className="btn-close"
              onClick={handleClose}
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
              
              {/* Brand Name */}
              <div className="mb-2">
                <label className="form-label fw-medium">
                  Brand Name <span className="text-danger">*</span>
                </label>
                <input
                  type="text"
                  className="form-control form-control-l"
                  value={brandName}
                  onChange={(e) => {
                    setBrandName(e.target.value);
                    setError("");
                  }}
                  required
                />
              </div>

              {/* Image Upload */}
              <div className="mb-2">
                <label className="form-label fw-medium">
                  Brand Logo/Image <span className="text-danger">*</span>
                </label>
                
                {/* Current Image Preview */}
                {imagePreview ? (
                  <div className="mb-3">
                    <img
                      src={imagePreview}
                      alt="Current"
                      className="img-thumbnail rounded border"
                      style={{ width: '150px', height: '150px', objectFit: 'contain' }}
                    />
                    <p className="small text-muted mt-1 mb-0">Current logo</p>
                  </div>
                ) : (
                  <div className="mb-3 d-flex align-items-center gap-2">
                    <div
                      className="d-flex align-items-center justify-content-center rounded border"
                      style={{ width: '150px', height: '150px' }}
                    >
                      <FiImage className="text-muted" size={24} />
                    </div>
                    <p className="small text-muted mb-0">No logo set</p>
                  </div>
                )}
                
                {/* Change Image Section */}
                <label className="form-label fw-medium d-block mb-2">
                  Change Logo
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
                >
                  <input
                    type="file"
                    ref={fileInputRef}
                    onChange={handleFileInput}
                    accept="image/*"
                    className="d-none"
                  />
                  
                  <FiImage className="mb-2 text-muted" size={24} />
                  <p className="text-muted small mb-0">
                    Drop new logo here or browse
                  </p>
                  <p className="text-muted small">
                    Supports JPG, PNG, WEBP • Max 5MB
                  </p>
                </div>
                <small className="text-muted d-block mt-2">
                  Recommended: 300x300px, transparent background
                </small>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="modal-footer border-top pt-3">
              <button
                type="button"
                className="btn btn-outline-secondary"
                onClick={handleClose}
              >
                Cancel
              </button>
              <button
                type="submit"
                className="btn btn-primary d-flex align-items-center gap-2"
              >
                <FiUpload className="me-2" size={16} />
                Update Brand
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default EditBrandModal;