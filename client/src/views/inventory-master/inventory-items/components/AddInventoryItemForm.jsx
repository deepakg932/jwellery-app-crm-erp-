import React, { useState, useEffect } from "react";
import { FiUpload, FiPlus, FiTrash2 } from "react-icons/fi";

const AddInventoryItemForm = ({
  onClose,
  onSave,
  loading = false,
  inventoryCategories = [],
  branches = [],
  metalTypes = [],
  stoneTypes = [],
}) => {
  // Main Form State for jewelry inventory
  const [formData, setFormData] = useState({
    // Basic Information
    item_name: "",
    item_code: "",
    description: "",
    inventory_category_id: "",
    branch_id: "",
    
    // Metals Array
    metals: [
      {
        metal_type: "gold",
        purity: "22k",
        weight: "",
        color: "yellow",
        hallmark: "916"
      }
    ],
    
    // Stones Array
    stones: [
      {
        stone_type: "diamond",
        shape: "round",
        color: "G",
        clarity: "VS1",
        carat_weight: "",
        quantity: 1,
        certificate_type: "GIA"
      }
    ],
    
    // Rates
    gold_rate: "",
    stone_rate: "",
    
    // Making Charges
    making_charges: "",
    making_type: "percentage",
    wastage_percentage: "5",
    profit_margin: "20",
    
    // Stock
    current_stock: "1",
    minimum_stock: "1",
    location_type: "showcase",
    
    // Pricing
    mrp: "",
    discount_type: "none",
    discount_value: "0",
    
    // Tax
    gst_percentage: "3",
    
    // Status
    status: "active",
    is_new_arrival: true,
    
    // Arrays
    images: [],
    tags: []
  });

  const [errors, setErrors] = useState({});
  const [autoGenerateCode, setAutoGenerateCode] = useState(true);

  // Auto-generate item code on mount
  useEffect(() => {
    if (autoGenerateCode) {
      const timestamp = Date.now().toString().slice(-6);
      const randomNum = Math.floor(Math.random() * 1000);
      setFormData(prev => ({
        ...prev,
        item_code: `JWL-${timestamp}${randomNum}`
      }));
    }
  }, [autoGenerateCode]);

  // Calculate derived values
  useEffect(() => {
    // Calculate metal weight
    const totalMetalWeight = formData.metals.reduce((sum, metal) => {
      return sum + (parseFloat(metal.weight) || 0);
    }, 0);
    
    // Calculate total carat
    const totalCarat = formData.stones.reduce((sum, stone) => {
      return sum + (parseFloat(stone.carat_weight) || 0);
    }, 0);
    
    // Calculate costs if rates are available
    const goldRate = parseFloat(formData.gold_rate) || 0;
    const stoneRate = parseFloat(formData.stone_rate) || 0;
    const metalCost = goldRate * totalMetalWeight;
    const stoneCost = stoneRate * totalCarat;
    
    // Calculate making charges
    let makingChargesAmount = parseFloat(formData.making_charges) || 0;
    if (formData.making_type === "per_gram" && totalMetalWeight > 0) {
      makingChargesAmount = totalMetalWeight * makingChargesAmount;
    } else if (formData.making_type === "percentage" && metalCost > 0) {
      makingChargesAmount = (metalCost * makingChargesAmount) / 100;
    }
    
    // Calculate wastage
    const wastagePercentage = parseFloat(formData.wastage_percentage) || 0;
    const wastageCharges = wastagePercentage > 0 ? (metalCost * wastagePercentage) / 100 : 0;
    
    // Calculate total cost
    const totalCost = metalCost + stoneCost + makingChargesAmount + wastageCharges;
    
    // Calculate selling price
    const profitMargin = parseFloat(formData.profit_margin) || 0;
    const sellingPrice = totalCost > 0 ? totalCost * (1 + profitMargin / 100) : 0;
    
    // Calculate MRP if not set
    if (!formData.mrp && sellingPrice > 0) {
      setFormData(prev => ({
        ...prev,
        mrp: (sellingPrice * 1.18).toFixed(2) // 18% above selling price
      }));
    }
    
    // Calculate tax
    const gstPercentage = parseFloat(formData.gst_percentage) || 0;
    const cgst = sellingPrice * (gstPercentage / 200); // Half of GST for CGST
    const sgst = sellingPrice * (gstPercentage / 200); // Half of GST for SGST
    const priceWithTax = sellingPrice + cgst + sgst;
    
  }, [
    formData.metals,
    formData.stones,
    formData.gold_rate,
    formData.stone_rate,
    formData.making_charges,
    formData.making_type,
    formData.wastage_percentage,
    formData.profit_margin,
    formData.gst_percentage
  ]);

  // Handle change for basic fields
  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
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

  // Handle metal changes
  const handleMetalChange = (index, field, value) => {
    const updatedMetals = [...formData.metals];
    updatedMetals[index] = {
      ...updatedMetals[index],
      [field]: value
    };
    
    setFormData(prev => ({
      ...prev,
      metals: updatedMetals
    }));
  };

  // Handle stone changes
  const handleStoneChange = (index, field, value) => {
    const updatedStones = [...formData.stones];
    updatedStones[index] = {
      ...updatedStones[index],
      [field]: value
    };
    
    setFormData(prev => ({
      ...prev,
      stones: updatedStones
    }));
  };

  // Add new metal
  const addMetal = () => {
    setFormData(prev => ({
      ...prev,
      metals: [
        ...prev.metals,
        {
          metal_type: "gold",
          purity: "22k",
          weight: "",
          color: "yellow",
          hallmark: ""
        }
      ]
    }));
  };

  // Remove metal
  const removeMetal = (index) => {
    if (formData.metals.length > 1) {
      const updatedMetals = [...formData.metals];
      updatedMetals.splice(index, 1);
      setFormData(prev => ({
        ...prev,
        metals: updatedMetals
      }));
    }
  };

  // Add new stone
  const addStone = () => {
    setFormData(prev => ({
      ...prev,
      stones: [
        ...prev.stones,
        {
          stone_type: "diamond",
          shape: "round",
          color: "G",
          clarity: "VS1",
          carat_weight: "",
          quantity: 1,
          certificate_type: ""
        }
      ]
    }));
  };

  // Remove stone
  const removeStone = (index) => {
    if (formData.stones.length > 1) {
      const updatedStones = [...formData.stones];
      updatedStones.splice(index, 1);
      setFormData(prev => ({
        ...prev,
        stones: updatedStones
      }));
    }
  };

  // Form Validation
  const validateForm = () => {
    const newErrors = {};

    // Basic Info Validation
    if (!formData.item_name.trim()) {
      newErrors.item_name = "Item name is required";
    }

    if (!formData.item_code.trim()) {
      newErrors.item_code = "Item code is required";
    }

    if (!formData.inventory_category_id) {
      newErrors.inventory_category_id = "Inventory category is required";
    }

    if (!formData.branch_id) {
      newErrors.branch_id = "Branch is required";
    }

    // Metals Validation
    formData.metals.forEach((metal, index) => {
      if (!metal.weight || parseFloat(metal.weight) <= 0) {
        newErrors[`metal_weight_${index}`] = "Metal weight must be greater than 0";
      }
    });

    // Stones Validation
    formData.stones.forEach((stone, index) => {
      if (!stone.carat_weight || parseFloat(stone.carat_weight) <= 0) {
        newErrors[`stone_carat_${index}`] = "Carat weight must be greater than 0";
      }
    });

    // Rates Validation
    if (!formData.gold_rate || parseFloat(formData.gold_rate) <= 0) {
      newErrors.gold_rate = "Gold rate is required";
    }

    if (formData.stones.length > 0 && (!formData.stone_rate || parseFloat(formData.stone_rate) <= 0)) {
      newErrors.stone_rate = "Stone rate is required when stones are added";
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
      item_name: formData.item_name.trim(),
      item_code: formData.item_code.trim(),
      description: formData.description.trim(),
      inventory_category_id: formData.inventory_category_id,
      branch_id: formData.branch_id,
      item_type: "jewelry",
      
      // Process metals
      metals: formData.metals.map(metal => ({
        metal_type: metal.metal_type,
        purity: metal.purity,
        weight: parseFloat(metal.weight) || 0,
        color: metal.color,
        hallmark: metal.hallmark || ""
      })),
      
      // Process stones
      stones: formData.stones.map(stone => ({
        stone_type: stone.stone_type,
        shape: stone.shape,
        color: stone.color,
        clarity: stone.clarity,
        carat_weight: parseFloat(stone.carat_weight) || 0,
        quantity: parseInt(stone.quantity) || 1,
        certificate_type: stone.certificate_type || ""
      })),
      
      // Rates
      gold_rate: parseFloat(formData.gold_rate) || 0,
      stone_rate: parseFloat(formData.stone_rate) || 0,
      
      // Making charges
      making_charges: parseFloat(formData.making_charges) || 0,
      making_type: formData.making_type,
      wastage_percentage: parseFloat(formData.wastage_percentage) || 5,
      profit_margin: parseFloat(formData.profit_margin) || 20,
      
      // Stock
      current_stock: parseInt(formData.current_stock) || 1,
      minimum_stock: parseInt(formData.minimum_stock) || 1,
      location_type: formData.location_type,
      
      // Pricing
      mrp: parseFloat(formData.mrp) || 0,
      discount_type: formData.discount_type,
      discount_value: parseFloat(formData.discount_value) || 0,
      
      // Tax
      gst_percentage: parseFloat(formData.gst_percentage) || 3,
      
      // Status
      status: formData.status,
      is_new_arrival: formData.is_new_arrival,
      
      // Arrays
      images: formData.images,
      tags: formData.tags
    };

    console.log("Submitting jewelry item payload:", payload);
    onSave(payload);
  };

  // Metal color options
  const metalColors = [
    { value: "yellow", label: "Yellow Gold" },
    { value: "white", label: "White Gold" },
    { value: "rose", label: "Rose Gold" },
    { value: "platinum", label: "Platinum" },
    { value: "silver", label: "Silver" }
  ];

  // Metal purity options
  const metalPurities = {
    gold: ["24k", "22k", "18k", "14k"],
    silver: ["925", "999"],
    platinum: ["950", "900", "850"],
    other: ["N/A"]
  };

  // Stone shape options
  const stoneShapes = [
    { value: "round", label: "Round" },
    { value: "princess", label: "Princess" },
    { value: "oval", label: "Oval" },
    { value: "marquise", label: "Marquise" },
    { value: "pear", label: "Pear" },
    { value: "cushion", label: "Cushion" },
    { value: "emerald", label: "Emerald" },
    { value: "asscher", label: "Asscher" },
    { value: "radiant", label: "Radiant" },
    { value: "heart", label: "Heart" }
  ];

  // Clarity options
  const clarityOptions = [
    "FL", "IF", "VVS1", "VVS2", "VS1", "VS2", "SI1", "SI2", "I1", "I2", "I3"
  ];

  // Color options for diamonds
  const diamondColors = [
    "D", "E", "F", "G", "H", "I", "J", "K", "L", "M", "N-O", "P-R", "S-Z"
  ];

  return (
    <div
      className="modal fade show d-block"
      style={{ backgroundColor: "rgba(0,0,0,0.5)" }}
      tabIndex="-1"
    >
      <div className="modal-dialog modal-dialog-centered modal-xl">
        <div className="modal-content rounded-3">
          <div className="modal-header border-bottom pb-3">
            <h5 className="modal-title fw-bold fs-5">Add Jewelry Item</h5>
            <button
              type="button"
              className="btn-close"
              onClick={onClose}
              disabled={loading}
              aria-label="Close"
            ></button>
          </div>

          <form onSubmit={handleSubmit}>
            <div className="modal-body" style={{ maxHeight: "70vh", overflowY: "auto" }}>
              {/* Basic Information Section */}
              <div className="mb-4">
                <h6 className="fw-bold text-primary mb-3">Basic Information</h6>
                
                <div className="row g-3">
                  <div className="col-md-6">
                    <label className="form-label fw-medium">
                      Item Name <span className="text-danger">*</span>
                    </label>
                    <input
                      type="text"
                      name="item_name"
                      className={`form-control ${errors.item_name ? "is-invalid" : ""}`}
                      placeholder="e.g., Gold Diamond Ring, Silver Necklace"
                      value={formData.item_name}
                      onChange={handleChange}
                      disabled={loading}
                    />
                    {errors.item_name && (
                      <div className="invalid-feedback">{errors.item_name}</div>
                    )}
                  </div>

                  <div className="col-md-6">
                    <label className="form-label fw-medium">
                      Item Code <span className="text-danger">*</span>
                    </label>
                    <div className="input-group">
                      <input
                        type="text"
                        name="item_code"
                        className={`form-control ${errors.item_code ? "is-invalid" : ""}`}
                        placeholder="e.g., JWL-001"
                        value={formData.item_code}
                        onChange={handleChange}
                        disabled={loading}
                      />
                      <div className="input-group-text">
                        <input
                          className="form-check-input mt-0"
                          type="checkbox"
                          checked={autoGenerateCode}
                          onChange={(e) => setAutoGenerateCode(e.target.checked)}
                          disabled={loading}
                        />
                        <span className="ms-2 small">Auto-generate</span>
                      </div>
                    </div>
                    {errors.item_code && (
                      <div className="invalid-feedback">{errors.item_code}</div>
                    )}
                  </div>

                  <div className="col-12">
                    <label className="form-label fw-medium">Description</label>
                    <textarea
                      name="description"
                      className="form-control"
                      rows="2"
                      placeholder="Enter item description..."
                      value={formData.description}
                      onChange={handleChange}
                      disabled={loading}
                    />
                  </div>

                  <div className="col-md-6">
                    <label className="form-label fw-medium">
                      Inventory Category <span className="text-danger">*</span>
                    </label>
                    <select
                      name="inventory_category_id"
                      className={`form-select ${errors.inventory_category_id ? "is-invalid" : ""}`}
                      value={formData.inventory_category_id}
                      onChange={handleChange}
                      disabled={loading}
                    >
                      <option value="">Select Category</option>
                      {inventoryCategories.map((category) => (
                        <option key={category._id} value={category._id}>
                          {category.name}
                        </option>
                      ))}
                    </select>
                    {errors.inventory_category_id && (
                      <div className="invalid-feedback">{errors.inventory_category_id}</div>
                    )}
                  </div>

                  <div className="col-md-6">
                    <label className="form-label fw-medium">
                      Branch <span className="text-danger">*</span>
                    </label>
                    <select
                      name="branch_id"
                      className={`form-select ${errors.branch_id ? "is-invalid" : ""}`}
                      value={formData.branch_id}
                      onChange={handleChange}
                      disabled={loading}
                    >
                      <option value="">Select Branch</option>
                      {branches.map((branch) => (
                        <option key={branch._id} value={branch._id}>
                          {branch.name}
                        </option>
                      ))}
                    </select>
                    {errors.branch_id && (
                      <div className="invalid-feedback">{errors.branch_id}</div>
                    )}
                  </div>
                </div>
              </div>

              {/* Metals Section */}
              <div className="mb-4">
                <div className="d-flex justify-content-between align-items-center mb-3">
                  <h6 className="fw-bold text-primary mb-0">Metals Information</h6>
                  <button
                    type="button"
                    className="btn btn-sm btn-outline-primary"
                    onClick={addMetal}
                    disabled={loading}
                  >
                    <FiPlus size={14} /> Add Metal
                  </button>
                </div>
                
                {formData.metals.map((metal, index) => (
                  <div key={index} className="card mb-3">
                    <div className="card-body">
                      <div className="d-flex justify-content-between align-items-center mb-2">
                        <h6 className="mb-0">Metal #{index + 1}</h6>
                        {formData.metals.length > 1 && (
                          <button
                            type="button"
                            className="btn btn-sm btn-outline-danger"
                            onClick={() => removeMetal(index)}
                            disabled={loading}
                          >
                            <FiTrash2 size={14} />
                          </button>
                        )}
                      </div>
                      
                      <div className="row g-3">
                        <div className="col-md-3">
                          <label className="form-label fw-medium">Metal Type</label>
                          <select
                            className="form-select"
                            value={metal.metal_type}
                            onChange={(e) => handleMetalChange(index, 'metal_type', e.target.value)}
                            disabled={loading}
                          >
                            {metalTypes.map((type) => (
                              <option key={type._id} value={type._id}>
                                {type.name}
                              </option>
                            ))}
                          </select>
                        </div>

                        <div className="col-md-2">
                          <label className="form-label fw-medium">Purity</label>
                          <select
                            className="form-select"
                            value={metal.purity}
                            onChange={(e) => handleMetalChange(index, 'purity', e.target.value)}
                            disabled={loading}
                          >
                            {metalPurities[metal.metal_type]?.map((purity) => (
                              <option key={purity} value={purity}>
                                {purity}
                              </option>
                            )) || <option value="N/A">N/A</option>}
                          </select>
                        </div>

                        <div className="col-md-2">
                          <label className="form-label fw-medium">
                            Weight (grams) <span className="text-danger">*</span>
                          </label>
                          <input
                            type="text"
                            className={`form-control ${errors[`metal_weight_${index}`] ? "is-invalid" : ""}`}
                            placeholder="e.g., 3.2"
                            value={metal.weight}
                            onChange={(e) => handleMetalChange(index, 'weight', e.target.value)}
                            disabled={loading}
                          />
                          {errors[`metal_weight_${index}`] && (
                            <div className="invalid-feedback">{errors[`metal_weight_${index}`]}</div>
                          )}
                        </div>

                        <div className="col-md-3">
                          <label className="form-label fw-medium">Color</label>
                          <select
                            className="form-select"
                            value={metal.color}
                            onChange={(e) => handleMetalChange(index, 'color', e.target.value)}
                            disabled={loading}
                          >
                            <option value="">Select Color</option>
                            {metalColors.map((color) => (
                              <option key={color.value} value={color.value}>
                                {color.label}
                              </option>
                            ))}
                          </select>
                        </div>

                        <div className="col-md-2">
                          <label className="form-label fw-medium">Hallmark</label>
                          <input
                            type="text"
                            className="form-control"
                            placeholder="e.g., 916"
                            value={metal.hallmark}
                            onChange={(e) => handleMetalChange(index, 'hallmark', e.target.value)}
                            disabled={loading}
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Stones Section */}
              <div className="mb-4">
                <div className="d-flex justify-content-between align-items-center mb-3">
                  <h6 className="fw-bold text-primary mb-0">Stones Information</h6>
                  <button
                    type="button"
                    className="btn btn-sm btn-outline-primary"
                    onClick={addStone}
                    disabled={loading}
                  >
                    <FiPlus size={14} /> Add Stone
                  </button>
                </div>
                
                {formData.stones.map((stone, index) => (
                  <div key={index} className="card mb-3">
                    <div className="card-body">
                      <div className="d-flex justify-content-between align-items-center mb-2">
                        <h6 className="mb-0">Stone #{index + 1}</h6>
                        {formData.stones.length > 1 && (
                          <button
                            type="button"
                            className="btn btn-sm btn-outline-danger"
                            onClick={() => removeStone(index)}
                            disabled={loading}
                          >
                            <FiTrash2 size={14} />
                          </button>
                        )}
                      </div>
                      
                      <div className="row g-3">
                        <div className="col-md-3">
                          <label className="form-label fw-medium">Stone Type</label>
                          <select
                            className="form-select"
                            value={stone.stone_type}
                            onChange={(e) => handleStoneChange(index, 'stone_type', e.target.value)}
                            disabled={loading}
                          >
                            {stoneTypes.map((type) => (
                              <option key={type._id} value={type._id}>
                                {type.name}
                              </option>
                            ))}
                          </select>
                        </div>

                        <div className="col-md-2">
                          <label className="form-label fw-medium">Shape</label>
                          <select
                            className="form-select"
                            value={stone.shape}
                            onChange={(e) => handleStoneChange(index, 'shape', e.target.value)}
                            disabled={loading}
                          >
                            {stoneShapes.map((shape) => (
                              <option key={shape.value} value={shape.value}>
                                {shape.label}
                              </option>
                            ))}
                          </select>
                        </div>

                        <div className="col-md-2">
                          <label className="form-label fw-medium">Color</label>
                          <select
                            className="form-select"
                            value={stone.color}
                            onChange={(e) => handleStoneChange(index, 'color', e.target.value)}
                            disabled={loading}
                          >
                            {diamondColors.map((color) => (
                              <option key={color} value={color}>
                                {color}
                              </option>
                            ))}
                          </select>
                        </div>

                        <div className="col-md-2">
                          <label className="form-label fw-medium">Clarity</label>
                          <select
                            className="form-select"
                            value={stone.clarity}
                            onChange={(e) => handleStoneChange(index, 'clarity', e.target.value)}
                            disabled={loading}
                          >
                            {clarityOptions.map((clarity) => (
                              <option key={clarity} value={clarity}>
                                {clarity}
                              </option>
                            ))}
                          </select>
                        </div>

                        <div className="col-md-2">
                          <label className="form-label fw-medium">
                            Carat Weight <span className="text-danger">*</span>
                          </label>
                          <input
                            type="text"
                            className={`form-control ${errors[`stone_carat_${index}`] ? "is-invalid" : ""}`}
                            placeholder="e.g., 0.5"
                            value={stone.carat_weight}
                            onChange={(e) => handleStoneChange(index, 'carat_weight', e.target.value)}
                            disabled={loading}
                          />
                          {errors[`stone_carat_${index}`] && (
                            <div className="invalid-feedback">{errors[`stone_carat_${index}`]}</div>
                          )}
                        </div>

                        <div className="col-md-1">
                          <label className="form-label fw-medium">Quantity</label>
                          <input
                            type="number"
                            className="form-control"
                            value={stone.quantity}
                            onChange={(e) => handleStoneChange(index, 'quantity', e.target.value)}
                            disabled={loading}
                          />
                        </div>
                      </div>
                      
                      <div className="row mt-3">
                        <div className="col-md-6">
                          <label className="form-label fw-medium">Certificate Type</label>
                          <input
                            type="text"
                            className="form-control"
                            placeholder="e.g., GIA, IGI, HRD"
                            value={stone.certificate_type}
                            onChange={(e) => handleStoneChange(index, 'certificate_type', e.target.value)}
                            disabled={loading}
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Rates Section */}
              <div className="mb-4">
                <h6 className="fw-bold text-primary mb-3">Rates</h6>
                
                <div className="row g-3">
                  <div className="col-md-6">
                    <label className="form-label fw-medium">
                      Gold Rate (per gram) <span className="text-danger">*</span>
                    </label>
                    <input
                      type="text"
                      name="gold_rate"
                      className={`form-control ${errors.gold_rate ? "is-invalid" : ""}`}
                      placeholder="e.g., 5000"
                      value={formData.gold_rate}
                      onChange={handleNumericChange}
                      disabled={loading}
                    />
                    {errors.gold_rate && (
                      <div className="invalid-feedback">{errors.gold_rate}</div>
                    )}
                  </div>

                  <div className="col-md-6">
                    <label className="form-label fw-medium">
                      Stone Rate (per carat)
                    </label>
                    <input
                      type="text"
                      name="stone_rate"
                      className={`form-control ${errors.stone_rate ? "is-invalid" : ""}`}
                      placeholder="e.g., 80000"
                      value={formData.stone_rate}
                      onChange={handleNumericChange}
                      disabled={loading}
                    />
                    {errors.stone_rate && (
                      <div className="invalid-feedback">{errors.stone_rate}</div>
                    )}
                  </div>
                </div>
              </div>

              {/* Making Charges Section */}
              <div className="mb-4">
                <h6 className="fw-bold text-primary mb-3">Making Charges</h6>
                
                <div className="row g-3">
                  <div className="col-md-4">
                    <label className="form-label fw-medium">Making Type</label>
                    <select
                      name="making_type"
                      className="form-select"
                      value={formData.making_type}
                      onChange={handleChange}
                      disabled={loading}
                    >
                      <option value="percentage">Percentage of Metal Cost</option>
                      <option value="per_gram">Per Gram</option>
                      <option value="fixed">Fixed Amount</option>
                    </select>
                  </div>

                  <div className="col-md-4">
                    <label className="form-label fw-medium">Making Charges</label>
                    <input
                      type="text"
                      name="making_charges"
                      className="form-control"
                      placeholder={formData.making_type === "percentage" ? "e.g., 15" : "e.g., 500"}
                      value={formData.making_charges}
                      onChange={handleNumericChange}
                      disabled={loading}
                    />
                  </div>

                  <div className="col-md-4">
                    <label className="form-label fw-medium">Wastage Percentage</label>
                    <input
                      type="text"
                      name="wastage_percentage"
                      className="form-control"
                      placeholder="e.g., 5"
                      value={formData.wastage_percentage}
                      onChange={handleNumericChange}
                      disabled={loading}
                    />
                  </div>
                </div>
              </div>

              {/* Pricing Section */}
              <div className="mb-4">
                <h6 className="fw-bold text-primary mb-3">Pricing</h6>
                
                <div className="row g-3">
                  <div className="col-md-4">
                    <label className="form-label fw-medium">Profit Margin (%)</label>
                    <input
                      type="text"
                      name="profit_margin"
                      className="form-control"
                      placeholder="e.g., 20"
                      value={formData.profit_margin}
                      onChange={handleNumericChange}
                      disabled={loading}
                    />
                  </div>

                  <div className="col-md-4">
                    <label className="form-label fw-medium">MRP (₹)</label>
                    <input
                      type="text"
                      name="mrp"
                      className="form-control"
                      placeholder="e.g., 87320"
                      value={formData.mrp}
                      onChange={handleNumericChange}
                      disabled={loading}
                    />
                  </div>

                  <div className="col-md-4">
                    <label className="form-label fw-medium">Discount Type</label>
                    <select
                      name="discount_type"
                      className="form-select"
                      value={formData.discount_type}
                      onChange={handleChange}
                      disabled={loading}
                    >
                      <option value="none">No Discount</option>
                      <option value="percentage">Percentage</option>
                      <option value="fixed">Fixed Amount</option>
                    </select>
                  </div>

                  {formData.discount_type !== "none" && (
                    <div className="col-md-4">
                      <label className="form-label fw-medium">Discount Value</label>
                      <input
                        type="text"
                        name="discount_value"
                        className="form-control"
                        placeholder={formData.discount_type === "percentage" ? "e.g., 10" : "e.g., 1000"}
                        value={formData.discount_value}
                        onChange={handleNumericChange}
                        disabled={loading}
                      />
                    </div>
                  )}
                </div>
              </div>

              {/* Stock & Location Section */}
              <div className="mb-4">
                <h6 className="fw-bold text-primary mb-3">Stock & Location</h6>
                
                <div className="row g-3">
                  <div className="col-md-4">
                    <label className="form-label fw-medium">Current Stock</label>
                    <input
                      type="number"
                      name="current_stock"
                      className="form-control"
                      placeholder="e.g., 1"
                      value={formData.current_stock}
                      onChange={handleNumericChange}
                      disabled={loading}
                    />
                  </div>

                  <div className="col-md-4">
                    <label className="form-label fw-medium">Minimum Stock</label>
                    <input
                      type="number"
                      name="minimum_stock"
                      className="form-control"
                      placeholder="e.g., 1"
                      value={formData.minimum_stock}
                      onChange={handleNumericChange}
                      disabled={loading}
                    />
                  </div>

                  <div className="col-md-4">
                    <label className="form-label fw-medium">Location Type</label>
                    <select
                      name="location_type"
                      className="form-select"
                      value={formData.location_type}
                      onChange={handleChange}
                      disabled={loading}
                    >
                      <option value="showcase">Showcase</option>
                      <option value="vault">Vault</option>
                      <option value="workshop">Workshop</option>
                      <option value="storage">Storage</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* Tax Section */}
              <div className="mb-4">
                <h6 className="fw-bold text-primary mb-3">Tax Information</h6>
                
                <div className="row g-3">
                  <div className="col-md-6">
                    <label className="form-label fw-medium">GST Percentage (%)</label>
                    <input
                      type="text"
                      name="gst_percentage"
                      className="form-control"
                      placeholder="e.g., 3"
                      value={formData.gst_percentage}
                      onChange={handleNumericChange}
                      disabled={loading}
                    />
                  </div>
                </div>
              </div>

              {/* Status Section */}
              <div className="mb-4">
                <h6 className="fw-bold text-primary mb-3">Status</h6>
                
                <div className="row g-3">
                  <div className="col-md-6">
                    <div className="form-check">
                      <input
                        className="form-check-input"
                        type="checkbox"
                        name="is_new_arrival"
                        id="isNewArrival"
                        checked={formData.is_new_arrival}
                        onChange={(e) => setFormData(prev => ({
                          ...prev,
                          is_new_arrival: e.target.checked
                        }))}
                        disabled={loading}
                      />
                      <label className="form-check-label" htmlFor="isNewArrival">
                        Mark as New Arrival
                      </label>
                    </div>
                  </div>

                  <div className="col-md-6">
                    <label className="form-label fw-medium">Item Status</label>
                    <select
                      name="status"
                      className="form-select"
                      value={formData.status}
                      onChange={handleChange}
                      disabled={loading}
                    >
                      <option value="active">Active</option>
                      <option value="inactive">Inactive</option>
                      <option value="sold_out">Sold Out</option>
                      <option value="discontinued">Discontinued</option>
                    </select>
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
                    Save Jewelry Item
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