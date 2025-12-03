import React, { useState, useEffect, useRef } from "react";
import { FiUpload, FiImage } from "react-icons/fi";

const EditPurityModal = ({ show, onHide, onSubmit, purity }) => {
  const [purityName, setPurityName] = useState("");
  const [stoneName, setStoneName] = useState(""); // Changed from dropdown to input
  const [metalType, setMetalType] = useState(""); // New metal type dropdown
  const [percentage, setPercentage] = useState("");
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [dragActive, setDragActive] = useState(false);
  const [error, setError] = useState("");
  const fileInputRef = useRef(null);

  // Hardcoded metal types as per your requirement
  const metalTypes = [
    "Gold",
    "Silver", 
    "Platinum",
    "Rose Gold",
    "White Gold",
    "Titanium",
    "Stainless Steel",
    "Brass",
    "Copper"
  ];

  useEffect(() => {
    if (purity) {
      setPurityName(purity.name);
      setStoneName(purity.stoneName || "");
      setMetalType(purity.metalType || "");
      setPercentage(purity.percentage ? purity.percentage.toString() : "");
      setImagePreview(purity.image);
    }
  }, [purity]);

  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (!purityName.trim()) {
      setError("Please enter a purity name");
      return;
    }

    if (!stoneName.trim()) {
      setError("Please enter stone name");
      return;
    }

    if (!metalType.trim()) {
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
    
    const updatedPurity = {
      ...purity,
      name: purityName,
      stoneName: stoneName,
      metalType: metalType,
      percentage: perc,
      image: imageFile ? URL.createObjectURL(imageFile) : imagePreview,
    };
    
    onSubmit(updatedPurity);
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
            <h5 className="modal-title fw-bold fs-5">Edit Purity</h5>
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
              
              {/* Purity Name */}
              <div className="mb-2">
                <label className="form-label fw-medium">
                  Purity Name <span className="text-danger">*</span>
                </label>
                <input
                  type="text"
                  className="form-control form-control-l"
                  value={purityName}
                  onChange={(e) => {
                    setPurityName(e.target.value);
                    setError("");
                  }}
                  required
                />
              </div>

              {/* Stone Name - Changed from dropdown to input */}
              <div className="mb-2">
                <label className="form-label fw-medium">
                  Stone Name <span className="text-danger">*</span>
                </label>
                <input
                  type="text"
                  className="form-control form-control-l"
                  placeholder="e.g., Diamond, Ruby, Sapphire, etc."
                  value={stoneName}
                  onChange={(e) => {
                    setStoneName(e.target.value);
                    setError("");
                  }}
                  required
                />
                <small className="text-muted">
                  Enter the stone name (e.g., Diamond, Ruby, Sapphire, etc.)
                </small>
              </div>

              {/* Metal Type Dropdown - New field */}
              <div className="mb-2">
                <label className="form-label fw-medium">
                  Metal Type <span className="text-danger">*</span>
                </label>
                <select
                  className="form-select form-select-l"
                  value={metalType}
                  onChange={(e) => {
                    setMetalType(e.target.value);
                    setError("");
                  }}
                  required
                >
                  <option value="">Select metal type</option>
                  {metalTypes.map((metal, index) => (
                    <option key={index} value={metal}>
                      {metal}
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
                <label className="form-label fw-medium">Purity Image</label>
                
                {/* Current Image Preview */}
                {imagePreview ? (
                  <div className="mb-3">
                    <img
                      src={imagePreview}
                      alt="Current"
                      className="img-thumbnail rounded border"
                      style={{ width: '80px', height: '80px', objectFit: 'cover' }}
                    />
                    <p className="small text-muted mt-1 mb-0">Current image</p>
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
                  Change Image
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
              >
                Cancel
              </button>
              <button
                type="submit"
                className="btn btn-primary d-flex align-items-center gap-2"
                disabled={!validatePercentage(percentage)}
              >
                <FiUpload className="me-2" size={16} />
                Update Purity
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default EditPurityModal;