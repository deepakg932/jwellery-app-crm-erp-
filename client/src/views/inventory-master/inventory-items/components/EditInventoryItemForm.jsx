import React, { useState, useEffect } from "react";
import { FiUpload } from "react-icons/fi";

const EditInventoryItemForm = ({
  onClose,
  onSave,
  loading = false,
  inventoryCategories = [],
  units = [],
  metalPurities = [],
  stonePurities = [],
  materials = [],
  item,
}) => {
  const [formData, setFormData] = useState({
    item_name: "",
    inventory_category_id: "",

    // Item type: "metal", "stone", or "material"
    item_type: "",

    // For metals
    metal_type: "",
    metal_purity_id: "",
    metal_purity_name: "",

    // For stones
    stone_type: "",
    stone_purity_id: "",
    stone_purity_name: "",

    // For materials
    material_type_id: "",

    // Tracking
    track_by: "weight",
    weight: "",
    quantity: "",
    unit_id: "",
    status: true,
  });

  const [errors, setErrors] = useState({});

  // Helper function to get ID
  const getId = (item) => item._id || item.id;

  useEffect(() => {
    if (item) {
      console.log("Received item data for editing:", item);

      // Determine item type based on item data
      let item_type = "";
      let metal_type = "";
      let metal_purity_name = "";
      let stone_type = "";
      let stone_purity_name = "";
      let material_type_id = "";

      // Check if it's a metal item
      if (item.metals && item.metals.length > 0) {
        item_type = "metal";
        const metal = item.metals[0];
        metal_type = metal.metal_id?.name || metal.metal_id || "";
        metal_purity_name = metal.purity_name || "";
      }
      // Check if it's a stone item
      else if (item.stones && item.stones.length > 0) {
        item_type = "stone";
        const stone = item.stones[0];
        stone_type = stone.stone_id?.stone_type || stone.stone_id || "";
        stone_purity_name =
          stone.stone_purity_id?.stone_purity || stone.stone_purity_name || "";
      }
      // Check if it's a material item
      else if (item.material_type_id) {
        item_type = "material";
        material_type_id = item.material_type_id._id || item.material_type_id;
      }

      // Extract IDs from nested objects
      const inventoryCategoryId =
        item.inventory_category_id?._id || item.inventory_category_id || "";
      const unitId = item.unit_id?._id || item.unit_id || "";

      setFormData({
        item_name: item.item_name || "",
        inventory_category_id: inventoryCategoryId,
        item_type,
        metal_type,
        metal_purity_name,
        stone_type,
        stone_purity_name,
        material_type_id,
        track_by: item.track_by || "weight",
        weight:
          item.total_weight !== null && item.total_weight !== undefined
            ? item.total_weight.toString()
            : item.weight || "",
        quantity:
          item.total_quantity !== null && item.total_quantity !== undefined
            ? item.total_quantity.toString()
            : item.quantity || "",
        unit_id: unitId,
        status: item.status !== false,
      });
      setErrors({});
    }
  }, [item]);

  // Get unique metal types from metalPurities
  const getMetalTypes = () => {
    return [...new Set(metalPurities.map((p) => p.metal_type))]
      .filter((type) => type)
      .map((type) => ({
        value: type,
        label: type.charAt(0) + type.slice(1),
      }));
  };

  // Get unique stone types from stonePurities
  const getStoneTypes = () => {
    return [...new Set(stonePurities.map((p) => p.stone_type))]
      .filter((type) => type)
      .map((type) => ({
        value: type,
        label: type.charAt(0) + type.slice(1),
      }));
  };

  // Handle Item Type Change
  const handleItemTypeChange = (e) => {
    const value = e.target.value;

    setFormData((prev) => ({
      ...prev,
      item_type: value,
      // Reset all type-specific fields
      metal_type: "",
      metal_purity_id: "",
      metal_purity_name: "",
      stone_type: "",
      stone_purity_id: "",
      stone_purity_name: "",
      material_type_id: "",
      // Reset tracking based on item type
      track_by: value === "stone" ? "quantity" : "weight",
      weight: "",
      quantity: "",
      unit_id: "",
    }));

    // Clear errors
    setErrors((prev) => ({
      ...prev,
      metal_type: "",
      purity_id: "",
      stone_type: "",
      material_type_id: "",
    }));
  };

  // Handle Metal Type Change
  const handleMetalTypeChange = (e) => {
    const value = e.target.value;

    setFormData((prev) => ({
      ...prev,
      metal_type: value,
      // Reset purity when metal type changes
      metal_purity_id: "",
      metal_purity_name: "",
    }));

    // Clear error
    if (errors.metal_purity_id) {
      setErrors((prev) => ({ ...prev, metal_purity_id: "" }));
    }
  };

  // Handle Stone Type Change
  const handleStoneTypeChange = (e) => {
    const value = e.target.value;

    setFormData((prev) => ({
      ...prev,
      stone_type: value,
      // Reset purity when stone type changes
      stone_purity_id: "",
      stone_purity_name: "",
    }));

    // Clear error
    if (errors.stone_purity_id) {
      setErrors((prev) => ({ ...prev, stone_purity_id: "" }));
    }
  };

  // Handle Metal Purity Change
  const handleMetalPurityChange = (e) => {
    const purityId = e.target.value;
    const purity = metalPurities.find((p) => getId(p) === purityId);

    setFormData((prev) => ({
      ...prev,
      metal_purity_id: purityId,
      metal_purity_name: purity?.purity_name || "",
    }));
  };

  // Handle Stone Purity Change
  const handleStonePurityChange = (e) => {
    const purityId = e.target.value;
    const purity = stonePurities.find((p) => getId(p) === purityId);

    setFormData((prev) => ({
      ...prev,
      stone_purity_id: purityId,
      stone_purity_name: purity?.stone_purity || "",
    }));
  };

  // Handle Material Type Change
  const handleMaterialTypeChange = (e) => {
    const value = e.target.value;

    setFormData((prev) => ({
      ...prev,
      material_type_id: value,
    }));
  };

  // Handle Other Changes
  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));

    // Clear error when user starts typing
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: "" }));
    }
  };

  // Form Validation
  const validateForm = () => {
    const newErrors = {};

    // Basic Info Validation
    if (!formData.item_name.trim()) {
      newErrors.item_name = "Item name is required";
    }

    if (!formData.inventory_category_id) {
      newErrors.inventory_category_id = "Inventory category is required";
    }

    if (!formData.item_type) {
      newErrors.item_type = "Item type is required";
    }

    // Type-specific validation
    if (formData.item_type === "metal") {
      if (!formData.metal_type) {
        newErrors.metal_type = "Metal type is required";
      }
      if (!formData.metal_purity_name) {
        newErrors.metal_purity_name = "Metal purity is required";
      }
    } else if (formData.item_type === "stone") {
      if (!formData.stone_type) {
        newErrors.stone_type = "Stone type is required";
      }
      if (!formData.stone_purity_name) {
        newErrors.stone_purity_name = "Stone purity is required";
      }
    } else if (formData.item_type === "material") {
      if (!formData.material_type_id) {
        newErrors.material_type_id = "Material type is required";
      }
    }

    // Tracking Validation - DIFFERENT FOR STONES
    if (formData.item_type !== "stone") {
      // For metals and materials, validate weight/unit
      if (formData.track_by === "weight" && !formData.unit_id) {
        newErrors.unit_id = "Unit is required";
      }

      if (formData.track_by === "weight") {
        if (!formData.weight || parseFloat(formData.weight) <= 0) {
          newErrors.weight = "Weight must be greater than 0";
        }
      }
    }

    // Quantity validation for all types when track_by is quantity
    if (formData.track_by === "quantity") {
      if (!formData.quantity || parseInt(formData.quantity) <= 0) {
        newErrors.quantity = "Quantity must be greater than 0";
      }
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

    // Prepare payload based on Postman structure
    let payload = {
      item_name: formData.item_name.trim(),
      inventory_category_id: formData.inventory_category_id,
      track_by: formData.track_by,
      status: formData.status,
    };

    // Add type-specific data
    if (formData.item_type === "metal") {
      payload.metal_type = formData.metal_type;
      payload.metal_type_name =
        formData.metal_type.charAt(0) + formData.metal_type.slice(1);
      payload.metal_purity_name = formData.metal_purity_name;
      // For metals, send both weight and unit if applicable
      if (formData.track_by === "weight" || formData.track_by === "both") {
        payload.weight = parseFloat(formData.weight) || null;
        if (formData.unit_id) {
          payload.unit_id = formData.unit_id;
        }
      }
      if (formData.track_by === "quantity" || formData.track_by === "both") {
        payload.quantity = parseInt(formData.quantity) || null;
      }
    } else if (formData.item_type === "stone") {
      payload.stone_type = formData.stone_type;
      payload.stone_purity_name = formData.stone_purity_name;

      // For stones, always send quantity
      payload.quantity = parseInt(formData.quantity) || null;

      // Don't send weight or unit_id for stones
    } else if (formData.item_type === "material") {
      payload.material_type_id = formData.material_type_id;
      // For materials
      if (formData.track_by === "weight" || formData.track_by === "both") {
        payload.weight = parseFloat(formData.weight) || null;
        if (formData.unit_id) {
          payload.unit_id = formData.unit_id;
        }
      }
      if (formData.track_by === "quantity" || formData.track_by === "both") {
        payload.quantity = parseInt(formData.quantity) || null;
      }
    }

    console.log("Updating inventory item:", payload);
    onSave(payload);
  };

  const handleClose = () => {
    if (!loading) onClose();
  };

  // Get filtered metal purities based on selected metal type
  const getFilteredMetalPurities = () => {
    if (formData.metal_type) {
      return metalPurities.filter(
        (p) => p.metal_type?.toLowerCase() === formData.metal_type.toLowerCase()
      );
    }
    return [];
  };

  // Get filtered stone purities based on selected stone type
  const getFilteredStonePurities = () => {
    if (formData.stone_type) {
      return stonePurities.filter(
        (p) => p.stone_type?.toLowerCase() === formData.stone_type.toLowerCase()
      );
    }
    return [];
  };

  // Get appropriate units based on item type
  const getFilteredUnits = () => {
    if (formData.item_type === "stone") {
      // Return empty array for stones (no units needed)
      return [];
    } else if (formData.item_type === "metal") {
      return units.filter((unit) => unit.name);
    } else if (formData.item_type === "material") {
      return units.filter((unit) => unit.name);
    }
    return units;
  };

  // Get available item types
  const getAvailableItemTypes = () => {
    const types = [];
    if (getMetalTypes().length > 0)
      types.push({ value: "metal", label: "Metal" });
    if (getStoneTypes().length > 0)
      types.push({ value: "stone", label: "Stone" });
    if (materials.length > 0)
      types.push({ value: "material", label: "Material" });
    return types;
  };

  // Check if weight should be shown
  const showWeight = () => {
    if (formData.item_type === "stone") return false;
    return formData.track_by === "weight" || formData.track_by === "both";
  };

  // Check if unit should be shown
  const showUnit = () => {
    if (formData.item_type === "stone") return false;
    return formData.track_by === "weight" || formData.track_by === "both";
  };

  // Check if quantity should be shown
  const showQuantity = () => {
    return formData.track_by === "quantity" || formData.track_by === "both";
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
                  className={`form-control form-control-lg ${
                    errors.item_name ? "is-invalid" : ""
                  }`}
                  placeholder="e.g., Gold 22K Ring, Diamond Earring, Production Item"
                  value={formData.item_name}
                  onChange={handleChange}
                  disabled={loading}
                />
                {errors.item_name && (
                  <div className="invalid-feedback">{errors.item_name}</div>
                )}
              </div>

              {/* Inventory Category */}
              <div className="mb-3">
                <label className="form-label fw-medium">
                  Inventory Category <span className="text-danger">*</span>
                </label>
                <select
                  name="inventory_category_id"
                  className={`form-select form-select-lg ${
                    errors.inventory_category_id ? "is-invalid" : ""
                  }`}
                  value={formData.inventory_category_id}
                  onChange={handleChange}
                  disabled={loading || inventoryCategories.length === 0}
                >
                  <option value="">Select Inventory Category</option>
                  {inventoryCategories.map((category) => (
                    <option key={getId(category)} value={getId(category)}>
                      {category.name}
                    </option>
                  ))}
                </select>
                {errors.inventory_category_id && (
                  <div className="invalid-feedback">
                    {errors.inventory_category_id}
                  </div>
                )}
              </div>

              {/* Item Type Selection */}
              <div className="mb-3">
                <label className="form-label fw-medium">
                  Item Type <span className="text-danger">*</span>
                </label>
                <select
                  name="item_type"
                  className={`form-select form-select-lg ${
                    errors.item_type ? "is-invalid" : ""
                  }`}
                  value={formData.item_type}
                  onChange={handleItemTypeChange}
                  disabled={loading || getAvailableItemTypes().length === 0}
                >
                  <option value="">Select Item Type</option>
                  {getAvailableItemTypes().map((type) => (
                    <option key={type.value} value={type.value}>
                      {type.label}
                    </option>
                  ))}
                </select>
                {errors.item_type && (
                  <div className="invalid-feedback">{errors.item_type}</div>
                )}
              </div>

              {/* Metal Type Selection */}
              {formData.item_type === "metal" && (
                <div className="mb-3">
                  <label className="form-label fw-medium">
                    Metal Type <span className="text-danger">*</span>
                  </label>
                  <select
                    name="metal_type"
                    className={`form-select form-select-lg ${
                      errors.metal_type ? "is-invalid" : ""
                    }`}
                    value={formData.metal_type}
                    onChange={handleMetalTypeChange}
                    disabled={loading || getMetalTypes().length === 0}
                  >
                    <option value="">Select Metal Type</option>
                    {getMetalTypes().map((metal) => (
                      <option key={`metal-${metal.value}`} value={metal.value}>
                        {metal.label}
                      </option>
                    ))}
                  </select>
                  {errors.metal_type && (
                    <div className="invalid-feedback">{errors.metal_type}</div>
                  )}
                </div>
              )}

              {/* Metal Purity Selection */}
              {formData.item_type === "metal" && formData.metal_type && (
                <div className="mb-3">
                  <label className="form-label fw-medium">
                    Metal Purity <span className="text-danger">*</span>
                  </label>
                  <select
                    name="metal_purity_id"
                    className={`form-select form-select-lg ${
                      errors.metal_purity_name ? "is-invalid" : ""
                    }`}
                    value={formData.metal_purity_id}
                    onChange={handleMetalPurityChange}
                    disabled={
                      loading || getFilteredMetalPurities().length === 0
                    }
                  >
                    <option value="">Select Metal Purity</option>
                    {getFilteredMetalPurities().map((purity) => (
                      <option key={getId(purity)} value={getId(purity)}>
                        {purity.purity_name}
                        {purity.percentage ? ` (${purity.percentage}%)` : ""}
                      </option>
                    ))}
                  </select>
                  {errors.metal_purity_name && (
                    <div className="invalid-feedback">
                      {errors.metal_purity_name}
                    </div>
                  )}
                </div>
              )}

              {/* Stone Type Selection */}
              {formData.item_type === "stone" && (
                <div className="mb-3">
                  <label className="form-label fw-medium">
                    Stone Type <span className="text-danger">*</span>
                  </label>
                  <select
                    name="stone_type"
                    className={`form-select form-select-lg ${
                      errors.stone_type ? "is-invalid" : ""
                    }`}
                    value={formData.stone_type}
                    onChange={handleStoneTypeChange}
                    disabled={loading || getStoneTypes().length === 0}
                  >
                    <option value="">Select Stone Type</option>
                    {getStoneTypes().map((stone) => (
                      <option key={`stone-${stone.value}`} value={stone.value}>
                        {stone.label}
                      </option>
                    ))}
                  </select>
                  {errors.stone_type && (
                    <div className="invalid-feedback">{errors.stone_type}</div>
                  )}
                </div>
              )}

              {/* Stone Purity Selection */}
              {formData.item_type === "stone" && formData.stone_type && (
                <div className="mb-3">
                  <label className="form-label fw-medium">
                    Stone Purity <span className="text-danger">*</span>
                  </label>
                  <select
                    name="stone_purity_id"
                    className={`form-select form-select-lg ${
                      errors.stone_purity_name ? "is-invalid" : ""
                    }`}
                    value={formData.stone_purity_id}
                    onChange={handleStonePurityChange}
                    disabled={
                      loading || getFilteredStonePurities().length === 0
                    }
                  >
                    <option value="">Select Stone Purity</option>
                    {getFilteredStonePurities().map((purity) => (
                      <option key={getId(purity)} value={getId(purity)}>
                        {purity.stone_purity}
                        {purity.percentage ? ` (${purity.percentage}%)` : ""}
                      </option>
                    ))}
                  </select>
                  {errors.stone_purity_name && (
                    <div className="invalid-feedback">
                      {errors.stone_purity_name}
                    </div>
                  )}
                </div>
              )}

              {/* Material Type Selection */}
              {formData.item_type === "material" && (
                <div className="mb-3">
                  <label className="form-label fw-medium">
                    Material Type <span className="text-danger">*</span>
                  </label>
                  <select
                    name="material_type_id"
                    className={`form-select form-select-lg ${
                      errors.material_type_id ? "is-invalid" : ""
                    }`}
                    value={formData.material_type_id}
                    onChange={handleMaterialTypeChange}
                    disabled={loading || materials.length === 0}
                  >
                    <option value="">Select Material Type</option>
                    {materials.map((material) => (
                      <option key={material._id} value={material._id}>
                        {material.material_type}
                      </option>
                    ))}
                  </select>
                  {errors.material_type_id && (
                    <div className="invalid-feedback">
                      {errors.material_type_id}
                    </div>
                  )}
                </div>
              )}

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
                      disabled={loading || formData.item_type === "stone"}
                    />
                    <label
                      className="form-check-label"
                      htmlFor="editTrackWeight"
                    >
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
                    <label
                      className="form-check-label"
                      htmlFor="editTrackQuantity"
                    >
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
                      disabled={loading || formData.item_type === "stone"}
                    />
                    <label className="form-check-label" htmlFor="editTrackBoth">
                      Both
                    </label>
                  </div>
                </div>
                <small className="text-muted">
                  {formData.item_type === "stone"
                    ? "Stones are tracked by quantity only"
                    : "Metals and materials can be tracked by weight or quantity"}
                </small>
              </div>

              {/* Weight - Don't show for stones */}
              {showWeight() && (
                <div className="mb-3">
                  <label className="form-label fw-medium">
                    Weight{" "}
                    {formData.track_by === "weight" ? (
                      <span className="text-danger">*</span>
                    ) : (
                      ""
                    )}
                  </label>
                  <input
                    type="number"
                    name="weight"
                    step="0.01"
                    min="0"
                    className={`form-control form-control-lg ${
                      errors.weight ? "is-invalid" : ""
                    }`}
                    placeholder={
                      formData.item_type === "metal"
                        ? "Enter weight in grams"
                        : "Enter weight"
                    }
                    value={formData.weight}
                    onChange={handleChange}
                    disabled={loading}
                  />
                  {errors.weight && (
                    <div className="invalid-feedback">{errors.weight}</div>
                  )}
                </div>
              )}

              {/* Quantity - Show for all types */}
              {showQuantity() && (
                <div className="mb-3">
                  <label className="form-label fw-medium">
                    Quantity{" "}
                    {formData.track_by === "quantity" ? (
                      <span className="text-danger">*</span>
                    ) : (
                      ""
                    )}
                  </label>
                  <input
                    type="number"
                    name="quantity"
                    min="0"
                    className={`form-control form-control-lg ${
                      errors.quantity ? "is-invalid" : ""
                    }`}
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

              {/* Unit - Don't show for stones */}
              {showUnit() && (
                <div className="mb-3">
                  <label className="form-label fw-medium">
                    Unit{" "}
                    {formData.track_by === "weight" ? (
                      <span className="text-danger">*</span>
                    ) : (
                      ""
                    )}
                  </label>
                  <select
                    name="unit_id"
                    className={`form-select form-select-lg ${
                      errors.unit_id ? "is-invalid" : ""
                    }`}
                    value={formData.unit_id}
                    onChange={handleChange}
                    disabled={loading || getFilteredUnits().length === 0}
                  >
                    <option value="">Select Unit</option>
                    {getFilteredUnits().map((unit) => (
                      <option key={getId(unit)} value={getId(unit)}>
                        {unit.name} {unit.symbol ? `(${unit.symbol})` : ""}
                      </option>
                    ))}
                  </select>
                  {errors.unit_id && (
                    <div className="invalid-feedback">{errors.unit_id}</div>
                  )}
                  <small className="text-muted">
                    {formData.item_type === "metal"
                      ? "Select grams (g) for metals"
                      : "Select appropriate unit"}
                  </small>
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
                  <label
                    className="form-check-label fw-medium"
                    htmlFor="editItemStatus"
                  >
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
