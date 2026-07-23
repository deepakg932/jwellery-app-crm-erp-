import React, { useState } from "react";
import { FiUpload } from "react-icons/fi";

const AddSubCategoryForm = ({
  onClose,
  onSave,
  loading = false,
  categories = [],
}) => {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("");
  const [error, setError] = useState("");

  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (!name.trim()) {
      setError("Please enter sub-category name");
      return;
    }

    if (!selectedCategory) {
      setError("Please select a category");
      return;
    }

    onSave({
      name: name.trim(),
      description: description.trim(),
      category: selectedCategory,
    });

    // Reset form
    setName("");
    setDescription("");
    setSelectedCategory("");
    setError("");
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
            <h5 className="modal-title fw-bold fs-5">Add Sub-Category</h5>
            <button
              type="button"
              className="btn-close"
              onClick={() => {
                if (!loading) onClose();
              }}
              disabled={loading}
              aria-label="Close"
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
              {/* Category Selection */}
              <div className="mb-3">
                <label className="form-label fw-medium">
                  Category <span className="text-danger">*</span>
                </label>
                <select
                  className="form-select form-control-lg"
                  value={selectedCategory}
                  onChange={(e) => {
                    setSelectedCategory(e.target.value);
                    setError("");
                  }}
                  required
                  disabled={loading || categories.length === 0}
                >
                  <option value="">Select a category</option>
                  {categories.map((category) => (
                    <option key={category._id} value={category._id}>
                      {category.name}
                    </option>
                  ))}
                </select>
                {categories.length === 0 && (
                  <small className="text-muted">No categories available</small>
                )}
              </div>

              {/* Sub-Category Name */}
              <div className="mb-3">
                <label className="form-label fw-medium">
                  Sub-Category Name <span className="text-danger">*</span>
                </label>
                <input
                  type="text"
                  className="form-control form-control-lg"
                  placeholder="Enter sub-category name"
                  value={name}
                  onChange={(e) => {
                    setName(e.target.value);
                    setError("");
                  }}
                  required
                  disabled={loading}
                />
              </div>

              {/* Description */}
              <div className="mb-3">
                <label className="form-label fw-medium">
                  Description
                </label>
                <textarea
                  className="form-control form-control-lg"
                  placeholder="Enter sub-category description (optional)"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  rows="3"
                  disabled={loading}
                />
              </div>
            </div>

            {/* Action Buttons */}
            <div className="modal-footer border-top pt-3">
              <button
                type="button"
                className="btn btn-outline-secondary"
                onClick={() => {
                  if (!loading) onClose();
                }}
                disabled={loading}
              >
                Cancel
              </button>
              <button
                type="submit"
                className="btn btn-primary d-flex align-items-center gap-2"
                disabled={!name.trim() || !selectedCategory || loading}
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

export default AddSubCategoryForm;