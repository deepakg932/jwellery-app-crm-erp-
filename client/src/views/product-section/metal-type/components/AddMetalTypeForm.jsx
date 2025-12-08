import React, { useState, useRef } from "react";
import { FiUpload, FiX, FiImage } from "react-icons/fi";

export default function AddMetalTypeModal({ onClose, onSave, loading = false }) {
  const [metalName, setCategoryName] = useState("");
  const [image, setImage] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [dragActive, setDragActive] = useState(false);
  const fileInputRef = useRef(null);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!metalName.trim()) return;

    onSave(metalName, image);
    setCategoryName("");
    setImage(null);
    setImagePreview(null);
  };

  const handleImageChange = (file) => {
    if (file) {
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

  return (
    <div className="modal fade show d-block" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }} tabIndex="-1">
      <div className="modal-dialog modal-dialog-centered">
        <div className="modal-content rounded-3">
          
          {/* Header */}
          <div className="modal-header border-bottom pb-3">
            <h5 className="modal-title fw-bold fs-5">Add Metal Type</h5>
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
              
              {/* Category Name */}
              <div className="mb-4">
                <label className="form-label fw-medium">
                  Metal Type Name <span className="text-danger">*</span>
                </label>
                <input
                  type="text"
                  className="form-control form-control-lg"
                  placeholder="e.g., Gold, Silver, Platinum"
                  value={metalName}
                  onChange={(e) => setCategoryName(e.target.value)}
                  required
                  disabled={loading}
                />
              </div>

              {/* Image Upload */}
              <div className="mb-4">
                <label className="form-label fw-medium">Image</label>
                
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
                disabled={!metalName.trim() || loading}
              >
                {loading ? (
                  <>
                    <span className="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span>
                    Saving...
                  </>
                ) : (
                  <>
                    <FiUpload size={16} />
                    Save Metal Type
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}