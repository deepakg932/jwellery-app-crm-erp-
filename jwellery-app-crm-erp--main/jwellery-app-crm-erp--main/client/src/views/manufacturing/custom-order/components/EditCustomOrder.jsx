import React, { useState, useEffect } from "react";
import { FiUpload, FiPlus, FiTrash2, FiEye, FiEdit2 } from "react-icons/fi";
import AddCustomerForm from "@/views/user/customer/components/AddCustomerForm";

const EditCustomOrder = ({
  order,
  onClose,
  onSave,
  loading = false,
  customers = [],
  customerGroups = [],
  metalTypes = [],
  purities = [],
  units = [],
  onAddCustomer,
}) => {
  const [formData, setFormData] = useState({
    customer_id: "",
    customer_name: "",
    customer_mobile: "",
    weight: "",
    unit_id: "",
    metal_type_id: "",
    purity_id: "",
    delivery_date: "",
    status: "pending",
    notes: "",
    images: [],
  });

  console.log("Edit order data:", order);

  const [errors, setErrors] = useState({});
  const [showCustomerModal, setShowCustomerModal] = useState(false);
  const [addingCustomer, setAddingCustomer] = useState(false);
  const [previewImages, setPreviewImages] = useState([]);
  const [existingImages, setExistingImages] = useState([]);

  console.log(order)

  // Initialize form when component mounts or order changes
  useEffect(() => {
    if (order) {
      const images = order.images || [];
      const existingImageUrls = images
        .filter(img => typeof img === 'string' || img.url)
        .map((img, index) => ({
          url: typeof img === 'string' ? img : img.url,
          name: img.name || `existing-image-${index}.jpg`,
          isExisting: true
        }));

      setFormData({
        customer_id: order.customer_id || "",
        customer_name: order.customer_name || "",
        customer_mobile: order.customer_mobile || "",
        weight: order.weight || "",
        unit_id: order.unit_id || "",
        metal_type_id: order.metal_type_id || "",
        purity_id: order.purity_id || "",
        delivery_date: order.delivery_date
          ? new Date(order.delivery_date).toISOString().split("T")[0]
          : "",
        status: order.status || "pending",
        notes: order.notes || "",
        images: [],
      });

      setExistingImages(existingImageUrls);
      setPreviewImages([]);
    }
  }, [order]);

  const handleMetalTypeChange = (metalTypeId) => {
    setFormData((prev) => ({
      ...prev,
      metal_type_id: metalTypeId,
      purity_id: "",
    }));
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.customer_id) {
      newErrors.customer_id = "Customer is required";
    }

    if (
      !formData.weight ||
      isNaN(formData.weight) ||
      parseFloat(formData.weight) <= 0
    ) {
      newErrors.weight = "Valid weight is required";
    }

    if (!formData.unit_id) {
      newErrors.unit_id = "Unit is required";
    }

    if (!formData.metal_type_id) {
      newErrors.metal_type_id = "Metal type is required";
    }

    if (!formData.purity_id) {
      newErrors.purity_id = "Purity is required";
    }

    if (!formData.delivery_date) {
      newErrors.delivery_date = "Delivery date is required";
    }

    if (!formData.status?.trim()) {
      newErrors.status = "Status is required";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    console.log("Edit form submitted", formData);
    
    if (!validateForm()) {
      console.log("Validation failed", errors);
      return;
    }

    try {
      const formDataToSend = new FormData();

      formDataToSend.append("customer_id", formData.customer_id);
      formDataToSend.append("weight", parseFloat(formData.weight));
      formDataToSend.append("unit_id", formData.unit_id);
      formDataToSend.append("metal_type_id", formData.metal_type_id);
      formDataToSend.append("purity_id", formData.purity_id);
      formDataToSend.append("delivery_date", formData.delivery_date);
      formDataToSend.append("status", formData.status);
      formDataToSend.append("notes", formData.notes || "");

      // Append new images as files
      previewImages.forEach((image) => {
        if (image.file) {
          formDataToSend.append(`images`, image.file);
        }
      });

      // Add existing images if any
      if (existingImages.length > 0) {
        formDataToSend.append("existingImages", JSON.stringify(existingImages.map(img => img.url)));
      }

      const payload = {
        customer_id: formData.customer_id,
        weight: parseFloat(formData.weight),
        unit_id: formData.unit_id,
        metal_type_id: formData.metal_type_id,
        purity_id: formData.purity_id,
        delivery_date: formData.delivery_date,
        status: formData.status,
        notes: formData.notes || "",
        images: formDataToSend,
        existingImages: existingImages.map((img) => img.url),
      };

      // Add the order ID for update
      if (order) {
        payload.id = order._id;
      }

      console.log("Final payload to update:", {
        ...payload,
        images: `FormData with ${previewImages.length} files`
      });

      await onSave(payload);
    } catch (error) {
      console.error("Form submission error:", error);
      alert("Failed to update order. Please check the console for details.");
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;

    if (name === "metal_type_id") {
      handleMetalTypeChange(value);
    } else {
      setFormData((prev) => ({
        ...prev,
        [name]: value,
      }));
    }

    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: "" }));
    }
  };

  const handleCustomerSelect = (customerId) => {
    const selectedCustomer = customers.find((c) => c._id === customerId);
    if (selectedCustomer) {
      setFormData((prev) => ({
        ...prev,
        customer_id: selectedCustomer._id,
        customer_name: selectedCustomer.name,
        customer_mobile:
          selectedCustomer.mobile || selectedCustomer.phone || "",
      }));
    }
  };

  // Image handling functions
  const handleImageUpload = (e) => {
    const files = Array.from(e.target.files);

    if (files.length > 0) {
      const newPreviewImages = [];

      files.forEach((file) => {
        if (!file.type.match("image.*")) {
          alert(`${file.name} is not an image file`);
          return;
        }

        if (file.size > 5 * 1024 * 1024) {
          alert(`${file.name} is too large. Max size is 5MB`);
          return;
        }

        const newImage = {
          id: Date.now() + Math.random(),
          file: file,
          url: URL.createObjectURL(file),
          name: file.name,
          size: file.size,
          type: file.type,
          isNew: true
        };

        newPreviewImages.push(newImage);
      });

      if (newPreviewImages.length > 0) {
        setPreviewImages((prev) => [...prev, ...newPreviewImages]);
      }

      e.target.value = "";
    }
  };

  const removeImage = (id) => {
    const imageToRemove = previewImages.find(img => img.id === id);
    
    if (imageToRemove && imageToRemove.isNew) {
      URL.revokeObjectURL(imageToRemove.url);
    }
    
    setPreviewImages((prev) => prev.filter((img) => img.id !== id));
  };

  const removeExistingImage = (url) => {
    setExistingImages((prev) => prev.filter((img) => img.url !== url));
  };

  // Handle customer addition
  const handleAddCustomer = async (customerData) => {
    try {
      setAddingCustomer(true);

      if (onAddCustomer) {
        const response = await onAddCustomer(customerData);

        if (response) {
          setFormData((prev) => ({
            ...prev,
            customer_id: response._id,
            customer_name: response.name,
            customer_mobile: response.mobile || "",
          }));

          setShowCustomerModal(false);
          return true;
        }
      }
      return false;
    } catch (error) {
      console.error("Failed to add customer:", error);
      return false;
    } finally {
      setAddingCustomer(false);
    }
  };

  const handleClose = () => {
    previewImages.forEach(image => {
      if (image.isNew) {
        URL.revokeObjectURL(image.url);
      }
    });
    
    setFormData({
      customer_id: "",
      customer_name: "",
      customer_mobile: "",
      weight: "",
      unit_id: "",
      metal_type_id: "",
      purity_id: "",
      delivery_date: "",
      status: "pending",
      notes: "",
      images: [],
    });
    setPreviewImages([]);
    setExistingImages([]);
    setErrors({});
    onClose();
  };

  // Get selected unit for display
  const selectedUnit = units.find((unit) => unit._id === formData.unit_id);

  // Image preview modal state
  const [previewModalOpen, setPreviewModalOpen] = useState(false);
  const [selectedImage, setSelectedImage] = useState(null);

  const openImagePreview = (image) => {
    setSelectedImage(image);
    setPreviewModalOpen(true);
  };

  const allImages = [...existingImages, ...previewImages];

  return (
    <>
      <div
        className="modal fade show d-block"
        style={{ backgroundColor: "rgba(0,0,0,0.5)" }}
        tabIndex="-1"
      >
        <div className="modal-dialog modal-dialog-centered modal-lg">
          <div className="modal-content rounded-3">
            <div className="modal-header border-bottom pb-3">
              <h5 className="modal-title fw-bold fs-5">
                <FiEdit2 className="me-2" />
                Edit Custom Order
              </h5>
              <button
                type="button"
                className="btn-close"
                onClick={handleClose}
                disabled={loading}
                aria-label="Close"
              ></button>
            </div>

            <form onSubmit={handleSubmit}>
              <div className="modal-body">
                <div className="row">
                  {/* Order Information */}
                  <div className="col-12 mb-3">
                    <div className="card bg-light">
                      <div className="card-body">
                        <div className="row">
                          <div className="col-md-6">
                            <p className="mb-1">
                              <strong>Order Number:</strong> {order?.order_number}
                            </p>
                            <p className="mb-1">
                              <strong>Created:</strong> {order?.created_at ? new Date(order.created_at).toLocaleDateString() : 'N/A'}
                            </p>
                          </div>
                          <div className="col-md-6">
                            <p className="mb-1">
                              <strong>Last Updated:</strong> {order?.updated_at ? new Date(order.updated_at).toLocaleDateString() : 'N/A'}
                            </p>
                            <p className="mb-1">
                              <strong>Current Status:</strong>{" "}
                              <span className={`badge bg-${order?.status === 'completed' ? 'success' : order?.status === 'cancelled' ? 'danger' : 'warning'}`}>
                                {order?.status || 'N/A'}
                              </span>
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Customer Selection */}
                  <div className="col-md-6 mb-3">
                    <label className="form-label fw-medium">
                      Customer <span className="text-danger">*</span>
                    </label>
                    <div className="input-group">
                      <select
                        name="customer_id"
                        className={`form-control form-control-lg ${
                          errors.customer_id ? "is-invalid" : ""
                        }`}
                        value={formData.customer_id}
                        onChange={(e) => handleCustomerSelect(e.target.value)}
                        disabled={loading || customers.length === 0}
                      >
                        <option value="">Select Customer</option>
                        {customers.map((customer) => (
                          <option key={customer._id} value={customer._id}>
                            {customer.name} -{" "}
                            {customer.mobile || customer.phone || ""}
                          </option>
                        ))}
                      </select>
                      <button
                        type="button"
                        className="btn btn-outline-primary"
                        onClick={() => setShowCustomerModal(true)}
                        disabled={loading}
                      >
                        <FiPlus size={18} />
                      </button>
                    </div>
                    {errors.customer_id && (
                      <div className="invalid-feedback d-block">
                        {errors.customer_id}
                      </div>
                    )}
                    {formData.customer_name && (
                      <div className="form-text">
                        Selected: {formData.customer_name} (
                        {formData.customer_mobile})
                      </div>
                    )}
                  </div>

                  {/* Weight */}
                  <div className="col-md-6 mb-3">
                    <label className="form-label fw-medium">
                      Weight <span className="text-danger">*</span>
                    </label>
                    <div className="input-group">
                      <input
                        type="number"
                        name="weight"
                        className={`form-control form-control-lg ${
                          errors.weight ? "is-invalid" : ""
                        }`}
                        placeholder="Enter weight"
                        value={formData.weight}
                        onChange={handleChange}
                        disabled={loading}
                        step="0.001"
                        min="0"
                      />
                      <select
                        name="unit_id"
                        className={`form-control form-control-lg ${
                          errors.unit_id ? "is-invalid" : ""
                        }`}
                        value={formData.unit_id}
                        onChange={handleChange}
                        disabled={loading || units.length === 0}
                        style={{ maxWidth: "150px" }}
                      >
                        <option value="">Select Unit</option>
                        {units
                          .filter((unit) => unit.is_active)
                          .map((unit) => (
                            <option key={unit._id} value={unit._id}>
                              {unit.code} ({unit.name})
                            </option>
                          ))}
                      </select>
                    </div>
                    {errors.weight && (
                      <div className="invalid-feedback">{errors.weight}</div>
                    )}
                    {errors.unit_id && (
                      <div className="invalid-feedback">{errors.unit_id}</div>
                    )}
                    {selectedUnit && (
                      <div className="form-text">
                        Unit: {selectedUnit.name} ({selectedUnit.code})
                      </div>
                    )}
                  </div>

                  {/* Metal Type - ADDED */}
                  <div className="col-md-6 mb-3">
                    <label className="form-label fw-medium">
                      Metal Type <span className="text-danger">*</span>
                    </label>
                    <select
                      name="metal_type_id"
                      className={`form-control form-control-lg ${
                        errors.metal_type_id ? "is-invalid" : ""
                      }`}
                      value={formData.metal_type_id}
                      onChange={handleChange}
                      disabled={loading || metalTypes.length === 0}
                    >
                      <option value="">Select Metal Type</option>
                      {metalTypes
                        .filter((metal) => metal.is_active)
                        .map((metal) => (
                          <option key={metal._id} value={metal._id}>
                            {metal.name} {metal.code ? `(${metal.code})` : ""}
                          </option>
                        ))}
                    </select>
                    {errors.metal_type_id && (
                      <div className="invalid-feedback d-block">
                        {errors.metal_type_id}
                      </div>
                    )}
                  </div>

                  {/* Purity - UPDATED to use purity_id */}
                  <div className="col-md-6 mb-3">
                    <label className="form-label fw-medium">
                      Purity <span className="text-danger">*</span>
                    </label>
                    <select
                      name="purity_id"
                      className={`form-control form-control-lg ${
                        errors.purity_id ? "is-invalid" : ""
                      }`}
                      value={formData.purity_id}
                      onChange={handleChange}
                      disabled={loading}
                    >
                      <option value="">Select Purity</option>
                      {purities.map((purity) => (
                        <option key={purity._id} value={purity._id}>
                          {purity.purity_name}
                        </option>
                      ))}
                    </select>
                    {errors.purity_id && (
                      <div className="invalid-feedback d-block">
                        {errors.purity_id}
                      </div>
                    )}
                  </div>

                  {/* Delivery Date */}
                  <div className="col-md-6 mb-3">
                    <label className="form-label fw-medium">
                      Delivery Date <span className="text-danger">*</span>
                    </label>
                    <input
                      type="date"
                      name="delivery_date"
                      className={`form-control form-control-lg ${
                        errors.delivery_date ? "is-invalid" : ""
                      }`}
                      value={formData.delivery_date}
                      onChange={handleChange}
                      disabled={loading}
                      min={new Date().toISOString().split("T")[0]}
                    />
                    {errors.delivery_date && (
                      <div className="invalid-feedback">
                        {errors.delivery_date}
                      </div>
                    )}
                    <div className="form-text">
                      Estimated delivery date for the custom order
                    </div>
                  </div>

                  {/* Status */}
                  <div className="col-md-6 mb-3">
                    <label className="form-label fw-medium">
                      Status <span className="text-danger">*</span>
                    </label>
                    <select
                      name="status"
                      className={`form-control form-control-lg ${
                        errors.status ? "is-invalid" : ""
                      }`}
                      value={formData.status}
                      onChange={handleChange}
                      disabled={loading}
                    >
                      <option value="pending">Pending</option>
                      <option value="design">Design Phase</option>
                      <option value="making">Making Phase</option>
                      <option value="stone_setting">Stone Setting</option>
                      <option value="polishing">Polishing</option>
                      <option value="quality_check">Quality Check</option>
                      <option value="ready">Ready for Delivery</option>
                      <option value="completed">Completed</option>
                      <option value="cancelled">Cancelled</option>
                    </select>
                    {errors.status && (
                      <div className="invalid-feedback">{errors.status}</div>
                    )}
                  </div>

                  {/* Image Upload */}
                  <div className="col-12 mb-3">
                    <label className="form-label fw-medium">
                      Design Images{" "}
                      <span className="text-muted">(Optional)</span>
                    </label>

                    {/* File input */}
                    <div className="mb-3">
                      <input
                        type="file"
                        id="image-upload"
                        className="form-control"
                        accept="image/*"
                        multiple
                        onChange={handleImageUpload}
                        disabled={loading}
                        style={{ display: "none" }}
                      />
                      <label
                        htmlFor="image-upload"
                        className="btn btn-outline-secondary d-flex align-items-center gap-2 w-100"
                        style={{ cursor: "pointer" }}
                      >
                        <FiUpload size={16} />
                        {existingImages.length > 0 ? "Add More Images" : "Upload Design Images"}
                      </label>
                      <div className="form-text">
                        Upload additional reference images, design sketches, or inspiration
                        photos (Max 5MB per image)
                      </div>
                    </div>

                    {/* Image preview grid */}
                    {allImages.length > 0 && (
                      <div className="border rounded p-3">
                        <h6 className="mb-3">
                          Images ({allImages.length})
                          {existingImages.length > 0 && (
                            <small className="text-muted ms-2">
                              ({existingImages.length} existing, {previewImages.length} new)
                            </small>
                          )}
                        </h6>
                        <div className="row row-cols-2 row-cols-md-3 g-3">
                          {allImages.map((image, index) => (
                            <div key={image.id || image.url} className="col">
                              <div className="card h-100">
                                <div className="position-relative">
                                  <img
                                    src={image.url}
                                    alt={image.name}
                                    className="card-img-top"
                                    style={{
                                      height: "120px",
                                      objectFit: "cover",
                                      cursor: "pointer",
                                    }}
                                    onClick={() => openImagePreview(image)}
                                  />
                                  <button
                                    type="button"
                                    className="btn btn-danger btn-sm position-absolute top-0 end-0 m-1"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      if (image.isExisting) {
                                        removeExistingImage(image.url);
                                      } else {
                                        removeImage(image.id);
                                      }
                                    }}
                                    disabled={loading}
                                  >
                                    <FiTrash2 size={12} />
                                  </button>
                                  <button
                                    type="button"
                                    className="btn btn-info btn-sm position-absolute top-0 start-0 m-1"
                                    onClick={() => openImagePreview(image)}
                                    disabled={loading}
                                  >
                                    <FiEye size={12} />
                                  </button>
                                  {image.isExisting && (
                                    <span className="position-absolute bottom-0 start-0 m-1 badge bg-success">
                                      Existing
                                    </span>
                                  )}
                                </div>
                                <div className="card-body p-2">
                                  <small className="text-muted d-block text-truncate">
                                    {image.name}
                                  </small>
                                  <small className="text-muted">
                                    {image.size ? `${(image.size / 1024).toFixed(2)} KB` : 'Uploaded'}
                                  </small>
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Additional Notes */}
                  <div className="col-12 mb-3">
                    <label className="form-label fw-medium">
                      Additional Notes
                    </label>
                    <textarea
                      name="notes"
                      className="form-control form-control-lg"
                      placeholder="Enter any special requirements, design specifications, or additional notes..."
                      value={formData.notes}
                      onChange={handleChange}
                      disabled={loading}
                      rows="3"
                    />
                    <div className="form-text">
                      Add design specifications, special requirements, or any
                      other details
                    </div>
                  </div>
                </div>
              </div>

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
                        className="spinner-border spinner-border-sm"
                        role="status"
                        aria-hidden="true"
                      ></span>
                      Updating...
                    </>
                  ) : (
                    <>
                      <FiEdit2 size={16} />
                      Update Order
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>

      {/* Add Customer Modal */}
      {showCustomerModal && (
        <AddCustomerForm
          onClose={() => setShowCustomerModal(false)}
          onSave={handleAddCustomer}
          loading={addingCustomer}
          customerGroups={customerGroups}
        />
      )}

      {/* Image Preview Modal */}
      {previewModalOpen && selectedImage && (
        <div
          className="modal fade show d-block"
          style={{ backgroundColor: "rgba(0,0,0,0.8)" }}
          tabIndex="-1"
        >
          <div className="modal-dialog modal-dialog-centered modal-xl">
            <div className="modal-content bg-transparent border-0">
              <div className="modal-header border-0">
                <button
                  type="button"
                  className="btn-close btn-close-white"
                  onClick={() => setPreviewModalOpen(false)}
                  aria-label="Close"
                ></button>
              </div>
              <div className="modal-body text-center">
                <img
                  src={selectedImage.url}
                  alt={selectedImage.name}
                  className="img-fluid rounded"
                  style={{ maxHeight: "70vh" }}
                />
                <div className="mt-3 text-white">
                  <p className="mb-0">{selectedImage.name}</p>
                  <small>{selectedImage.size ? `${(selectedImage.size / 1024).toFixed(2)} KB` : 'Uploaded'}</small>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default EditCustomOrder;