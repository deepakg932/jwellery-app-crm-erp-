import React, { useState, useRef } from "react";
import { FiUpload, FiX, FiImage } from "react-icons/fi";

const AddPurityModal = ({ onClose, onSave, loading = false }) => {
  const [purityName, setPurityName] = useState("");
  const [stoneName, setStoneName] = useState(""); // Changed from dropdown to input
  const [metalType, setMetalType] = useState(""); // New metal type dropdown
  const [percentage, setPercentage] = useState("");
  const [image, setImage] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [dragActive, setDragActive] = useState(false);
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

  // Hardcoded stone examples for reference (optional)
  const stoneExamples = [
    "Diamond",
    "Ruby",
    "Sapphire", 
    "Emerald",
    "American Diamond (CZ)",
    "Polki",
    "Pearl",
    "Onyx",
    "Topaz",
    "Garnet"
  ];

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!purityName.trim() || !stoneName.trim() || !metalType.trim() || !percentage.trim()) return;
    
    onSave({
      name: purityName,
      stoneName: stoneName, // Direct stone name from input
      metalType: metalType, // Selected metal type from dropdown
      percentage: parseFloat(percentage),
      imageFile: image
    });
    
    // Reset form
    setPurityName("");
    setStoneName("");
    setMetalType("");
    setPercentage("");
    setImage(null);
    setImagePreview(null);
  };

  const handleImageChange = (file) => {
    if (file) {
      // Validate file size (5MB max)
      if (file.size > 5 * 1024 * 1024) {
        alert("File size should be less than 5MB");
        return;
      }
      
      // Validate file type
      if (!file.type.startsWith('image/')) {
        alert("Please upload an image file");
        return;
      }
      
      setImage(file);
      const previewUrl = URL.createObjectURL(file);
      setImagePreview(previewUrl);
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

  const removeImage = () => {
    if (imagePreview) {
      URL.revokeObjectURL(imagePreview);
    }
    setImage(null);
    setImagePreview(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleClose = () => {
    if (imagePreview) {
      URL.revokeObjectURL(imagePreview);
    }
    onClose();
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
            <h5 className="modal-title fw-bold fs-5">Add Purity</h5>
            <button
              type="button"
              className="btn-close"
              onClick={handleClose}
              disabled={loading}
            ></button>
          </div>

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
                  placeholder="e.g., 24K Gold, 925 Silver, VVS Diamond"
                  value={purityName}
                  onChange={(e) => setPurityName(e.target.value)}
                  required
                  disabled={loading}
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
                  onChange={(e) => setStoneName(e.target.value)}
                  required
                  disabled={loading}
                  list="stone-examples"
                />
                {/* Optional: Show examples as datalist */}
                <datalist id="stone-examples">
                  {stoneExamples.map((stone, index) => (
                    <option key={index} value={stone} />
                  ))}
                </datalist>
                <small className="text-muted">
                  Examples: Diamond, Ruby, Sapphire, Emerald, Pearl, etc.
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
                  onChange={(e) => setMetalType(e.target.value)}
                  required
                  disabled={loading}
                >
                  <option value="">Select metal type</option>
                  {metalTypes.map((metal, index) => (
                    <option key={index} value={metal}>
                      {metal}
                    </option>
                  ))}
                </select>
                <small className="text-muted">
                  Select the metal type for this purity
                </small>
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
                  placeholder="e.g., 99.9, 92.5, 75.0"
                  value={percentage}
                  onChange={(e) => setPercentage(e.target.value)}
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
              <div className="mb-4">
                <label className="form-label fw-medium">Purity Image</label>
                
                {/* Drag & Drop Area */}
                <div
                  className={`border-2 border-dashed rounded-3 text-center cursor-pointer ${
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
                      <FiImage className="text-secondary mb-2" size={40} />
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
                disabled={!purityName.trim() || !stoneName.trim() || !metalType.trim() || !percentage.trim() || !validatePercentage(percentage) || loading}
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