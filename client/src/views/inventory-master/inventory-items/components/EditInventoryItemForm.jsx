import React, { useState, useEffect } from "react";
import { FiUpload } from "react-icons/fi";

const EditInventoryItemForm = ({
  onClose,
  onSave,
  loading = false,
  inventoryCategories = [],
  units = [],
  products = [],
  item,
}) => {
  const [formData, setFormData] = useState({
    item_name: "",
    inventory_category_id: "",
    product_id: "",
    track_by: "weight",
    weight: "",
    quantity: "",
    unit_id: "",
    status: true,
  });
  
  const [errors, setErrors] = useState({});

  // Helper function to get ID (same as add form)
  const getId = (item) => item._id || item.id;

  useEffect(() => {
    if (item) {
      console.log("Received item data:", item);
      
      // Extract IDs from nested objects
      const inventoryCategoryId = item.inventory_category_id?._id || item.inventory_category_id || "";
      const productId = item.product_id?._id || item.product_id || "";
      const unitId = item.unit_id?._id || item.unit_id || "";
      
      setFormData({
        item_name: item.item_name || "",
        inventory_category_id: inventoryCategoryId,
        product_id: productId,
        track_by: item.track_by || "weight",
        weight: item.weight !== null && item.weight !== undefined ? item.weight.toString() : "",
        quantity: item.quantity !== null && item.quantity !== undefined ? item.quantity.toString() : "",
        unit_id: unitId,
        status: item.status !== false,
      });
      setErrors({});
    }
  }, [item]);

  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.item_name.trim()) {
      newErrors.item_name = "Item name is required";
    }
    
    if (!formData.inventory_category_id) {
      newErrors.inventory_category_id = "Inventory category is required";
    }
    
    // Unit is required when track_by is weight or both
    if ((formData.track_by === "weight" || formData.track_by === "both") && !formData.unit_id) {
      newErrors.unit_id = "Unit is required";
    }
    
    if (formData.track_by === "weight" || formData.track_by === "both") {
      if (!formData.weight || parseFloat(formData.weight) <= 0) {
        newErrors.weight = "Weight must be greater than 0";
      }
    }
    
    if (formData.track_by === "quantity" || formData.track_by === "both") {
      if (!formData.quantity || parseInt(formData.quantity) <= 0) {
        newErrors.quantity = "Quantity must be greater than 0";
      }
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }
    
    console.log("Form data before submission:", formData);
    
    const payload = {
      item_name: formData.item_name.trim(),
      inventory_category_id: formData.inventory_category_id,
      product_id: formData.product_id || null,
      track_by: formData.track_by,
      weight: formData.track_by === "quantity" ? null : parseFloat(formData.weight) || null,
      quantity: formData.track_by === "weight" ? null : parseInt(formData.quantity) || null,
      unit_id: formData.unit_id,
      status: formData.status
    };
    
    console.log("Updating inventory item payload:", payload);
    onSave(payload);
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    
    console.log(`Field ${name} changed to:`, value);
    
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
    
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ""
      }));
    }
  };

  const handleClose = () => {
    if (!loading) onClose();
  };

  return (
    <div
      className="modal fade show d-block"
      style={{ backgroundColor: "rgba(0,0,0,0.5)" }}
      tabIndex="-1"
    >
      <div className="modal-dialog modal-dialog-centered">
        <div className="modal-content rounded-3">
          <div className="modal-header border-bottom pb-3">
            <h5 className="modal-title fw-bold fs-5">Edit Inventory Item</h5>
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
              {/* Item Name */}
              <div className="mb-3">
                <label className="form-label fw-medium">
                  Item Name <span className="text-danger">*</span>
                </label>
                <input
                  type="text"
                  name="item_name"
                  className={`form-control form-control-lg ${errors.item_name ? 'is-invalid' : ''}`}
                  placeholder="Enter item name"
                  value={formData.item_name}
                  onChange={handleChange}
                  disabled={loading}
                />
                {errors.item_name && (
                  <div className="invalid-feedback">{errors.item_name}</div>
                )}
              </div>

              {/* Inventory Category Dropdown */}
              <div className="mb-3">
                <label className="form-label fw-medium">
                  Inventory Category <span className="text-danger">*</span>
                </label>
                <select
                  name="inventory_category_id"
                  className={`form-select form-select-lg ${errors.inventory_category_id ? 'is-invalid' : ''}`}
                  value={formData.inventory_category_id}
                  onChange={handleChange}
                  disabled={loading || inventoryCategories.length === 0}
                >
                  <option value="">Select Inventory Category</option>
                  {inventoryCategories.map((category) => (
                    <option 
                      key={`category-${getId(category)}`} 
                      value={getId(category)}
                    >
                      {category.name}
                    </option>
                  ))}
                </select>
                {errors.inventory_category_id && (
                  <div className="invalid-feedback">{errors.inventory_category_id}</div>
                )}
                {inventoryCategories.length === 0 && !loading && (
                  <div className="form-text text-warning">
                    No inventory categories available.
                  </div>
                )}
              </div>

              {/* Product Link (Optional) */}
              <div className="mb-3">
                <label className="form-label fw-medium">Product (Optional)</label>
                <select
                  name="product_id"
                  className="form-select form-select-lg"
                  value={formData.product_id}
                  onChange={handleChange}
                  disabled={loading}
                >
                  <option value="">Select Product (Optional)</option>
                  {products.map((product) => (
                    <option 
                      key={`product-${getId(product)}`} 
                      value={getId(product)}
                    >
                      {product.product_name || product.name}
                    </option>
                  ))}
                </select>
              </div>

              {/* Track By */}
              <div className="mb-3">
                <label className="form-label fw-medium">
                  Track By <span className="text-danger">*</span>
                </label>
                <div className="d-flex gap-3">
                  <div className="form-check">
                    <input
                      className="form-check-input"
                      type="radio"
                      name="track_by"
                      id="editTrackWeight"
                      value="weight"
                      checked={formData.track_by === "weight"}
                      onChange={handleChange}
                      disabled={loading}
                    />
                    <label className="form-check-label" htmlFor="editTrackWeight">
                      Weight
                    </label>
                  </div>
                  <div className="form-check">
                    <input
                      className="form-check-input"
                      type="radio"
                      name="track_by"
                      id="editTrackQuantity"
                      value="quantity"
                      checked={formData.track_by === "quantity"}
                      onChange={handleChange}
                      disabled={loading}
                    />
                    <label className="form-check-label" htmlFor="editTrackQuantity">
                      Quantity
                    </label>
                  </div>
                  <div className="form-check">
                    <input
                      className="form-check-input"
                      type="radio"
                      name="track_by"
                      id="editTrackBoth"
                      value="both"
                      checked={formData.track_by === "both"}
                      onChange={handleChange}
                      disabled={loading}
                    />
                    <label className="form-check-label" htmlFor="editTrackBoth">
                      Both
                    </label>
                  </div>
                </div>
              </div>

              {/* Weight (conditional) */}
              {(formData.track_by === "weight" || formData.track_by === "both") && (
                <div className="mb-3">
                  <label className="form-label fw-medium">
                    Weight {formData.track_by === "both" && <span className="text-danger">*</span>}
                  </label>
                  <input
                    type="number"
                    name="weight"
                    step="0.01"
                    min="0"
                    className={`form-control form-control-lg ${errors.weight ? 'is-invalid' : ''}`}
                    placeholder="Enter weight"
                    value={formData.weight}
                    onChange={handleChange}
                    disabled={loading}
                  />
                  {errors.weight && (
                    <div className="invalid-feedback">{errors.weight}</div>
                  )}
                </div>
              )}

              {/* Quantity (conditional) */}
              {(formData.track_by === "quantity" || formData.track_by === "both") && (
                <div className="mb-3">
                  <label className="form-label fw-medium">
                    Quantity {formData.track_by === "both" && <span className="text-danger">*</span>}
                  </label>
                  <input
                    type="number"
                    name="quantity"
                    min="0"
                    className={`form-control form-control-lg ${errors.quantity ? 'is-invalid' : ''}`}
                    placeholder="Enter quantity"
                    value={formData.quantity}
                    onChange={handleChange}
                    disabled={loading}
                  />
                  {errors.quantity && (
                    <div className="invalid-feedback">{errors.quantity}</div>
                  )}
                </div>
              )}

              {/* Unit Dropdown - Conditionally shown based on track_by */}
              {(formData.track_by === "weight" || formData.track_by === "both") && (
                <div className="mb-3">
                  <label className="form-label fw-medium">
                    Unit <span className="text-danger">*</span>
                  </label>
                  <select
                    name="unit_id"
                    className={`form-select form-select-lg ${errors.unit_id ? 'is-invalid' : ''}`}
                    value={formData.unit_id}
                    onChange={handleChange}
                    disabled={loading || units.length === 0}
                  >
                    <option value="">Select Unit</option>
                    {units.map((unit) => (
                      <option 
                        key={`unit-${getId(unit)}`} 
                        value={getId(unit)}
                      >
                        {unit.name}
                      </option>
                    ))}
                  </select>
                  {errors.unit_id && (
                    <div className="invalid-feedback">{errors.unit_id}</div>
                  )}
                  {units.length === 0 && !loading && (
                    <div className="form-text text-warning">
                      No units available. Please add units first.
                    </div>
                  )}
                </div>
              )}

              {/* Status */}
              <div className="mb-3">
                <div className="form-check form-switch">
                  <input
                    className="form-check-input"
                    type="checkbox"
                    role="switch"
                    name="status"
                    id="editItemStatus"
                    checked={formData.status}
                    onChange={handleChange}
                    disabled={loading}
                  />
                  <label className="form-check-label fw-medium" htmlFor="editItemStatus">
                    Status (Active/Inactive)
                  </label>
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
                    <FiUpload size={16} />
                    Update Inventory Item
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

export default EditInventoryItemForm;