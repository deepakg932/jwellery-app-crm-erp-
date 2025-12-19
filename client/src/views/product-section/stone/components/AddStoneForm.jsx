import React, { useState, useRef } from "react";
import { FiUpload, FiX, FiImage } from "react-icons/fi";

const AddStoneForm = ({ onClose, onSave, loading = false }) => {
  const [stoneData, setStoneData] = useState({
    stone_type: "",
  });

  const [image, setImage] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [dragActive, setDragActive] = useState(false);
  const fileInputRef = useRef(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    // Validate required fields
    if (!stoneData.stone_type.trim()) {
      alert("Please enter stone type");
      return;
    }

    try {
      await onSave(stoneData, image);

      // Reset form after successful save
      setStoneData({
        stone_type: "",
      });
      setImage(null);
      setImagePreview(null);
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    } catch (error) {
      console.error("Save failed:", error);
    }
  };

  const handleImageChange = (file) => {
    if (file) {
      // Validate file size (5MB max)
      if (file.size > 5 * 1024 * 1024) {
        alert("File size should be less than 5MB");
        return;
      }

      // Validate file type
      if (!file.type.startsWith("image/")) {
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

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setStoneData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  return (
    <div
      className="modal fade show d-block"
      style={{ backgroundColor: "rgba(0,0,0,0.5)" }}
      tabIndex="-1"
    >
      <div className="modal-dialog modal-dialog-centered">
        <div className="modal-content rounded-3">
          {/* Header */}
          <div className="modal-header border-bottom pb-3">
            <h5 className="modal-title fw-bold fs-5">Add New Stone</h5>
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
              <div className="row">
                {/* Left Column - Stone Details */}
                {/* stone type */}
                <div className="mb-3">
                  <label className="form-label fw-medium">
                    Stone Type <span className="text-danger">*</span>
                  </label>
                  <input
                    type="text"
                    name="stone_type"
                    className="form-control "
                    placeholder="e.g., Blue Sapphire, Diamond, Ruby"
                    value={stoneData.stone_type}
                    onChange={handleInputChange}
                    required
                    disabled={loading}
                  />
                </div>

                <div className="mb-3">
                  <label className="form-label fw-medium">Stone Image</label>

                  {/* Image Preview or Drag & Drop */}
                  {imagePreview ? (
                    <div className="text-center">
                      <div className="position-relative d-inline-block">
                        <img
                          src={imagePreview}
                          alt="Preview"
                          className="img-thumbnail rounded"
                          style={{
                            width: "200px",
                            height: "200px",
                            objectFit: "cover",
                          }}
                        />
                        <button
                          type="button"
                          onClick={removeImage}
                          className="btn btn-danger btn-sm position-absolute top-0 start-100 translate-middle rounded-circle p-1"
                          style={{ transform: "translate(-50%, -50%)" }}
                          disabled={loading}
                        >
                          <FiX size={12} />
                        </button>
                      </div>
                      <p className="text-muted small mt-2 mb-0">
                        Click or drag to change image
                      </p>
                    </div>
                  ) : (
                    <div
                      className={`border-2 border-dashed rounded-3 p-5 text-center cursor-pointer ${
                        dragActive
                          ? "border-primary bg-primary bg-opacity-10"
                          : "border-secondary-subtle"
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

                      <FiImage className="text-secondary mb-3" size={48} />
                      <p className="mb-1">
                        Drop stone image here or{" "}
                        <span className="text-primary">browse</span>
                      </p>
                      <p className="text-secondary small mb-0">
                        Supports JPG, PNG, WEBP • Max 5MB
                      </p>
                    </div>
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
                disabled={!stoneData.stone_type.trim() || loading}
              >
                {loading ? (
                  <>
                    <span
                      className="spinner-border spinner-border-sm"
                      role="status"
                      aria-hidden="true"
                    ></span>
                    Saving...
                  </>
                ) : (
                  <>
                    <FiUpload size={16} />
                    Save Stone
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

export default AddStoneForm;
