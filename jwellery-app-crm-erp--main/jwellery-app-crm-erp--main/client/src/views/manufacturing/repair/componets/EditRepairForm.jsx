// components/repairs/EditRepairForm.jsx
import React, { useState, useEffect, useRef } from "react";
import {
  FiSave,
  FiCalendar,
  FiUser,
  FiDollarSign,
  FiFileText,
  FiTool,
  FiPackage,
  FiSearch,
  FiX,
  FiPlus,
  FiImage, // Add this icon
  FiTrash2, // Add this icon
  FiCamera
} from "react-icons/fi";
import { BsTools } from "react-icons/bs";
import AddCustomerForm from "@/views/user/customer/components/AddCustomerForm";

const EditRepairForm = ({ 
  repair,
  onClose, 
  onSave, 
  onAddCustomer,
  loading = false,
  customers = [],
  customerGroups = [],
  employees = [],
  saleItems = [],
  statusOptions = [],
  accountOptions = []
}) => {
  const [formData, setFormData] = useState({
    product_name: "",
    product_module: "",
    problem_description: "",
    repair_charge: "",
    paid_amount: "",
    due_amount: "0",
    customer_id: "",
    delivery_date: "",
    receiving_date: "",
    employee_id: "",
    status: "pending",
    account: "cash",
    note: "",
    product_type: "existing",
    selected_product_id: "",
    product_code: "",
    sale_item_id: null,
    repair_images: [], // Add this field
  });

  // console.log(repair)

  const [errors, setErrors] = useState({});
  const [isInitialized, setIsInitialized] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [showSearchResults, setShowSearchResults] = useState(false);
  const [productType, setProductType] = useState("existing");
  const [previewImages, setPreviewImages] = useState([]);
  const [existingImages, setExistingImages] = useState([]); // For existing images from repair
  const [deletedImageIds, setDeletedImageIds] = useState([]); // Track deleted images
  const searchRef = useRef(null);
  const fileInputRef = useRef(null);
  const [showCustomerModal, setShowCustomerModal] = useState(false);
  const [addingCustomer, setAddingCustomer] = useState(false);

  // Initialize form with repair data
  useEffect(() => {
    if (repair && !isInitialized) {
      console.log("Initializing edit form with repair:", repair);
      
      // Calculate due amount
      const repairCharge = parseFloat(repair.repair_charge) || 0;
      const paidAmount = parseFloat(repair.paid_amount) || 0;
      const dueAmount = repairCharge - paidAmount;

      // Determine product type
      const repairProductType = repair.product_type || (repair.product_id ? "existing" : "manual");
      
      // Find the sale item if it exists
      let selectedSaleItem = null;
      if (repair.sale_item_id && saleItems.length > 0) {
        selectedSaleItem = saleItems.find(item => item._id === repair.sale_item_id);
      }

      // Handle existing images
      const repairImages = repair.repair_images || [];
      const existingImagePreviews = repairImages.map(img => ({
        url: img.url || img,
        id: img._id || img,
        name: img.filename || img.originalname || `image_${repairImages.indexOf(img)}`,
        isExisting: true
      }));

      const initialFormData = {
        product_name: repair.product_name || "",
        product_module: repair.product_module || "",
        problem_description: repair.problem_description || "",
        repair_charge: repairCharge.toString(),
        paid_amount: paidAmount.toString(),
        due_amount: dueAmount.toString(),
        customer_id: repair.customer_id?._id || repair.customer_id || "",
        delivery_date: repair.delivery_date ? repair.delivery_date.split("T")[0] : "",
        receiving_date: repair.receiving_date ? repair.receiving_date.split("T")[0] : new Date().toISOString().split("T")[0],
        employee_id: repair.employee_id?._id || repair.employee_id || "",
        status: repair.status || "pending",
        account: repair.account || "cash",
        note: repair.note || "",
        product_type: repairProductType,
        selected_product_id: repair.sale_item_id || "",
        product_code: repair.product_code || "",
        product_id: repair.product_id || null,
        sale_item_id: repair.sale_item_id || null,
        is_custom_product: repair.is_custom_product || false,
        repair_images: [], // Will be empty for existing, we'll handle new uploads separately
      };

      console.log("Initial form data:", initialFormData);
      setFormData(initialFormData);
      setProductType(repairProductType);
      setExistingImages(existingImagePreviews);
      setPreviewImages([]); // Start with empty for new uploads
      
      // Set search query if product is from sales
      if (selectedSaleItem) {
        setSearchQuery(selectedSaleItem.product_name);
      }
      
      setIsInitialized(true);
    }
  }, [repair, isInitialized, saleItems]);

  // Calculate due amount when repair charge or paid amount changes
  useEffect(() => {
    if (formData.repair_charge || formData.paid_amount) {
      const repairCharge = parseFloat(formData.repair_charge) || 0;
      const paidAmount = parseFloat(formData.paid_amount) || 0;
      const dueAmount = repairCharge - paidAmount;
      
      setFormData(prev => ({
        ...prev,
        due_amount: dueAmount > 0 ? dueAmount.toString() : "0"
      }));
    }
  }, [formData.repair_charge, formData.paid_amount]);

  // Handle search input
  useEffect(() => {
    if (searchQuery.trim() === "") {
      setSearchResults([]);
      setShowSearchResults(false);
      return;
    }

    const searchLower = searchQuery.toLowerCase();
    const results = saleItems.filter((item) => {
      return (
        (item.product_name &&
          item.product_name.toLowerCase().includes(searchLower)) ||
        (item.product_code &&
          item.product_code.toLowerCase().includes(searchLower)) ||
        (item.customer_name &&
          item.customer_name.toLowerCase().includes(searchLower)) ||
        (item.sale_reference_no &&
          item.sale_reference_no.toLowerCase().includes(searchLower)) ||
        (item.invoice_number &&
          item.invoice_number.toLowerCase().includes(searchLower))
      );
    });

    setSearchResults(results.slice(0, 10));
    setShowSearchResults(results.length > 0);
  }, [searchQuery, saleItems]);

  // Close search results when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (searchRef.current && !searchRef.current.contains(event.target)) {
        setShowSearchResults(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  // Handle new image upload
  const handleImageUpload = (event) => {
    const files = Array.from(event.target.files);
    
    // Validate file types
    const validFiles = files.filter(file => {
      const validTypes = ['image/jpeg', 'image/png', 'image/jpg', 'image/gif', 'image/webp'];
      return validTypes.includes(file.type);
    });

    // Validate file size (max 5MB each)
    const sizeValidFiles = validFiles.filter(file => {
      return file.size <= 5 * 1024 * 1024; // 5MB
    });

    if (sizeValidFiles.length === 0) {
      alert('Please select valid image files (JPEG, PNG, GIF, WebP) under 5MB');
      return;
    }

    // Create preview URLs for new files
    const newPreviewUrls = sizeValidFiles.map(file => ({
      file: file,
      preview: URL.createObjectURL(file),
      name: file.name,
      size: (file.size / (1024 * 1024)).toFixed(2) + ' MB',
      isNew: true
    }));

    // Update form data with new files
    setFormData(prev => ({
      ...prev,
      repair_images: [...prev.repair_images, ...sizeValidFiles]
    }));

    // Add to preview images
    setPreviewImages(prev => [...prev, ...newPreviewUrls]);

    // Clear file input
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  // Remove new image (not yet uploaded)
  const removeNewImage = (index) => {
    // Revoke object URL to prevent memory leak
    if (previewImages[index] && previewImages[index].preview) {
      URL.revokeObjectURL(previewImages[index].preview);
    }

    // Find the actual file index in previewImages
    const newImages = previewImages.filter((_, i) => i !== index);
    const newFiles = newImages.filter(img => img.isNew).map(img => img.file);

    // Update form data
    setFormData(prev => ({
      ...prev,
      repair_images: newFiles
    }));

    // Update preview images
    setPreviewImages(newImages);
  };

  // Remove existing image
  const removeExistingImage = (imageId) => {
    // Add to deleted images list
    setDeletedImageIds(prev => [...prev, imageId]);
    
    // Remove from existing images display
    setExistingImages(prev => prev.filter(img => img.id !== imageId));
  };

  // Restore deleted existing image
  const restoreExistingImage = (imageId) => {
    // Remove from deleted images list
    setDeletedImageIds(prev => prev.filter(id => id !== imageId));
    
    // Restore to existing images (you might need to fetch the original image data)
    const imageToRestore = repair.repair_images?.find(img => 
      img._id === imageId || img === imageId
    );
    if (imageToRestore) {
      const restoredImage = {
        url: imageToRestore.url || imageToRestore,
        id: imageToRestore._id || imageToRestore,
        name: imageToRestore.filename || imageToRestore.originalname || 'Restored Image',
        isExisting: true
      };
      setExistingImages(prev => [...prev, restoredImage]);
    }
  };

  // Clean up preview URLs on component unmount
  useEffect(() => {
    return () => {
      previewImages.forEach(image => {
        if (image.preview && image.isNew) {
          URL.revokeObjectURL(image.preview);
        }
      });
    };
  }, [previewImages]);

  // Handle product selection from search
  const handleProductSelect = (item) => {
    setFormData((prev) => ({
      ...prev,
      product_type: "existing",
      selected_product_id: item._id,
      product_id: item.product_id,
      product_name: item.product_name,
      product_code: item.product_code || "",
      // Auto-fill customer if available
      customer_id: item.customer_id || prev.customer_id,
      sale_item_id: item._id,
    }));

    setSearchQuery(item.product_name);
    setShowSearchResults(false);
    setSearchResults([]);
  };

  // Handle customer addition
  const handleAddCustomer = async (customerData) => {
    try {
      setAddingCustomer(true);

      if (onAddCustomer) {
        const response = await onAddCustomer(customerData);

        if (response) {
          // Update form with new customer
          setFormData((prev) => ({
            ...prev,
            customer_id: response._id,
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

  // Validate form
  const validateForm = () => {
    const newErrors = {};

    // Validate product name
    if (productType === "existing" && !formData.selected_product_id) {
      newErrors.product_name = "Please select a product from the list";
    } else if (productType === "manual" && !formData.product_name.trim()) {
      newErrors.product_name = "Product name is required";
    }

    if (!formData.problem_description.trim()) {
      newErrors.problem_description = "Problem description is required";
    }

    if (!formData.repair_charge || parseFloat(formData.repair_charge) <= 0) {
      newErrors.repair_charge = "Valid repair charge is required";
    }

    const paidAmount = parseFloat(formData.paid_amount) || 0;
    const repairCharge = parseFloat(formData.repair_charge) || 0;
    if (paidAmount < 0 || paidAmount > repairCharge) {
      newErrors.paid_amount = "Paid amount must be between 0 and repair charge";
    }

    if (!formData.customer_id) {
      newErrors.customer_id = "Customer is required";
    }

    if (!formData.receiving_date) {
      newErrors.receiving_date = "Receiving date is required";
    }

    if (!formData.employee_id) {
      newErrors.employee_id = "Employee is required";
    }

    if (
      formData.delivery_date &&
      new Date(formData.delivery_date) < new Date(formData.receiving_date)
    ) {
      newErrors.delivery_date = "Delivery date cannot be before receiving date";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));

    // Clear error for this field
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: "" }));
    }

    // If switching to manual mode, clear selected product
    if (name === "product_type") {
      setProductType(value);
      if (value === "manual") {
        setFormData((prev) => ({
          ...prev,
          selected_product_id: "",
          product_id: "",
          product_code: "",
          sale_item_id: null,
        }));
        setSearchQuery("");
      }
    }
  };

  // Handle manual product name change
  const handleManualProductChange = (e) => {
    const { value } = e.target;
    setFormData((prev) => ({
      ...prev,
      product_name: value,
      product_type: "manual",
      selected_product_id: "",
      product_id: "",
      product_code: "",
      sale_item_id: null,
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    const payload = {
      product_name: formData.product_name,
      product_module: formData.product_module,
      problem_description: formData.problem_description,
      repair_charge: parseFloat(formData.repair_charge),
      paid_amount: parseFloat(formData.paid_amount) || 0,
      due_amount: parseFloat(formData.due_amount) || 0,
      customer_id: formData.customer_id,
      delivery_date: formData.delivery_date || null,
      receiving_date: formData.receiving_date,
      employee_id: formData.employee_id,
      status: formData.status,
      account: formData.account,
      note: formData.note,
      product_type: productType,
      product_id: productType === "existing" ? formData.product_id : null,
      product_code: formData.product_code || "",
      is_custom_product: productType === "manual",
      sale_item_id: productType === "existing" ? formData.sale_item_id : null,
      repair_images: formData.repair_images, // New images
    };

    console.log("Updating repair data:", payload);
    onSave(payload);
  };

  const handleClose = () => {
    // Clean up preview URLs
    previewImages.forEach(image => {
      if (image.preview && image.isNew) {
        URL.revokeObjectURL(image.preview);
      }
    });

    setFormData({
      product_name: "",
      product_module: "",
      problem_description: "",
      repair_charge: "",
      paid_amount: "",
      due_amount: "0",
      customer_id: "",
      delivery_date: "",
      receiving_date: new Date().toISOString().split("T")[0],
      employee_id: "",
      status: "pending",
      account: "cash",
      note: "",
      product_type: "existing",
      selected_product_id: "",
      product_code: "",
      sale_item_id: null,
      repair_images: [],
    });
    setErrors({});
    setSearchQuery("");
    setSearchResults([]);
    setPreviewImages([]);
    setExistingImages([]);
    setDeletedImageIds([]);
    setShowSearchResults(false);
    setProductType("existing");
    setIsInitialized(false);
    onClose();
  };

  const isDisabled = loading || !isInitialized;

  // Check if repair is editable
  const isEditable = !["delivered", "cancelled"].includes(repair?.status);

  // Format currency for display
  const formatCurrency = (amount) => {
    return `₹${parseFloat(amount || 0).toLocaleString("en-IN", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })}`;
  };

  // Format date for display
  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    const date = new Date(dateString);
    return date.toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  };

  if (!repair) {
    return (
      <div
        className="modal fade show d-block"
        style={{
          backgroundColor: "rgba(0,0,0,0.5)",
          overflowY: "auto",
          minHeight: "100vh",
        }}
        tabIndex="-1"
      >
        <div className="modal-dialog modal-dialog-centered modal-lg">
          <div
            className="modal-content rounded-3"
            style={{ maxHeight: "100vh", overflow: "hidden" }}
          >
            <div className="modal-header border-bottom pb-3">
              <h5 className="modal-title fw-bold fs-5">Edit Repair</h5>
              <button
                type="button"
                className="btn-close"
                onClick={handleClose}
                disabled={isDisabled}
                aria-label="Close"
              ></button>
            </div>
            <div className="modal-body text-center py-5">
              <div className="spinner-border text-primary" role="status">
                <span className="visually-hidden">Loading...</span>
              </div>
              <p className="mt-3">Loading repair data...</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div
      className="modal fade show d-block"
      style={{
        backgroundColor: "rgba(0,0,0,0.5)",
        overflowY: "auto",
        maxHeight: "100vh",
      }}
      tabIndex="-1"
    >
      <div className="modal-dialog modal-dialog-centered modal-lg">
        <div
          className="modal-content rounded-3"
          style={{ maxHeight: "100vh", overflow: "hidden" }}
        >
          <div
            className="modal-header border-bottom pb-3 sticky-top bg-white"
            style={{ zIndex: 1020 }}
          >
            <div>
              <h5 className="modal-title fw-bold fs-5">
                <BsTools className="me-2" />
                Edit Repair
              </h5>
              {repair?.repair_number && (
                <div className="small text-muted">
                  Repair #: {repair.repair_number}
                  {repair.status && (
                    <span className={`badge ms-2 ${
                      repair.status === "pending" ? "bg-warning" : 
                      repair.status === "in_progress" ? "bg-primary" :
                      repair.status === "delivered" ? "bg-success" :
                      repair.status === "cancelled" ? "bg-danger" : "bg-info"
                    }`}>
                      {repair.status.replace("_", " ").toUpperCase()}
                    </span>
                  )}
                </div>
              )}
            </div>
            <button
              type="button"
              className="btn-close"
              onClick={handleClose}
              disabled={isDisabled}
              aria-label="Close"
            ></button>
          </div>

          <form onSubmit={handleSubmit}>
            <div
              className="modal-body"
              style={{ overflowY: "auto", maxHeight: "calc(90vh - 130px)" }}
            >
              {/* Read-only warning for non-editable repairs */}
              {!isEditable && (
                <div className="alert alert-warning mb-4">
                  <FiTool className="me-2" />
                  This repair is <strong>{repair?.status}</strong> and can only be viewed, not edited.
                </div>
              )}

              {/* Repair Number Display */}
              <div className="alert alert-info mb-4">
                <div className="d-flex justify-content-between align-items-center">
                  <div>
                    <strong>Repair Number:</strong> {repair.repair_number}
                  </div>
                  <div>
                    <strong>Created:</strong> {formatDate(repair.created_at)}
                  </div>
                </div>
              </div>

              {/* Product Information */}
              <div className="card border mb-4">
                <div className="card-header bg-light">
                  <h6 className="fw-bold mb-0">
                    <FiPackage className="me-2" />
                    Product Information
                  </h6>
                </div>
                <div className="card-body">
                  {/* Product Type Selection */}
                  <div className="mb-4">
                    <label className="form-label fw-medium">
                      Select Product Type
                    </label>
                    <div className="d-flex gap-3">
                      <div className="form-check">
                        <input
                          className="form-check-input"
                          type="radio"
                          name="product_type"
                          id="existingProduct"
                          value="existing"
                          checked={productType === "existing"}
                          onChange={handleChange}
                          disabled={isDisabled || !isEditable}
                        />
                        <label
                          className="form-check-label"
                          htmlFor="existingProduct"
                        >
                          Select from Sales Items
                        </label>
                      </div>
                      <div className="form-check">
                        <input
                          className="form-check-input"
                          type="radio"
                          name="product_type"
                          id="manualProduct"
                          value="manual"
                          checked={productType === "manual"}
                          onChange={handleChange}
                          disabled={isDisabled || !isEditable}
                        />
                        <label
                          className="form-check-label"
                          htmlFor="manualProduct"
                        >
                          Enter Manually
                        </label>
                      </div>
                    </div>
                  </div>

                  {/* Existing Product Search */}
                  {productType === "existing" && (
                    <div className="mb-4" ref={searchRef}>
                      <label className="form-label fw-medium">
                        Search Product <span className="text-danger">*</span>
                      </label>
                      <div className="position-relative">
                        <div className="input-group">
                          <span className="input-group-text">
                            <FiSearch size={16} />
                          </span>
                          <input
                            type="text"
                            className={`form-control ${
                              errors.product_name ? "is-invalid" : ""
                            }`}
                            placeholder="Search by product name, code, customer, or invoice..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            disabled={isDisabled || !isEditable}
                          />
                          {searchQuery && (
                            <button
                              type="button"
                              className="input-group-text"
                              onClick={() => {
                                setSearchQuery("");
                                setSearchResults([]);
                                setShowSearchResults(false);
                              }}
                              disabled={isDisabled || !isEditable}
                            >
                              <FiX size={16} />
                            </button>
                          )}
                        </div>

                        {/* Search Results Dropdown */}
                        {showSearchResults && searchResults.length > 0 && (
                          <div
                            className="position-absolute w-100 bg-white border rounded shadow-lg mt-1 z-3"
                            style={{ maxHeight: "300px", overflowY: "auto" }}
                          >
                            {searchResults.map((item) => (
                              <div
                                key={item._id}
                                className="p-3 border-bottom hover-bg-light cursor-pointer"
                                onClick={() => isEditable && handleProductSelect(item)}
                                style={{ 
                                  cursor: isEditable ? 'pointer' : 'not-allowed',
                                  opacity: isEditable ? 1 : 0.6 
                                }}
                              >
                                <div className="d-flex justify-content-between align-items-start">
                                  <div className="flex-grow-1">
                                    <div className="fw-medium">
                                      {item.product_name}
                                    </div>
                                    <div className="small text-muted">
                                      Code: {item.product_code || "N/A"} | Qty:{" "}
                                      {item.quantity}
                                    </div>
                                    <div className="small text-muted mt-1">
                                      Customer: {item.customer_name} | Invoice:{" "}
                                      {item.invoice_number ||
                                        item.sale_reference_no}
                                    </div>
                                    <div className="small text-muted">
                                      Date: {formatDate(item.sale_date)} |
                                      Price: {formatCurrency(item.price)}
                                    </div>
                                  </div>
                                  {isEditable && (
                                    <button
                                      type="button"
                                      className="btn btn-sm btn-primary"
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        handleProductSelect(item);
                                      }}
                                    >
                                      Select
                                    </button>
                                  )}
                                </div>
                              </div>
                            ))}
                          </div>
                        )}

                        {/* Selected Product Display */}
                        {formData.selected_product_id && (
                          <div className="mt-3 p-3 border rounded bg-success-subtle">
                            <div className="d-flex justify-content-between align-items-center">
                              <div>
                                <div className="fw-medium text-success">
                                  ✓ Selected Product
                                </div>
                                <div className="mt-1">
                                  <span className="fw-medium">
                                    {formData.product_name}
                                  </span>
                                  {formData.product_code && (
                                    <span className="ms-2 text-muted">
                                      ({formData.product_code})
                                    </span>
                                  )}
                                </div>
                                <div className="small text-muted mt-1">
                                  From:{" "}
                                  {saleItems.find(
                                    (item) =>
                                      item._id === formData.selected_product_id
                                  )?.customer_name || "N/A"}
                                </div>
                              </div>
                              {isEditable && (
                                <button
                                  type="button"
                                  className="btn btn-sm btn-outline-danger"
                                  onClick={() => {
                                    setFormData((prev) => ({
                                      ...prev,
                                      selected_product_id: "",
                                      product_name: "",
                                      product_code: "",
                                      product_id: "",
                                      sale_item_id: null,
                                    }));
                                    setSearchQuery("");
                                  }}
                                >
                                  <FiX size={14} />
                                </button>
                              )}
                            </div>
                          </div>
                        )}
                      </div>
                      {errors.product_name && (
                        <div className="invalid-feedback d-block">
                          {errors.product_name}
                        </div>
                      )}
                      {saleItems.length === 0 && (
                        <div className="alert alert-warning mt-2">
                          No sale items found. You can still enter product manually.
                        </div>
                      )}
                    </div>
                  )}

                  {/* Manual Product Entry */}
                  {productType === "manual" && (
                    <div className="mb-4">
                      <label className="form-label fw-medium">
                        Product Name <span className="text-danger">*</span>
                      </label>
                      <div className="input-group">
                        <span className="input-group-text">
                          <FiPackage size={14} />
                        </span>
                        <input
                          type="text"
                          name="product_name"
                          className={`form-control ${
                            errors.product_name ? "is-invalid" : ""
                          }`}
                          value={formData.product_name}
                          onChange={handleManualProductChange}
                          disabled={isDisabled || !isEditable}
                          placeholder="Enter product name"
                        />
                      </div>
                      {errors.product_name && (
                        <div className="invalid-feedback d-block">
                          {errors.product_name}
                        </div>
                      )}
                    </div>
                  )}

                  {/* Product Module (Common for both) */}
                  <div className="mb-3">
                    <label className="form-label fw-medium">
                      Product Module/Model
                    </label>
                    <input
                      type="text"
                      name="product_module"
                      className="form-control"
                      value={formData.product_module}
                      onChange={handleChange}
                      disabled={isDisabled || !isEditable}
                      placeholder="Enter product module/model (optional)"
                    />
                  </div>

                  {/* Product Code (Common for both) */}
                  <div className="mb-3">
                    <label className="form-label fw-medium">Product Code</label>
                    <input
                      type="text"
                      name="product_code"
                      className="form-control"
                      value={formData.product_code || ""}
                      onChange={handleChange}
                      disabled={isDisabled || !isEditable}
                      placeholder="Enter product code (optional)"
                    />
                  </div>

                  {/* Problem Description */}
                  <div className="mb-3">
                    <label className="form-label fw-medium">
                      Problem Description <span className="text-danger">*</span>
                    </label>
                    <textarea
                      name="problem_description"
                      className={`form-control ${
                        errors.problem_description ? "is-invalid" : ""
                      }`}
                      value={formData.problem_description}
                      onChange={handleChange}
                      disabled={isDisabled || !isEditable}
                      rows={3}
                      placeholder="Describe the problem in detail..."
                    />
                    {errors.problem_description && (
                      <div className="invalid-feedback d-block">
                        {errors.problem_description}
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* NEW: Repair Images Section */}
              <div className="card border mb-4">
                <div className="card-header bg-light">
                  <h6 className="fw-bold mb-0">
                    <FiImage className="me-2" />
                    Repair Images
                  </h6>
                </div>
                <div className="card-body">
                  {/* Existing Images */}
                  {existingImages.length > 0 && (
                    <div className="mb-4">
                      <h6 className="fw-medium mb-3">Existing Images</h6>
                      <div className="row g-3">
                        {existingImages.map((image, index) => (
                          <div key={`existing-${index}`} className="col-md-4 col-6">
                            <div className="card border">
                              <div className="card-img-top position-relative">
                                <img
                                  src={image.url}
                                  alt={`Existing repair image ${index + 1}`}
                                  className="img-fluid"
                                  style={{
                                    height: "120px",
                                    width: "100%",
                                    objectFit: "cover",
                                  }}
                                />
                                {isEditable && (
                                  <button
                                    type="button"
                                    className="btn btn-sm btn-danger position-absolute top-0 end-0 m-2"
                                    onClick={() => removeExistingImage(image.id)}
                                    disabled={isDisabled}
                                    style={{
                                      width: "30px",
                                      height: "30px",
                                      borderRadius: "50%",
                                      padding: "0",
                                    }}
                                  >
                                    <FiTrash2 size={14} />
                                  </button>
                                )}
                              </div>
                              <div className="card-body p-2">
                                <div className="small text-truncate">
                                  {image.name}
                                </div>
                                <div className="small text-success">
                                  ✓ Existing Image
                                </div>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Deleted Images (if any) */}
                  {deletedImageIds.length > 0 && isEditable && (
                    <div className="alert alert-warning mb-4">
                      <h6 className="fw-medium">
                        <FiTrash2 className="me-2" />
                        {deletedImageIds.length} image(s) marked for deletion
                      </h6>
                      <button
                        type="button"
                        className="btn btn-sm btn-outline-secondary"
                        onClick={() => {
                          // Restore all deleted images
                          deletedImageIds.forEach(id => restoreExistingImage(id));
                          setDeletedImageIds([]);
                        }}
                      >
                        Restore All
                      </button>
                    </div>
                  )}

                  {/* New Image Upload */}
                  {isEditable && (
                    <div className="mb-3">
                      <label className="form-label fw-medium">
                        Add New Images (Optional)
                      </label>
                      <div className="border rounded p-4 text-center">
                        <input
                          type="file"
                          ref={fileInputRef}
                          onChange={handleImageUpload}
                          className="d-none"
                          id="repair-images-upload"
                          multiple
                          accept="image/jpeg,image/png,image/jpg,image/gif,image/webp"
                          disabled={isDisabled}
                        />
                        <label
                          htmlFor="repair-images-upload"
                          className="btn btn-outline-primary d-flex flex-column align-items-center justify-content-center py-4 cursor-pointer"
                          style={{ minHeight: "150px" }}
                        >
                          <FiCamera size={48} className="mb-3 text-muted" />
                          <span className="fw-medium">Click to upload new images</span>
                          <span className="text-muted small mt-2">
                            Supports JPG, PNG, GIF, WebP (Max 5MB each)
                          </span>
                          <span className="text-muted small">
                            You can select multiple images
                          </span>
                        </label>
                      </div>
                    </div>
                  )}

                  {/* New Image Previews */}
                  {previewImages.length > 0 && isEditable && (
                    <div className="mt-4">
                      <h6 className="fw-medium mb-3">
                        New Images to Upload ({previewImages.length})
                      </h6>
                      <div className="row g-3">
                        {previewImages.map((image, index) => (
                          <div key={`new-${index}`} className="col-md-4 col-6">
                            <div className="card border">
                              <div className="card-img-top position-relative">
                                <img
                                  src={image.preview}
                                  alt={`New repair image ${index + 1}`}
                                  className="img-fluid"
                                  style={{
                                    height: "120px",
                                    width: "100%",
                                    objectFit: "cover",
                                  }}
                                />
                                {isEditable && (
                                  <button
                                    type="button"
                                    className="btn btn-sm btn-danger position-absolute top-0 end-0 m-2"
                                    onClick={() => removeNewImage(index)}
                                    disabled={isDisabled}
                                    style={{
                                      width: "30px",
                                      height: "30px",
                                      borderRadius: "50%",
                                      padding: "0",
                                    }}
                                  >
                                    <FiTrash2 size={14} />
                                  </button>
                                )}
                              </div>
                              <div className="card-body p-2">
                                <div className="small text-truncate">
                                  {image.name}
                                </div>
                                <div className="small text-muted">
                                  {image.size}
                                </div>
                                <div className="small text-primary">
                                  New Image
                                </div>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* No Images Message */}
                  {existingImages.length === 0 && previewImages.length === 0 && (
                    <div className="text-center py-4 text-muted">
                      <FiImage size={48} className="mb-3" />
                      <p>No images uploaded for this repair yet.</p>
                      {isEditable && (
                        <p className="small">You can add images using the upload button above.</p>
                      )}
                    </div>
                  )}
                </div>
              </div>

              {/* Financial Information */}
              <div className="card border mb-4">
                <div className="card-header bg-light">
                  <h6 className="fw-bold mb-0">
                    <FiDollarSign className="me-2" />
                    Financial Information
                  </h6>
                </div>
                <div className="card-body">
                  <div className="row">
                    <div className="col-md-4 mb-3">
                      <label className="form-label fw-medium">
                        Repair Charge (₹) <span className="text-danger">*</span>
                      </label>
                      <div className="input-group">
                        <span className="input-group-text">₹</span>
                        <input
                          type="number"
                          name="repair_charge"
                          className={`form-control ${
                            errors.repair_charge ? "is-invalid" : ""
                          }`}
                          value={formData.repair_charge}
                          onChange={handleChange}
                          disabled={isDisabled || !isEditable}
                          min="0"
                          step="0.01"
                          placeholder="0.00"
                        />
                      </div>
                      {errors.repair_charge && (
                        <div className="invalid-feedback d-block">
                          {errors.repair_charge}
                        </div>
                      )}
                    </div>

                    <div className="col-md-4 mb-3">
                      <label className="form-label fw-medium">
                        Paid Amount (₹)
                      </label>
                      <div className="input-group">
                        <span className="input-group-text">₹</span>
                        <input
                          type="number"
                          name="paid_amount"
                          className={`form-control ${
                            errors.paid_amount ? "is-invalid" : ""
                          }`}
                          value={formData.paid_amount}
                          onChange={handleChange}
                          disabled={isDisabled || !isEditable}
                          min="0"
                          step="0.01"
                          placeholder="0.00"
                        />
                      </div>
                      {errors.paid_amount && (
                        <div className="invalid-feedback d-block">
                          {errors.paid_amount}
                        </div>
                      )}
                    </div>

                    <div className="col-md-4 mb-3">
                      <label className="form-label fw-medium">
                        Due Amount (₹)
                      </label>
                      <div className="input-group">
                        <span className="input-group-text">₹</span>
                        <input
                          type="number"
                          name="due_amount"
                          className="form-control bg-light"
                          value={formData.due_amount}
                          readOnly
                          disabled={isDisabled || !isEditable}
                        />
                      </div>
                      <div className="form-text">
                        Auto-calculated: Repair Charge - Paid Amount
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Customer & Employee Information */}
              <div className="card border mb-4">
                <div className="card-header bg-light">
                  <h6 className="fw-bold mb-0">
                    <FiUser className="me-2" />
                    Customer & Employee Details
                  </h6>
                </div>
                <div className="card-body">
                  <div className="row">
                    <div className="col-md-6 mb-3">
                      <label className="form-label fw-medium">
                        Customer <span className="text-danger">*</span>
                      </label>
                      <div className="input-group">
                        <select
                          name="customer_id"
                          className={`form-select ${
                            errors.customer_id ? "is-invalid" : ""
                          }`}
                          value={formData.customer_id}
                          onChange={handleChange}
                          disabled={isDisabled || !isEditable || customers.length === 0}
                        >
                          <option value="">Select Customer</option>
                          {customers.map((customer) => (
                            <option key={customer._id} value={customer._id}>
                              {customer.name || customer.customer_name}
                              {customer.mobile ? ` (${customer.mobile})` : ""}
                              {customer.customer_code
                                ? ` - ${customer.customer_code}`
                                : ""}
                            </option>
                          ))}
                        </select>
                        {isEditable && (
                          <button
                            type="button"
                            className="btn btn-outline-primary"
                            onClick={() => setShowCustomerModal(true)}
                            disabled={isDisabled}
                            title="Add New Customer"
                          >
                            <FiPlus size={18} />
                          </button>
                        )}
                      </div>
                      {errors.customer_id && (
                        <div className="invalid-feedback d-block">
                          {errors.customer_id}
                        </div>
                      )}
                      {/* {formData.customer_id && (
                        <div className="form-text">
                          Selected customer ID: {formData.customer_id}
                        </div>
                      )} */}
                    </div>

                    <div className="col-md-6 mb-3">
                      <label className="form-label fw-medium">
                        Assigned Employee <span className="text-danger">*</span>
                      </label>
                      <select
                        name="employee_id"
                        className={`form-select ${
                          errors.employee_id ? "is-invalid" : ""
                        }`}
                        value={formData.employee_id}
                        onChange={handleChange}
                        disabled={isDisabled || !isEditable}
                      >
                        <option value="">Select Employee</option>
                        {employees.map((employee) => (
                          <option key={employee._id} value={employee._id}>
                            {employee.name || employee.employee_name}
                            {employee.designation
                              ? ` - ${employee.designation}`
                              : ""}
                          </option>
                        ))}
                      </select>
                      {errors.employee_id && (
                        <div className="invalid-feedback d-block">
                          {errors.employee_id}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {/* Dates & Status Information */}
              <div className="card border mb-4">
                <div className="card-header bg-light">
                  <h6 className="fw-bold mb-0">
                    <FiCalendar className="me-2" />
                    Dates & Status
                  </h6>
                </div>
                <div className="card-body">
                  <div className="row">
                    <div className="col-md-4 mb-3">
                      <label className="form-label fw-medium">
                        Receiving Date <span className="text-danger">*</span>
                      </label>
                      <div className="input-group">
                        <span className="input-group-text">
                          <FiCalendar size={14} />
                        </span>
                        <input
                          type="date"
                          name="receiving_date"
                          className={`form-control ${
                            errors.receiving_date ? "is-invalid" : ""
                          }`}
                          value={formData.receiving_date}
                          onChange={handleChange}
                          disabled={isDisabled || !isEditable}
                          max={new Date().toISOString().split("T")[0]}
                        />
                      </div>
                      {errors.receiving_date && (
                        <div className="invalid-feedback d-block">
                          {errors.receiving_date}
                        </div>
                      )}
                    </div>

                    <div className="col-md-4 mb-3">
                      <label className="form-label fw-medium">
                        Expected Delivery Date
                      </label>
                      <div className="input-group">
                        <span className="input-group-text">
                          <FiCalendar size={14} />
                        </span>
                        <input
                          type="date"
                          name="delivery_date"
                          className={`form-control ${
                            errors.delivery_date ? "is-invalid" : ""
                          }`}
                          value={formData.delivery_date}
                          onChange={handleChange}
                          disabled={isDisabled || !isEditable}
                          min={formData.receiving_date}
                        />
                      </div>
                      {errors.delivery_date && (
                        <div className="invalid-feedback d-block">
                          {errors.delivery_date}
                        </div>
                      )}
                    </div>

                    <div className="col-md-4 mb-3">
                      <label className="form-label fw-medium">Status</label>
                      <select
                        name="status"
                        className="form-select"
                        value={formData.status}
                        onChange={handleChange}
                        disabled={isDisabled || !isEditable}
                      >
                        {statusOptions.map((status) => (
                          <option key={status.value} value={status.value}>
                            {status.label}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div className="row">
                    <div className="col-md-6 mb-3">
                      <label className="form-label fw-medium">
                        Payment Account
                      </label>
                      <select
                        name="account"
                        className="form-select"
                        value={formData.account}
                        onChange={handleChange}
                        disabled={isDisabled || !isEditable}
                      >
                        {accountOptions.map((account) => (
                          <option key={account.value} value={account.value}>
                            {account.label}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>
                </div>
              </div>

              {/* Additional Notes */}
              <div className="card border mb-4">
                <div className="card-header bg-light">
                  <h6 className="fw-bold mb-0">
                    <FiFileText className="me-2" />
                    Additional Notes
                  </h6>
                </div>
                <div className="card-body">
                  <div className="mb-3">
                    <label className="form-label fw-medium">Notes</label>
                    <textarea
                      name="note"
                      className="form-control"
                      value={formData.note}
                      onChange={handleChange}
                      disabled={isDisabled || !isEditable}
                      rows={2}
                      placeholder="Any additional notes or instructions..."
                    />
                  </div>
                </div>
              </div>

              {/* Summary */}
              <div className="card border">
                <div className="card-header bg-light">
                  <h6 className="fw-bold mb-0">
                    <BsTools className="me-2" />
                    Repair Summary
                  </h6>
                </div>
                <div className="card-body">
                  <div className="row">
                    <div className="col-md-6">
                      <div className="mb-2">
                        <span className="text-muted">Product:</span>
                        <span className="fw-medium ms-2">
                          {formData.product_name || "Not specified"}
                        </span>
                        {productType === "existing" &&
                          formData.selected_product_id && (
                            <span className="badge bg-success ms-2">
                              From Sales
                            </span>
                          )}
                        {productType === "manual" && (
                          <span className="badge bg-warning ms-2">
                            Manual Entry
                          </span>
                        )}
                      </div>
                      <div className="mb-2">
                        <span className="text-muted">Problem:</span>
                        <span className="fw-medium ms-2">
                          {formData.problem_description.substring(0, 50)}...
                        </span>
                      </div>
                      <div className="mb-2">
                        <span className="text-muted">Receiving Date:</span>
                        <span className="fw-medium ms-2">
                          {formData.receiving_date}
                        </span>
                      </div>
                      {formData.product_code && (
                        <div className="mb-2">
                          <span className="text-muted">Product Code:</span>
                          <span className="fw-medium ms-2">
                            {formData.product_code}
                          </span>
                        </div>
                      )}
                      <div className="mb-2">
                        <span className="text-muted">Total Images:</span>
                        <span className="fw-medium ms-2">
                          {existingImages.length + previewImages.length}
                          <span className="text-muted ms-1">
                            ({existingImages.length} existing, {previewImages.length} new)
                          </span>
                        </span>
                      </div>
                    </div>
                    <div className="col-md-6">
                      <div className="mb-2">
                        <span className="text-muted">Repair Charge:</span>
                        <span className="fw-medium ms-2">
                          {formatCurrency(formData.repair_charge)}
                        </span>
                      </div>
                      <div className="mb-2">
                        <span className="text-muted">Paid Amount:</span>
                        <span className="fw-medium ms-2 text-success">
                          {formatCurrency(formData.paid_amount)}
                        </span>
                      </div>
                      <div className="mb-2">
                        <span className="text-muted">Due Amount:</span>
                        <span className="fw-medium ms-2 text-danger">
                          {formatCurrency(formData.due_amount)}
                        </span>
                      </div>
                      <div className="mb-2">
                        <span className="text-muted">Status:</span>
                        <span className="fw-medium ms-2">
                          {statusOptions.find(
                            (s) => s.value === formData.status
                          )?.label || formData.status}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="modal-footer border-top pt-3 bg-white">
              <button
                type="button"
                className="btn btn-outline-secondary"
                onClick={handleClose}
                disabled={isDisabled}
              >
                Cancel
              </button>
              {isEditable && (
                <button
                  type="submit"
                  className="btn btn-primary d-flex align-items-center gap-2"
                  disabled={isDisabled}
                >
                  {loading ? (
                    <>
                      <span
                        className="spinner-border spinner-border-sm"
                        aria-hidden="true"
                      ></span>
                      Updating Repair...
                    </>
                  ) : (
                    <>
                      <FiSave size={16} />
                      Update Repair
                    </>
                  )}
                </button>
              )}
            </div>
          </form>
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
    </div>
  );
};

export default EditRepairForm;