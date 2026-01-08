import React, { useState, useEffect, useCallback } from "react";
import { FiUpload, FiImage, FiDollarSign } from "react-icons/fi";

const AddInventoryItemForm = ({
  onClose,
  onSave,
  loading = false,
  inventoryCategories = [],
  subCategories = [],
  suppliers = [],
}) => {
  // Main Form State
  const [formData, setFormData] = useState({
    name: "",
    purity: "",
    category: "",
    sub_category: "",
    description: "",
    discount: "0",
    tax: "0",
    purchase_price: "",
    profit_margin: "25",
    supplier: "",
    image: [],
  });

  const [errors, setErrors] = useState({});
  const [imagePreviews, setImagePreviews] = useState([]);
  const [selectedFile, setSelectedFile] = useState(null);
  const [availableSubCategories, setAvailableSubCategories] = useState([]);

  // Update available sub-categories when category changes
  useEffect(() => {
    if (formData.category) {
      const filteredSubCats = subCategories.filter(
        (sub) => sub.category_id === formData.category
      );
      setAvailableSubCategories(filteredSubCats);
      
      // Reset sub_category if it's not in the filtered list
      if (formData.sub_category && !filteredSubCats.find(sub => sub._id === formData.sub_category || sub.id === formData.sub_category)) {
        setFormData(prev => ({ ...prev, sub_category: "" }));
      }
    } else {
      setAvailableSubCategories([]);
      setFormData(prev => ({ ...prev, sub_category: "" }));
    }
  }, [formData.category, subCategories]);

  // Input sanitization function
  const sanitizeInput = (value) => {
    if (typeof value !== "string") return value;
    return value.replace(/[<>]/g, "").trim();
  };

  // Handle change for basic fields with sanitization
  const handleChange = (e) => {
    const { name, value } = e.target;

    const sanitizedValue = sanitizeInput(value);

    setFormData((prev) => ({
      ...prev,
      [name]: sanitizedValue,
    }));

    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: "" }));
    }
  };

  // Handle numeric input
  const handleNumericChange = (e) => {
    const { name, value } = e.target;

    if (value === "" || /^\d*\.?\d*$/.test(value)) {
      setFormData((prev) => ({
        ...prev,
        [name]: value,
      }));

      if (errors[name]) {
        setErrors((prev) => ({ ...prev, [name]: "" }));
      }
    }
  };

  // Handle image upload
  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      setErrors(prev => ({ ...prev, image: "Please upload an image file" }));
      return;
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      setErrors(prev => ({ ...prev, image: "Image size should be less than 5MB" }));
      return;
    }

    setSelectedFile(file);
    const previewUrl = URL.createObjectURL(file);
    setImagePreviews([previewUrl]);
    
    setFormData((prev) => ({
      ...prev,
      image: [file], // Store as array with single file
    }));

    // Clear any previous image error
    if (errors.image) {
      setErrors((prev) => ({ ...prev, image: "" }));
    }
  };

  // Remove image
  const removeImage = () => {
    if (imagePreviews[0]) {
      URL.revokeObjectURL(imagePreviews[0]);
    }
    setSelectedFile(null);
    setImagePreviews([]);
    setFormData((prev) => ({
      ...prev,
      image: [],
    }));
  };

  // Form Validation
  const validateForm = () => {
    const newErrors = {};

    // Basic Info Validation
    if (!formData.name.trim()) {
      newErrors.name = "Name is required";
    }

    if (!formData.purity.trim()) {
      newErrors.purity = "Purity is required";
    }

    if (!formData.category) {
      newErrors.category = "Category is required";
    }

    // Purchase price validation
    const purchasePrice = parseFloat(formData.purchase_price);
    if (isNaN(purchasePrice) || purchasePrice <= 0) {
      newErrors.purchase_price = "Valid purchase price required";
    }

    // Profit margin validation
    const profit = parseFloat(formData.profit_margin);
    if (isNaN(profit) || profit < 0) {
      newErrors.profit_margin = "Profit margin must be positive";
    }

    // Discount validation
    const discount = parseFloat(formData.discount);
    if (isNaN(discount) || discount < 0 || discount > 100) {
      newErrors.discount = "Discount must be between 0-100%";
    }

    // Tax validation
    const tax = parseFloat(formData.tax);
    if (isNaN(tax) || tax < 0 || tax > 100) {
      newErrors.tax = "Tax must be between 0-100%";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Form Submission
  const handleSubmit = (e) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    // Prepare payload
    const payload = {
      name: formData.name.trim(),
      purity: formData.purity.trim(),
      category: formData.category,
      sub_category: formData.sub_category || "",
      description: formData.description.trim(),
      discount: parseFloat(formData.discount) || 0,
      tax: parseFloat(formData.tax) || 0,
      purchase_price: parseFloat(formData.purchase_price) || 0,
      profit_margin: parseFloat(formData.profit_margin) || 25,
      supplier: formData.supplier || "",
      image: formData.image,
    };

    console.log("Submitting item payload:", payload);
    onSave(payload);
  };

  // Get category name for display
  const getCategoryName = (categoryId) => {
    const category = inventoryCategories.find(cat => cat._id === categoryId || cat.id === categoryId);
    return category ? category.name : "Unknown Category";
  };

  // Cleanup preview URLs on unmount
  useEffect(() => {
    return () => {
      imagePreviews.forEach(preview => {
        if (preview && preview.startsWith('blob:')) {
          URL.revokeObjectURL(preview);
        }
      });
    };
  }, [imagePreviews]);

  return (
    <div
      className="modal fade show d-block"
      style={{ backgroundColor: "rgba(0,0,0,0.5)" }}
      tabIndex="-1"
    >
      <div className="modal-dialog modal-dialog-centered modal-lg">
        <div className="modal-content rounded-3">
          <div className="modal-header border-bottom pb-3">
            <h5 className="modal-title fw-bold fs-5">
              <FiDollarSign className="me-2" />
              Add Inventory Item
            </h5>
            <button
              type="button"
              className="btn-close"
              onClick={onClose}
              disabled={loading}
              aria-label="Close"
            ></button>
          </div>

          <form onSubmit={handleSubmit}>
            <div
              className="modal-body"
              style={{ maxHeight: "calc(100vh - 200px)", overflowY: "auto" }}
            >
              {/* Basic Information Section */}
              <div className="mb-4">
                <h6 className="fw-bold text-primary mb-3">Basic Information</h6>

                <div className="row g-3">
                  <div className="col-12">
                    <label className="form-label fw-medium">
                      Name <span className="text-danger">*</span>
                    </label>
                    <input
                      type="text"
                      name="name"
                      className={`form-control ${
                        errors.name ? "is-invalid" : ""
                      }`}
                      placeholder="e.g., Gold Ring, Diamond Necklace"
                      value={formData.name}
                      onChange={handleChange}
                      disabled={loading}
                    />
                    {errors.name && (
                      <div className="invalid-feedback">{errors.name}</div>
                    )}
                  </div>

                  <div className="col-md-6">
                    <label className="form-label fw-medium">
                      Category <span className="text-danger">*</span>
                    </label>
                    <select
                      name="category"
                      className={`form-select ${
                        errors.category ? "is-invalid" : ""
                      }`}
                      value={formData.category}
                      onChange={handleChange}
                      disabled={loading}
                    >
                      <option value="">Select Category</option>
                      {inventoryCategories.map((category) => (
                        <option
                          key={category._id || category.id}
                          value={category._id || category.id}
                        >
                          {category.name}
                        </option>
                      ))}
                    </select>
                    {errors.category && (
                      <div className="invalid-feedback">{errors.category}</div>
                    )}
                    {formData.category && (
                      <small className="text-muted">
                        Selected: {getCategoryName(formData.category)}
                      </small>
                    )}
                  </div>

                  <div className="col-md-6">
                    <label className="form-label fw-medium">Sub Category</label>
                    <select
                      name="sub_category"
                      className="form-select"
                      value={formData.sub_category}
                      onChange={handleChange}
                      disabled={loading || !formData.category}
                    >
                      <option value="">Select Sub Category</option>
                      {availableSubCategories.map((subCategory) => (
                        <option
                          key={subCategory._id || subCategory.id}
                          value={subCategory._id || subCategory.id}
                        >
                          {subCategory.name}
                        </option>
                      ))}
                    </select>
                    {!formData.category && (
                      <small className="text-muted">
                        Select a category first
                      </small>
                    )}
                  </div>

                  <div className="col-md-6">
                    <label className="form-label fw-medium">
                      Purity <span className="text-danger">*</span>
                    </label>
                    <input
                      type="text"
                      name="purity"
                      className={`form-control ${
                        errors.purity ? "is-invalid" : ""
                      }`}
                      placeholder="e.g., 22K, 24K, 999, etc."
                      value={formData.purity}
                      onChange={handleChange}
                      disabled={loading}
                    />
                    {errors.purity && (
                      <div className="invalid-feedback">{errors.purity}</div>
                    )}
                  </div>

                  <div className="col-md-6">
                    <label className="form-label fw-medium">Supplier</label>
                    <select
                      name="supplier"
                      className="form-select"
                      value={formData.supplier}
                      onChange={handleChange}
                      disabled={loading}
                    >
                      <option value="">Select Supplier</option>
                      {suppliers.map((supplier) => (
                        <option
                          key={supplier._id || supplier.id}
                          value={supplier._id || supplier.id}
                        >
                          {supplier.supplier_name || supplier.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="col-12">
                    <label className="form-label fw-medium">Description</label>
                    <textarea
                      name="description"
                      className="form-control"
                      rows="3"
                      placeholder="Enter item description..."
                      value={formData.description}
                      onChange={handleChange}
                      disabled={loading}
                    />
                  </div>
                </div>
              </div>

              {/* Image Upload Section */}
              <div className="mb-4">
                <h6 className="fw-bold text-primary mb-3">Image</h6>
                <div className="row">
                  <div className="col-12">
                    <div className="border rounded p-3 text-center">
                      <input
                        type="file"
                        id="image-upload"
                        className="d-none"
                        accept="image/*"
                        onChange={handleImageUpload}
                        disabled={loading}
                      />
                      <label
                        htmlFor="image-upload"
                        className="btn btn-outline-primary mb-3"
                      >
                        <FiImage className="me-2" />
                        Upload Image
                      </label>
                      <p className="text-muted small mb-0">
                        Upload a single image of the item (Max 5MB)
                      </p>
                      {errors.image && (
                        <div className="text-danger small mt-2">{errors.image}</div>
                      )}
                    </div>
                  </div>
                </div>

                {/* Image Preview */}
                {imagePreviews.length > 0 && (
                  <div className="mt-3">
                    <div className="d-flex justify-content-center">
                      <div className="position-relative">
                        <img
                          src={imagePreviews[0]}
                          alt="Preview"
                          className="img-thumbnail"
                          style={{
                            width: "200px",
                            height: "200px",
                            objectFit: "cover",
                          }}
                        />
                        <button
                          type="button"
                          className="btn btn-sm btn-danger position-absolute top-0 end-0 rounded-circle"
                          style={{
                            width: "24px",
                            height: "24px",
                            padding: "0",
                          }}
                          onClick={removeImage}
                          disabled={loading}
                        >
                          ×
                        </button>
                      </div>
                    </div>
                    {selectedFile && (
                      <div className="text-center mt-2">
                        <small className="text-muted">
                          Selected: {selectedFile.name} ({Math.round(selectedFile.size / 1024)} KB)
                        </small>
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* Pricing Section */}
              <div className="mb-4">
                <h6 className="fw-bold text-primary mb-3">
                  Pricing Information
                </h6>

                <div className="row g-3">
                  <div className="col-md-6">
                    <label className="form-label fw-medium">
                      Purchase Price <span className="text-danger">*</span>
                    </label>
                    <div className="input-group">
                      <span className="input-group-text">₹</span>
                      <input
                        type="text"
                        name="purchase_price"
                        className={`form-control ${
                          errors.purchase_price ? "is-invalid" : ""
                        }`}
                        placeholder="e.g., 10000"
                        value={formData.purchase_price}
                        onChange={handleNumericChange}
                        disabled={loading}
                      />
                    </div>
                    {errors.purchase_price && (
                      <div className="invalid-feedback">
                        {errors.purchase_price}
                      </div>
                    )}
                  </div>

                  <div className="col-md-6">
                    <label className="form-label fw-medium">
                      Profit Margin (%) <span className="text-danger">*</span>
                    </label>
                    <div className="input-group">
                      <span className="input-group-text">%</span>
                      <input
                        type="text"
                        name="profit_margin"
                        className={`form-control ${
                          errors.profit_margin ? "is-invalid" : ""
                        }`}
                        placeholder="e.g., 25"
                        value={formData.profit_margin}
                        onChange={handleNumericChange}
                        disabled={loading}
                      />
                    </div>
                    {errors.profit_margin && (
                      <div className="invalid-feedback">
                        {errors.profit_margin}
                      </div>
                    )}
                  </div>

                  <div className="col-md-6">
                    <label className="form-label fw-medium">Discount (%)</label>
                    <div className="input-group">
                      <span className="input-group-text">%</span>
                      <input
                        type="text"
                        name="discount"
                        className={`form-control ${
                          errors.discount ? "is-invalid" : ""
                        }`}
                        placeholder="e.g., 10"
                        value={formData.discount}
                        onChange={handleNumericChange}
                        disabled={loading}
                      />
                    </div>
                    {errors.discount && (
                      <div className="invalid-feedback">{errors.discount}</div>
                    )}
                  </div>

                  <div className="col-md-6">
                    <label className="form-label fw-medium">Tax (%)</label>
                    <div className="input-group">
                      <span className="input-group-text">%</span>
                      <input
                        type="text"
                        name="tax"
                        className={`form-control ${
                          errors.tax ? "is-invalid" : ""
                        }`}
                        placeholder="e.g., 18"
                        value={formData.tax}
                        onChange={handleNumericChange}
                        disabled={loading}
                      />
                    </div>
                    {errors.tax && (
                      <div className="invalid-feedback">{errors.tax}</div>
                    )}
                  </div>
                </div>
              </div>
            </div>

            <div className="modal-footer border-top pt-3">
              <button
                type="button"
                className="btn btn-outline-secondary"
                onClick={onClose}
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
                      className="spinner-border spinner-border-sm"
                      role="status"
                      aria-hidden="true"
                    ></span>
                    Saving...
                  </>
                ) : (
                  <>
                    <FiUpload size={16} />
                    Save Item
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

export default AddInventoryItemForm;