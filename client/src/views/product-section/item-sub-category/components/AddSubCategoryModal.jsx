import React, { useState, useRef } from "react";
import { FiUpload, FiX, FiImage } from "react-icons/fi";

const AddSubCategoryModal = ({ onClose, onSave, loading = false, categories = [] }) => {
  const [subCategoryName, setSubCategoryName] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("");
  const [image, setImage] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [dragActive, setDragActive] = useState(false);
  const fileInputRef = useRef(null);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!subCategoryName.trim() || !selectedCategory.trim()) return;

    const selectedCat = categories.find(cat => cat.id === parseInt(selectedCategory));
    
    onSave({
      name: subCategoryName,
      categoryId: selectedCategory,
      categoryName: selectedCat ? selectedCat.name : '',
      imageFile: image
    });
    
    // Reset form
    setSubCategoryName("");
    setSelectedCategory("");
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

  return (
    <div className="modal fade show d-block" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }} tabIndex="-1">
      <div className="modal-dialog modal-dialog-centered">
        <div className="modal-content rounded-3">
          
          {/* Header */}
          <div className="modal-header border-bottom pb-3">
            <h5 className="modal-title fw-bold fs-5">Add Sub-Category</h5>
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
              
              {/* Sub-Category Name */}
              <div className="mb-2">
                <label className="form-label fw-medium">
                  Sub-Category Name <span className="text-danger">*</span>
                </label>
                <input
                  type="text"
                  className="form-control form-control-l"
                  placeholder="e.g., Diamond Rings, Gold Chains, Silver Bangles"
                  value={subCategoryName}
                  onChange={(e) => setSubCategoryName(e.target.value)}
                  required
                  disabled={loading}
                />
              </div>

              {/* Parent Category Dropdown */}
              <div className="mb-2">
                <label className="form-label fw-medium">
                  Parent Category <span className="text-danger">*</span>
                </label>
                <select
                  className="form-select form-select-l"
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                  required
                  disabled={loading}
                >
                  <option value="">Select parent category</option>
                  {categories.map((category) => (
                    <option key={category.id} value={category.id}>
                      {category.name}
                    </option>
                  ))}
                </select>
              </div>

              {/* Image Upload */}
              <div className="mb-2">
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
                      <FiImage className="text-secondary " size={40} />
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
                disabled={!subCategoryName.trim() || !selectedCategory.trim() || loading}
              >
                {loading ? (
                  <>
                    <span className="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span>
                    Saving...
                  </>
                ) : (
                  <>
                    <FiUpload size={16} />
                    Save Sub-Category
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

export default AddSubCategoryModal;