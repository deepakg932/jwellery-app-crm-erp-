import React, { useState, useEffect, useRef, useCallback } from "react";
import { FiUpload, FiImage, FiX } from "react-icons/fi";

const EditStoneForm = ({ show, onHide, onSubmit, stone, loading = false }) => {
  const [stoneData, setStoneData] = useState({
    stone_type: "",
  });

  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [dragActive, setDragActive] = useState(false);
  const [error, setError] = useState("");
  const fileInputRef = useRef(null);
  const modalRef = useRef(null);

  // Reset form when stone changes
  useEffect(() => {
    if (stone) {
      setStoneData({
        stone_type: stone.stone_type || "",
      });
      const imageUrl = stone.stone_image || "";
      setImagePreview(imageUrl ? imageUrl : null);
      setImageFile(null);
      setError("");
    }
  }, [stone]);

  // Handle cleanup on unmount
  useEffect(() => {
    return () => {
      if (imageFile && imagePreview && imagePreview.startsWith("blob:")) {
        URL.revokeObjectURL(imagePreview);
      }
    };
  }, [imageFile, imagePreview]);

  const handleSubmit = useCallback(
    async (e) => {
      e.preventDefault();

      // Validation
      if (!stoneData.stone_type.trim()) {
        setError("Please enter a stone type");
        return;
      }

      try {
        await onSubmit(stoneData, imageFile);
      } catch (err) {
        console.error("Form submission error:", err);
        setError("Failed to update. Please try again.");
      }
    },
    [stoneData, imageFile, stone, onSubmit]
  );

  const handleImageChange = useCallback(
    (file) => {
      if (file) {
        if (file.size > 5 * 1024 * 1024) {
          setError("File size should be less than 5MB");
          return;
        }

        if (!file.type.startsWith("image/")) {
          setError("Please upload an image file");
          return;
        }

        if (imageFile && imagePreview && imagePreview.startsWith("blob:")) {
          URL.revokeObjectURL(imagePreview);
        }

        setImageFile(file);
        const previewUrl = URL.createObjectURL(file);
        setImagePreview(previewUrl);
        setError("");
      }
    },
    [imageFile, imagePreview]
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
    if (imageFile && imagePreview && imagePreview.startsWith("blob:")) {
      URL.revokeObjectURL(imagePreview);
    }
    setImageFile(null);
    setImagePreview(stone?.stone_image || null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  }, [imageFile, imagePreview, stone]);

  const handleClose = useCallback(() => {
    if (imageFile && imagePreview && imagePreview.startsWith("blob:")) {
      URL.revokeObjectURL(imagePreview);
    }
    setImageFile(null);
    setError("");
    onHide();
  }, [imageFile, imagePreview, onHide]);

  const handleInputChange = useCallback((e) => {
    const { name, value } = e.target;
    setStoneData((prev) => ({
      ...prev,
      [name]: value,
    }));
    setError("");
  }, []);

  if (!show) return null;

  return (
    <div
      className="modal fade show d-block"
      style={{ backgroundColor: "rgba(0,0,0,0.5)" }}
      tabIndex="-1"
      ref={modalRef}
      onClick={(e) => {
        if (modalRef.current === e.target) {
          handleClose();
        }
      }}
    >
      <div className="modal-dialog modal-dialog-centered modal-lg">
        <div className="modal-content rounded-3">
          {/* Header */}
          <div className="modal-header border-bottom pb-3">
            <h5 className="modal-title fw-bold fs-5">Edit Stone</h5>
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
              <div className="row">
                {/* Left Column - Stone Details */}
                <div className="col-md-6">
                  {/* stone type */}
                  <div className="mb-3">
                    <label className="form-label fw-medium">
                      Stone Type <span className="text-danger">*</span>
                    </label>
                    <input
                      type="text"
                      name="stone_type"
                      className="form-control"
                      value={stoneData.stone_type}
                      onChange={handleInputChange}
                      required
                      disabled={loading}
                    />
                  </div>
                </div>

                <div className="mb-3">
                  <label className="form-label fw-medium">Stone Image</label>

                  {/* Current Image Preview */}
                  {imagePreview ? (
                    <div className="text-center">
                      <div className="position-relative d-inline-block">
                        <img
                          src={`https://cvhjrjvd-5000.inc1.devtunnels.ms${imagePreview}`}
                          alt="Preview"
                          className="img-thumbnail rounded border"
                          style={{
                            width: "200px",
                            height: "200px",
                            objectFit: "cover",
                          }}
                          onError={(e) => {
                            e.target.style.display = "none";
                            const parent = e.target.parentElement;
                            const placeholder = document.createElement("div");
                            placeholder.className =
                              "d-flex align-items-center justify-content-center rounded border";
                            placeholder.style.width = "200px";
                            placeholder.style.height = "200px";
                            placeholder.innerHTML =
                              '<FiImage class="text-muted" size={40} />';
                            parent.appendChild(placeholder);
                          }}
                          key={`preview-${imagePreview}`}
                        />
                        {imageFile && (
                          <button
                            type="button"
                            onClick={removeImage}
                            className="btn btn-danger btn-sm position-absolute top-0 start-100 translate-middle rounded-circle p-1"
                            style={{ transform: "translate(-50%, -50%)" }}
                            disabled={loading}
                            aria-label="Remove image"
                          >
                            <FiX size={12} />
                          </button>
                        )}
                      </div>
                      <p className="small text-muted mt-2 mb-0">
                        {imageFile ? "New image selected" : "Current image"}
                      </p>
                    </div>
                  ) : (
                    <div className="text-center">
                      <div
                        className="d-flex align-items-center justify-content-center rounded border mx-auto"
                        style={{ width: "200px", height: "200px" }}
                      >
                        <FiImage className="text-muted" size={40} />
                      </div>
                      <p className="small text-muted mt-2 mb-0">No image set</p>
                    </div>
                  )}

                  {/* Change Image Section */}
                  <label className="form-label fw-medium d-block mb-2 mt-3">
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
                    style={{ padding: "15px" }}
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
                disabled={loading}
              >
                {loading ? (
                  <>
                    <span
                      className="spinner-border spinner-border-sm me-2"
                      role="status"
                      aria-hidden="true"
                    ></span>
                    Updating...
                  </>
                ) : (
                  <>
                    <FiUpload size={16} />
                    Update Stone
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

export default EditStoneForm;
