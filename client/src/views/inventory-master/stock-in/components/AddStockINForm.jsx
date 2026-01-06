import React, { useState, useEffect } from "react";
import { FiUpload, FiCalendar } from "react-icons/fi";
import useStockIn from "@/hooks/useStockIn";

const AddStockINForm = ({ onClose, onSave, loading = false }) => {
  const {
    purchaseOrders,
    suppliers,
    inventoryItems,
    branches,
    loadingPurchaseOrders,
    loadingSuppliers,
    loadingInventoryItems,
    loadingBranches,
  } = useStockIn();

  const [formData, setFormData] = useState({
    po_id: "",
    supplier_id: "",
    branch_id: "",
    grn_date: new Date().toISOString().split("T")[0],
    items: [],
    remarks: "",
    total_cost: 0,
    status: "received",
  });

  const [errors, setErrors] = useState({});
  const [selectedPO, setSelectedPO] = useState(null);

  // Fetch PO details when selected
  useEffect(() => {
    if (formData.po_id && formData.po_id !== "direct") {
      const po = purchaseOrders.find(po => po._id === formData.po_id);
      setSelectedPO(po);
      
      if (po) {
        // Extract supplier and branch IDs
        let supplierId = "";
        let branchId = "";
        
        // Handle supplier_id
        if (po.supplier_id) {
          if (typeof po.supplier_id === 'object') {
            supplierId = po.supplier_id._id || po.supplier_id.id || "";
          } else {
            supplierId = po.supplier_id;
          }
        }
        
        // Handle branch_id
        if (po.branch_id) {
          if (typeof po.branch_id === 'object') {
            branchId = po.branch_id._id || po.branch_id.id || "";
          } else {
            branchId = po.branch_id;
          }
        }
        
        setFormData(prev => ({ 
          ...prev, 
          supplier_id: supplierId || "",
          branch_id: branchId || ""
        }));
        
        // Auto-populate items from PO
        const poItems = po.items?.map(item => {
          // Extract inventory item details
          const inventoryItem = item.inventory_item_id;
          const itemName = inventoryItem?.name || inventoryItem?.item_name || "Unknown Item";
          const skuCode = inventoryItem?.sku_code || "N/A";
          
          // Determine track_by
          let trackBy = item.track_by;
          if (!trackBy && inventoryItem) {
            trackBy = inventoryItem.track_by || "quantity";
          }
          trackBy = trackBy || "quantity";
          
          // Extract unit details
          const unit = item.unit_id;
          const unitId = unit?._id || unit?.id || item.unit_id;
          const unitName = unit?.name || "pcs";
          
          return {
            po_item_id: item._id,
            inventory_item_id: inventoryItem?._id || inventoryItem?.id || item.inventory_item_id,
            inventory_item_name: itemName,
            sku_code: skuCode,
            track_by: trackBy,
            ordered_quantity: item.quantity || 0,
            ordered_weight: item.weight || 0,
            unit_id: unitId,
            unit_name: unitName,
            rate: item.rate || item.cost || 0,
            metal_type: item.metal_type || null,
            stone_type: item.stone_type || null,
            material_type: item.material_type || null,
            metal_purities: item.metal_purities || [],
            stone_purities: item.stone_purities || [],
            
            // Receiving fields (to be filled by user)
            quantity: trackBy === "quantity" ? "" : null,
            weight: trackBy === "weight" ? "" : null,
            unit: unitName, // Add unit field for display
            metal_purity: item.metal_purities?.[0] || null,
            stone_purity: item.stone_purities?.[0] || null,
            cost: item.rate || item.cost || 0,
            total_cost: 0,
            remarks: "",
          };
        }) || [];

        // Calculate initial total costs
        const itemsWithCost = poItems.map(item => ({
          ...item,
          total_cost: calculateItemTotalCost(item)
        }));

        setFormData(prev => ({
          ...prev,
          items: itemsWithCost,
          total_cost: calculateTotalCost(itemsWithCost),
        }));
      }
    } else {
      setSelectedPO(null);
      setFormData(prev => ({
        ...prev,
        items: [],
        total_cost: 0,
      }));
    }
  }, [formData.po_id, purchaseOrders]);

  const calculateItemTotalCost = (item) => {
    const qty = parseFloat(item.quantity) || 0;
    const weight = parseFloat(item.weight) || 0;
    const cost = parseFloat(item.cost) || 0;
    
    if (item.track_by === "quantity") {
      return qty * cost;
    } else if (item.track_by === "weight") {
      return weight * cost;
    }
    return 0;
  };

  const calculateTotalCost = (items) => {
    return items.reduce((total, item) => {
      return total + (parseFloat(item.total_cost) || 0);
    }, 0);
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.supplier_id) {
      newErrors.supplier_id = "Supplier is required";
    }

    if (!formData.branch_id) {
      newErrors.branch_id = "Branch is required";
    }

    if (!formData.grn_date) {
      newErrors.grn_date = "GRN Date is required";
    }

    if (formData.items.length === 0) {
      newErrors.items = "At least one item is required";
    } else {
      formData.items.forEach((item, index) => {
        const trackBy = item.track_by || "quantity";
        
        if (trackBy === "quantity") {
          if (!item.quantity || parseFloat(item.quantity) <= 0) {
            newErrors[`items[${index}].quantity`] = "Received quantity is required";
          }
          if (selectedPO && parseFloat(item.quantity) > parseFloat(item.ordered_quantity)) {
            newErrors[`items[${index}].quantity`] = `Cannot exceed ordered quantity (${item.ordered_quantity})`;
          }
        } else if (trackBy === "weight") {
          if (!item.weight || parseFloat(item.weight) <= 0) {
            newErrors[`items[${index}].weight`] = "Received weight is required";
          }
          if (selectedPO && parseFloat(item.weight) > parseFloat(item.ordered_weight)) {
            newErrors[`items[${index}].weight`] = `Cannot exceed ordered weight (${item.ordered_weight})`;
          }
        }

        // Validate cost
        if (!item.cost || parseFloat(item.cost) <= 0) {
          newErrors[`items[${index}].cost`] = "Valid cost is required";
        }
      });
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleItemChange = (index, field, value) => {
    const updatedItems = [...formData.items];
    
    // Convert empty string to null for certain fields
    if ((field === 'weight' || field === 'metal_purity' || field === 'stone_purity') && value === '') {
      value = null;
    }
    
    updatedItems[index] = {
      ...updatedItems[index],
      [field]: value,
    };

    // Recalculate item total cost if quantity, weight, or cost changes
    if (field === 'quantity' || field === 'weight' || field === 'cost') {
      updatedItems[index].total_cost = calculateItemTotalCost(updatedItems[index]);
    }

    setFormData((prev) => ({
      ...prev,
      items: updatedItems,
      total_cost: calculateTotalCost(updatedItems),
    }));

    // Clear item-specific errors
    if (errors[`items[${index}].${field}`]) {
      setErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors[`items[${index}].${field}`];
        return newErrors;
      });
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    // Prepare payload
    const payload = {
      po_id: formData.po_id || null,
      supplier_id: formData.supplier_id,
      branch_id: formData.branch_id,
      received_date: formData.grn_date,
      items: formData.items.map((item) => {
        const trackBy = item.track_by || "quantity";
        const quantity = trackBy === "quantity" ? parseFloat(item.quantity) || null : null;
        const weight = trackBy === "weight" ? parseFloat(item.weight) || null : null;
        
        return {
          po_item_id: item.po_item_id || null,
          inventory_item_id: item.inventory_item_id,
          ordered_quantity: item.ordered_quantity || 0,
          ordered_weight: item.ordered_weight || 0,
          quantity: quantity,
          weight: weight,
          unit_id: item.unit_id || null,
          unit: item.unit || item.unit_name || null, // Include unit in payload
          cost: parseFloat(item.cost) || 0,
          total_cost: parseFloat(item.total_cost) || 0,
          remarks: item.remarks || "",
          metal_type: item.metal_type || null,
          stone_type: item.stone_type || null,
          material_type: item.material_type || null,
          metal_purities: item.metal_purities || [],
          stone_purities: item.stone_purities || [],
          track_by: trackBy,
        };
      }),
      remarks: formData.remarks || "",
      total_cost: parseFloat(formData.total_cost),
      status: "received",
    };

    console.log("Submitting GRN data:", payload);
    
    onSave(payload);

    // Reset form
    setFormData({
      po_id: "",
      supplier_id: "",
      branch_id: "",
      grn_date: new Date().toISOString().split("T")[0],
      items: [],
      remarks: "",
      total_cost: 0,
      status: "received",
    });
    setErrors({});
    setSelectedPO(null);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));

    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: "" }));
    }
  };

  const handleClose = () => {
    setFormData({
      po_id: "",
      supplier_id: "",
      branch_id: "",
      grn_date: new Date().toISOString().split("T")[0],
      items: [],
      remarks: "",
      total_cost: 0,
      status: "received",
    });
    setErrors({});
    setSelectedPO(null);
    onClose();
  };

  // Helper function to get branch ID
  const getBranchId = (branch) => {
    return branch._id || branch.id || "";
  };

  // Helper function to get branch display name
  const getBranchDisplayName = (branch) => {
    const name = branch.name || branch.branch_name || "Unknown";
    const address = branch.address ? ` - ${branch.address}` : "";
    return `${name}${address}`;
  };

  // Check if component fields should be disabled
  const isDisabled =
    loading ||
    loadingPurchaseOrders ||
    loadingSuppliers ||
    loadingBranches ||
    loadingInventoryItems;

  return (
    <div
      className="modal fade show d-block"
      style={{ backgroundColor: "rgba(0,0,0,0.5)" }}
      tabIndex="-1"
    >
      <div className="modal-dialog modal-dialog-centered modal-xl">
        <div className="modal-content rounded-3">
          <div className="modal-header border-bottom pb-3">
            <h5 className="modal-title fw-bold fs-5">Create Goods Receipt Note (GRN)</h5>
            <button
              type="button"
              className="btn-close"
              onClick={handleClose}
              disabled={isDisabled}
              aria-label="Close"
            ></button>
          </div>

          <form onSubmit={handleSubmit}>
            <div className="modal-body">
              <div className="row mb-4">
                {/* PO Reference */}
                <div className="col-md-6 mb-3">
                  <label className="form-label fw-medium">
                    Purchase Order Reference
                  </label>
                  <select
                    name="po_id"
                    className="form-select form-select-lg"
                    value={formData.po_id}
                    onChange={handleChange}
                    disabled={isDisabled}
                  >
                    <option value="">-- Select PO (Optional) --</option>
                    {purchaseOrders &&
                    Array.isArray(purchaseOrders) &&
                    purchaseOrders.length > 0 ? (
                      purchaseOrders
                        .filter(po => po.status === 'approved' || po.status === 'draft' || po.status === 'pending')
                        .map((po) => {
                          const poNumber = po.po_number || `PO-${po._id}`;
                          const supplierName = typeof po.supplier_id === 'object' 
                            ? po.supplier_id?.name || 'Supplier' 
                            : 'Supplier';
                          return (
                            <option key={po._id} value={po._id}>
                              {poNumber} - {supplierName} - 
                              ₹{po.total_amount?.toLocaleString() || 0} - {po.status}
                            </option>
                          );
                        })
                    ) : (
                      <option value="" disabled>No purchase orders available</option>
                    )}
                  </select>
                  
                  {selectedPO && (
                    <div className="mt-2 p-2 bg-light rounded small">
                      <div className="d-flex justify-content-between">
                        <span className="text-muted">PO Number:</span>
                        <span className="fw-semibold">
                          {selectedPO.po_number || `PO-${selectedPO._id}`}
                        </span>
                      </div>
                      <div className="d-flex justify-content-between">
                        <span className="text-muted">PO Total:</span>
                        <span className="fw-semibold">
                          ₹{selectedPO.total_amount?.toLocaleString('en-IN', { minimumFractionDigits: 2 }) || "0.00"}
                        </span>
                      </div>
                      <div className="d-flex justify-content-between">
                        <span className="text-muted">Items:</span>
                        <span>{selectedPO.items?.length || 0} items</span>
                      </div>
                    </div>
                  )}
                </div>

                {/* GRN Date */}
                <div className="col-md-6 mb-3">
                  <label className="form-label fw-medium">
                    GRN Date <span className="text-danger">*</span>
                  </label>
                  <div className="input-group">
                    <span className="input-group-text">
                      <FiCalendar size={16} />
                    </span>
                    <input
                      type="date"
                      name="grn_date"
                      className={`form-control form-control-lg ${
                        errors.grn_date ? "is-invalid" : ""
                      }`}
                      value={formData.grn_date}
                      onChange={handleChange}
                      disabled={isDisabled}
                      required
                    />
                  </div>
                  {errors.grn_date && (
                    <div className="invalid-feedback d-block">{errors.grn_date}</div>
                  )}
                </div>

                {/* Supplier */}
                <div className="col-md-6 mb-3">
                  <label className="form-label fw-medium">
                    Supplier <span className="text-danger">*</span>
                  </label>
                  <select
                    name="supplier_id"
                    className={`form-select form-select-lg ${
                      errors.supplier_id ? "is-invalid" : ""
                    }`}
                    value={formData.supplier_id}
                    onChange={handleChange}
                    disabled={isDisabled || (selectedPO && selectedPO.supplier_id)}
                    required
                  >
                    <option value="">Select Supplier</option>
                    {suppliers &&
                    Array.isArray(suppliers) &&
                    suppliers.length > 0 ? (
                      suppliers.map((supplier) => (
                        <option key={supplier._id || supplier.id} value={supplier._id || supplier.id}>
                          {supplier.name || supplier.supplier_name}
                          {supplier.phone ? ` - ${supplier.phone}` : ""}
                        </option>
                      ))
                    ) : (
                      <option value="" disabled>Loading suppliers...</option>
                    )}
                  </select>
                  {errors.supplier_id && (
                    <div className="invalid-feedback">{errors.supplier_id}</div>
                  )}
                  {selectedPO && selectedPO.supplier_id && (
                    <div className="form-text">
                      Auto-filled from selected PO
                    </div>
                  )}
                </div>

                {/* Branch */}
                <div className="col-md-6 mb-3">
                  <label className="form-label fw-medium">
                    Branch <span className="text-danger">*</span>
                  </label>
                  <select
                    name="branch_id"
                    className={`form-select form-select-lg ${
                      errors.branch_id ? "is-invalid" : ""
                    }`}
                    value={formData.branch_id}
                    onChange={handleChange}
                    disabled={isDisabled}
                    required
                  >
                    <option value="">Select Branch</option>
                    {branches &&
                    Array.isArray(branches) &&
                    branches.length > 0 ? (
                      branches.map((branch) => {
                        if (!branch) return null;
                        
                        const branchId = getBranchId(branch);
                        const displayName = getBranchDisplayName(branch);
                        
                        return (
                          <option key={branchId} value={branchId}>
                            {displayName}
                          </option>
                        );
                      }).filter(option => option !== null)
                    ) : (
                      <option value="" disabled>Loading branches...</option>
                    )}
                  </select>
                  {errors.branch_id && (
                    <div className="invalid-feedback">{errors.branch_id}</div>
                  )}
                </div>
              </div>

              {/* ITEMS SECTION */}
              <div className="border rounded-3 p-3 mb-4">
                <div className="d-flex justify-content-between align-items-center mb-3">
                  <h6 className="fw-bold mb-0">Received Items</h6>
                </div>

                {errors.items && (
                  <div className="alert alert-danger mb-3" role="alert">
                    {errors.items}
                  </div>
                )}

                {formData.items.length === 0 ? (
                  <div className="text-center py-4 text-muted">
                    {formData.po_id ? 
                      "No items available in selected PO" : 
                      "Please select a Purchase Order first"}
                  </div>
                ) : (
                  <div className="table-responsive">
                    <table className="table align-middle">
                      <thead>
                        <tr>
                          <th width="20%">Item Name</th>
                          <th width="10%">SKU</th>
                          <th width="10%">Unit</th>
                          <th width="10%">Quantity</th>
                          <th width="10%">Weight</th>
                          <th width="15%">Cost per Unit</th>
                          <th width="15%">Total Cost</th>
                          <th width="10%">Type</th>
                        </tr>
                      </thead>
                      <tbody>
                        {formData.items.map((item, index) => (
                          <tr key={index}>
                            {/* Item Name */}
                            <td>
                              <div className="fw-medium">{item.inventory_item_name}</div>
                              {item.track_by && (
                                <div className="small text-muted">
                                  Track by: {item.track_by}
                                </div>
                              )}
                            </td>

                            {/* SKU */}
                            <td>
                              <div className="text-muted">{item.sku_code}</div>
                            </td>

                            {/* Unit - Display only */}
                            <td>
                              <div className="fw-medium">{item.unit || item.unit_name || "pcs"}</div>
                            </td>

                            {/* Quantity - Show only if track_by is quantity */}
                            <td>
                              {item.track_by === "quantity" ? (
                                <div>
                                  <input
                                    type="number"
                                    className={`form-control ${
                                      errors[`items[${index}].quantity`]
                                        ? "is-invalid"
                                        : ""
                                    }`}
                                    placeholder="Received Qty"
                                    value={item.quantity}
                                    onChange={(e) =>
                                      handleItemChange(
                                        index,
                                        "quantity",
                                        e.target.value
                                      )
                                    }
                                    disabled={isDisabled}
                                    min="0"
                                    step="1"
                                  />
                                  {errors[`items[${index}].quantity`] && (
                                    <div className="invalid-feedback d-block">
                                      {errors[`items[${index}].quantity`]}
                                    </div>
                                  )}
                                  {item.ordered_quantity > 0 && (
                                    <div className="form-text small">
                                      Ordered: {item.ordered_quantity}
                                    </div>
                                  )}
                                </div>
                              ) : (
                                <div className="text-muted small">
                                  Not applicable
                                </div>
                              )}
                            </td>

                            {/* Weight - Show only if track_by is weight */}
                            <td>
                              {item.track_by === "weight" ? (
                                <div>
                                  <input
                                    type="number"
                                    className={`form-control ${
                                      errors[`items[${index}].weight`]
                                        ? "is-invalid"
                                        : ""
                                    }`}
                                    placeholder="Received Weight"
                                    value={item.weight || ''}
                                    onChange={(e) =>
                                      handleItemChange(
                                        index,
                                        "weight",
                                        e.target.value
                                      )
                                    }
                                    disabled={isDisabled}
                                    min="0"
                                    step="0.001"
                                  />
                                  {errors[`items[${index}].weight`] && (
                                    <div className="invalid-feedback d-block">
                                      {errors[`items[${index}].weight`]}
                                    </div>
                                  )}
                                  {item.ordered_weight > 0 && (
                                    <div className="form-text small">
                                      Ordered: {item.ordered_weight}
                                    </div>
                                  )}
                                </div>
                              ) : (
                                <div className="text-muted small">
                                  Not applicable
                                </div>
                              )}
                            </td>

                            {/* Cost per Unit */}
                            <td>
                              <input
                                type="number"
                                className={`form-control ${
                                  errors[`items[${index}].cost`]
                                    ? "is-invalid"
                                    : ""
                                }`}
                                placeholder="Cost per unit"
                                value={item.cost}
                                onChange={(e) =>
                                  handleItemChange(
                                    index,
                                    "cost",
                                    e.target.value
                                  )
                                }
                                disabled={isDisabled}
                                min="0"
                                step="0.01"
                              />
                              {errors[`items[${index}].cost`] && (
                                <div className="invalid-feedback d-block">
                                  {errors[`items[${index}].cost`]}
                                </div>
                              )}
                            </td>

                            {/* Total Cost */}
                            <td>
                              <div className="fw-semibold">
                                ₹{parseFloat(item.total_cost || 0).toFixed(2)}
                              </div>
                            </td>

                            {/* Type */}
                            <td>
                              <div className="small">
                                {item.metal_type && (
                                  <div className="mb-1">
                                    <span className="text-muted">Metal:</span>
                                    <div className="fw-medium">{item.metal_type}</div>
                                    {item.metal_purities && item.metal_purities.length > 0 && (
                                      <div className="text-muted">
                                        Purity: {item.metal_purities.join(", ")}
                                      </div>
                                    )}
                                  </div>
                                )}
                                {item.stone_type && (
                                  <div className="mb-1">
                                    <span className="text-muted">Stone:</span>
                                    <div className="fw-medium">{item.stone_type}</div>
                                    {item.stone_purities && item.stone_purities.length > 0 && (
                                      <div className="text-muted">
                                        Purity: {item.stone_purities.join(", ")}
                                      </div>
                                    )}
                                  </div>
                                )}
                                {item.material_type && (
                                  <div>
                                    <span className="text-muted">Material:</span>
                                    <div className="fw-medium">{item.material_type}</div>
                                  </div>
                                )}
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}

                {/* Total Cost */}
                <div className="d-flex justify-content-end mt-3">
                  <div className="bg-primary bg-opacity-10 p-3 rounded-3">
                    <div className="d-flex align-items-center gap-3">
                      <span className="fw-bold">Total Cost:</span>
                      <span className="fs-4 fw-bold text-primary">
                        ₹{formData.total_cost.toFixed(2)}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Remarks */}
              <div className="mb-4">
                <label className="form-label fw-medium">Remarks</label>
                <textarea
                  name="remarks"
                  placeholder="Add any general notes or instructions for this GRN..."
                  className="form-control form-control-lg"
                  value={formData.remarks}
                  onChange={handleChange}
                  disabled={isDisabled}
                  rows={3}
                ></textarea>
              </div>
            </div>

            <div className="modal-footer border-top pt-3">
              <button
                type="button"
                className="btn btn-outline-secondary"
                onClick={handleClose}
                disabled={isDisabled}
              >
                Cancel
              </button>
              <button
                type="submit"
                className="btn btn-primary d-flex align-items-center gap-2"
                disabled={isDisabled || formData.items.length === 0}
              >
                {loading ? (
                  <>
                    <span
                      className="spinner-border spinner-border-sm"
                      aria-hidden="true"
                    ></span>
                    Creating GRN...
                  </>
                ) : (
                  <>
                    <FiUpload size={16} />
                    Create GRN
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

export default AddStockINForm;