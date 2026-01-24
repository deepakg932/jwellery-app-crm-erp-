import React, { useState, useEffect, useRef, useCallback } from "react";
import {
  FiUpload,
  FiTrash2,
  FiX,
  FiPlus,
  FiCalendar,
  FiUser,
  FiAlertCircle,
  FiCheckCircle,
  FiSearch,
  FiPackage,
  FiShoppingCart,
  FiImage,
  FiCamera,
} from "react-icons/fi";
import useJobCards from "@/hooks/useJobCards";

const AddJobCardForm = ({
  onClose,
  onSave,
  loading = false,
  quotationData = null,
}) => {
  const {
    employees,
    loadingEmployees,
    fetchQuotations,
    allQuotations,
    loadingQuotations,
    products,
    fetchProducts,
    loadingProducts,
  } = useJobCards();

  // States for quotation search
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedQuotation, setSelectedQuotation] = useState(null);
  const [showQuotationDropdown, setShowQuotationDropdown] = useState(false);
  const [filteredQuotations, setFilteredQuotations] = useState([]);

  // States for product search
  const [productSearch, setProductSearch] = useState("");
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [showProductDropdown, setShowProductDropdown] = useState(false);

  // Image upload state
  const [imageFiles, setImageFiles] = useState([]);
  const [imagePreviews, setImagePreviews] = useState([]);
  const [uploadingImages, setUploadingImages] = useState(false);
  const [imageBase64Array, setImageBase64Array] = useState([]);

  // Item source type (quotation or products)
  const [itemSource, setItemSource] = useState("none");
  const [activeTab, setActiveTab] = useState("products");

  // Refs
  const dropdownRef = useRef(null);
  const searchInputRef = useRef(null);
  const productSearchRef = useRef(null);
  const fileInputRef = useRef(null);

  const [formData, setFormData] = useState({
    customer_id: "",
    customer_name: "",
    customer_mobile: "",
    job_card_date: new Date().toISOString().split("T")[0],
    expected_delivery_date: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
      .toISOString()
      .split("T")[0],
    delivery_date: "",
    items: [],
    note: "",
    instructions: "",
    priority: "medium",
    status: "pending",
    total_amount: 0,
    advance_amount: 0,
    balance_amount: 0,
    assigned_to: "",
    images: [], // Added images array field
  });
  const hasItems = formData.items.some((item) => item.product_id);
  const [errors, setErrors] = useState({});

  // Priority options
  const priorityOptions = [
    { value: "low", label: "Low", color: "success" },
    { value: "medium", label: "Medium", color: "warning" },
    { value: "high", label: "High", color: "danger" },
    { value: "urgent", label: "Urgent", color: "danger" },
  ];

  // Status options
  const statusOptions = [
    { value: "pending", label: "Pending", color: "warning" },
    { value: "approved", label: "Approved", color: "success" },
    { value: "in_progress", label: "In Progress", color: "info" },
    { value: "completed", label: "Completed", color: "success" },
    { value: "delivered", label: "Delivered", color: "primary" },
    { value: "cancelled", label: "Cancelled", color: "danger" },
  ];

  // Image handling functions
  const handleImageUpload = async (files) => {
    if (!files || files.length === 0) return;

    const validTypes = [
      "image/jpeg",
      "image/png",
      "image/jpg",
      "image/webp",
      "image/gif",
    ];
    const maxSize = 2 * 1024 * 1024; // 2MB

    setUploadingImages(true);

    const newImageFiles = [];
    const newImagePreviews = [];

    for (let i = 0; i < files.length; i++) {
      const file = files[i];

      // Check file type
      if (!validTypes.includes(file.type)) {
        setErrors((prev) => ({
          ...prev,
          images: `File ${file.name} is not a valid image type`,
        }));
        continue;
      }

      // Check file size
      if (file.size > maxSize) {
        setErrors((prev) => ({
          ...prev,
          images: `File ${file.name} exceeds 2MB limit`,
        }));
        continue;
      }

      newImageFiles.push(file);

      // Create preview
      const reader = new FileReader();
      const promise = new Promise((resolve) => {
        reader.onloadend = () => {
          newImagePreviews.push(reader.result);
          resolve();
        };
        reader.readAsDataURL(file);
      });
      await promise;
    }

    // Update states
    setImageFiles((prev) => [...prev, ...newImageFiles]);
    setImagePreviews((prev) => [...prev, ...newImagePreviews]);
    setUploadingImages(false);

    // Clear any existing error
    if (errors.images) {
      setErrors((prev) => ({ ...prev, images: "" }));
    }
  };

  const handleFileSelect = (e) => {
    const files = Array.from(e.target.files);
    if (files.length === 0) return;

    handleImageUpload(files);

    // Clear file input
    e.target.value = "";
  };

  const handleRemoveImage = (index) => {
    setImageFiles((prev) => prev.filter((_, i) => i !== index));
    setImagePreviews((prev) => prev.filter((_, i) => i !== index));

    if (errors.images) {
      setErrors((prev) => ({ ...prev, images: "" }));
    }
  };

  const triggerFileInput = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  const clearAllImages = () => {
    setImageFiles([]);
    setImagePreviews([]);

    if (errors.images) {
      setErrors((prev) => ({ ...prev, images: "" }));
    }
  };

  // Filter quotations based on search term
  useEffect(() => {
    if (!searchTerm.trim() || searchTerm.trim().length < 2) {
      setFilteredQuotations([]);
      setShowQuotationDropdown(false);
      return;
    }

    const searchTermLower = searchTerm.toLowerCase();

    const filtered = allQuotations.filter((quotation) => {
      if (selectedQuotation && quotation._id === selectedQuotation._id) {
        return false;
      }

      const matchQuotationNumber = quotation.quotation_number
        ?.toLowerCase()
        .includes(searchTermLower);

      const matchCustomerName = quotation.customer_name
        ?.toLowerCase()
        .includes(searchTermLower);

      const matchCustomerMobile =
        quotation.customer_mobile?.includes(searchTerm);

      return matchQuotationNumber || matchCustomerName || matchCustomerMobile;
    });

    setFilteredQuotations(filtered.slice(0, 10));
    setShowQuotationDropdown(filtered.length > 0);
  }, [searchTerm, allQuotations, selectedQuotation]);

  // Filter products based on search term
  useEffect(() => {
    if (!productSearch.trim()) {
      setFilteredProducts([]);
      setShowProductDropdown(false);
      return;
    }

    const searchTermLower = productSearch.toLowerCase();

    const filtered = products.filter((product) => {
      const matchProductName = product.product_name
        ?.toLowerCase()
        .includes(searchTermLower);

      const matchProductCode = product.article_no
        ?.toLowerCase()
        .includes(searchTermLower);

      const matchDescription = product.description
        ?.toLowerCase()
        .includes(searchTermLower);

      return matchProductName || matchProductCode || matchDescription;
    });

    setFilteredProducts(filtered.slice(0, 10));
    setShowProductDropdown(filtered.length > 0);
  }, [productSearch, products]);

  // Click outside to close dropdowns
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        showQuotationDropdown &&
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target) &&
        searchInputRef.current &&
        !searchInputRef.current.contains(event.target)
      ) {
        setShowQuotationDropdown(false);
      }

      if (
        showProductDropdown &&
        productSearchRef.current &&
        !productSearchRef.current.contains(event.target) &&
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target)
      ) {
        setShowProductDropdown(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [showQuotationDropdown, showProductDropdown]);

  // Handle product selection from search
  const handleProductSelect = (product) => {
    const existingIndex = formData.items.findIndex(
      (item) => item.product_id === product._id
    );

    if (existingIndex >= 0) {
      const updatedItems = [...formData.items];
      const currentQty = parseFloat(updatedItems[existingIndex].quantity) || 1;
      updatedItems[existingIndex].quantity = (currentQty + 1).toString();
      updatedItems[existingIndex].total_amount =
        (currentQty + 1) *
        (parseFloat(updatedItems[existingIndex].unit_price) || 0);

      setFormData((prev) => ({
        ...prev,
        items: updatedItems,
      }));
    } else {
      const newItem = {
        product_id: product._id,
        article_no: product.article_no || "",
        product_name: product.product_name || "",
        description: product.description || "",
        quantity: "1",
        unit_price:
          product.selling_price_with_gst ||
          product.selling_price ||
          product.unit_price ||
          0,
        total_amount:
          product.selling_price_with_gst ||
          product.selling_price ||
          product.unit_price ||
          0,
        notes: "",
        price_info: {
          base_price: product.grand_total || 0,
          gst_amount: product.gst_amount || 0,
          selling_price_before_tax: product.selling_price_before_tax || 0,
          selling_price_with_gst: product.selling_price_with_gst || 0,
        },
      };

      setFormData((prev) => ({
        ...prev,
        items: [...prev.items, newItem],
      }));
    }

    setItemSource("products");
    setProductSearch("");
    setShowProductDropdown(false);

    setTimeout(calculateTotals, 100);
  };

  // Handle quotation selection
  const handleQuotationSelect = (quotation) => {
    console.log("Selected quotation:", quotation);

    const customer = quotation.customer_id || {};
    const jobCardItems = (quotation.items || []).map((item) => ({
      product_id: item.product_id?._id || item.product_id || "",
      article_no: item.article_no || "",
      product_name: item.product_name || "",
      description: item.description || "",
      quantity: (item.quantity || 1).toString(),
      unit_price: item.unit_price || item.net_price || 0,
      total_amount: item.subtotal || item.net_price || 0,
      notes: item.notes || "",
    }));

    const totalAmount = jobCardItems.reduce(
      (sum, item) => sum + (parseFloat(item.total_amount) || 0),
      0
    );

    let expectedDelivery = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
    if (quotation.expiry_date) {
      const expiryDate = new Date(quotation.expiry_date);
      expectedDelivery = new Date(expiryDate);
      expectedDelivery.setDate(expectedDelivery.getDate() + 7);
    }

    let jobCardDate = new Date().toISOString().split("T")[0];
    if (quotation.quotation_date) {
      const qDate = new Date(quotation.quotation_date);
      jobCardDate = qDate.toISOString().split("T")[0];
    }

    setFormData((prev) => ({
      ...prev,
      customer_id: customer._id || customer || "",
      customer_name: customer.name || "Unknown Customer",
      customer_mobile: customer.mobile || customer.phone || "",
      items: jobCardItems,
      total_amount: totalAmount,
      balance_amount: totalAmount,
      instructions: quotation.terms_conditions || "",
      expected_delivery_date: expectedDelivery.toISOString().split("T")[0],
      job_card_date: jobCardDate,
      quotation_id: quotation._id,
      quotation_number: quotation.quotation_number,
    }));

    setSelectedQuotation(quotation);
    setShowQuotationDropdown(false);
    setSearchTerm(quotation.quotation_number || "");
    setItemSource("quotation");
    setActiveTab("quotation");

    setTimeout(() => {
      calculateTotals();
    }, 100);
  };

  // Handle search input change for quotations
  const handleSearchChange = (e) => {
    const value = e.target.value;
    setSearchTerm(value);

    if (value.trim().length >= 2) {
      setShowQuotationDropdown(true);
    } else {
      setShowQuotationDropdown(false);
      setFilteredQuotations([]);
    }
  };

  // Handle product search input change
  const handleProductSearchChange = (e) => {
    const value = e.target.value;
    setProductSearch(value);

    if (value.trim().length >= 2) {
      setShowProductDropdown(true);
      fetchProducts(value);
    } else {
      setShowProductDropdown(false);
      setFilteredProducts([]);
    }
  };

  // Clear quotation selection
  const clearQuotationSelection = () => {
    setSelectedQuotation(null);
    setSearchTerm("");
    setFilteredQuotations([]);
    setShowQuotationDropdown(false);
    setItemSource("none");

    setFormData((prev) => ({
      ...prev,
      customer_id: "",
      customer_name: "",
      customer_mobile: "",
      items: [],
      total_amount: 0,
      balance_amount: 0,
      note: "",
      instructions: "",
      quotation_id: undefined,
      quotation_number: undefined,
    }));

    calculateTotals();
  };

  // Clear all items
  const clearAllItems = () => {
    setFormData((prev) => ({
      ...prev,
      items: [],
      total_amount: 0,
      balance_amount: 0,
    }));
    setItemSource("none");
    calculateTotals();
  };

  // Switch to products tab
  const switchToProductsTab = () => {
    setActiveTab("products");
    clearAllItems();
  };

  // Switch to quotation tab
  const switchToQuotationTab = () => {
    setActiveTab("quotation");
    clearAllItems();
  };

  // Validate form
  const validateForm = () => {
    const newErrors = {};

    if (itemSource !== "products" && !formData.customer_id) {
      newErrors.customer_id = "Customer is required";
    }

    if (!formData.job_card_date) {
      newErrors.job_card_date = "Job card date is required";
    }

    if (!formData.expected_delivery_date) {
      newErrors.expected_delivery_date = "Expected delivery date is required";
    }

    const selectedItems = formData.items.filter((item) => item.product_id);
    if (selectedItems.length === 0) {
      newErrors.items = "At least one item is required";
    }

    // Validate images - file size and type already handled in upload
    if (imageFiles.length > 10) {
      newErrors.images = "Maximum 10 images allowed";
    }

    const totalImageSize = imageFiles.reduce(
      (total, file) => total + file.size,
      0
    );
    if (totalImageSize > 20 * 1024 * 1024) {
      // 20MB total limit
      newErrors.images = "Total image size should be less than 20MB";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Calculate item total
  const calculateItemTotal = (item) => {
    const quantity = parseFloat(item.quantity) || 0;
    const unitPrice = parseFloat(item.unit_price) || 0;
    return quantity * unitPrice;
  };

  // Calculate all totals
  const calculateTotals = () => {
    const itemsCalculated = formData.items
      .filter((item) => item.product_id)
      .map((item) => {
        const total = calculateItemTotal(item);
        return { ...item, total_amount: total };
      });

    const itemTotal = itemsCalculated.reduce(
      (total, item) => total + (item.total_amount || 0),
      0
    );

    const advance = parseFloat(formData.advance_amount) || 0;
    const balance = Math.max(0, itemTotal - advance);

    setFormData((prev) => ({
      ...prev,
      items: prev.items.map((item) => {
        const calculatedItem = itemsCalculated.find(
          (calc) => calc.product_id === item.product_id
        );
        return calculatedItem ? calculatedItem : item;
      }),
      total_amount: itemTotal,
      balance_amount: balance,
    }));
  };

  // Handle form field changes
  const handleChange = (e) => {
    const { name, value } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));

    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: "" }));
    }

    if (name === "advance_amount") {
      const total = parseFloat(formData.total_amount) || 0;
      const advance = parseFloat(value) || 0;
      const balance = Math.max(0, total - advance);

      setFormData((prev) => ({
        ...prev,
        balance_amount: balance,
      }));
    }
  };

  // Handle item field changes
  const handleItemChange = (index, field, value) => {
    const updatedItems = [...formData.items];

    updatedItems[index][field] = value;

    if (field === "quantity" || field === "unit_price") {
      const quantity = parseFloat(updatedItems[index].quantity) || 0;
      const unitPrice = parseFloat(updatedItems[index].unit_price) || 0;
      updatedItems[index].total_amount = quantity * unitPrice;
    }

    setFormData((prev) => ({ ...prev, items: updatedItems }));
    calculateTotals();
  };

  // Remove item row
  const removeItem = (index) => {
    if (formData.items.length > 1) {
      const updatedItems = formData.items.filter((_, i) => i !== index);
      setFormData((prev) => ({
        ...prev,
        items: updatedItems,
      }));

      setTimeout(calculateTotals, 0);

      if (updatedItems.filter((item) => item.product_id).length === 0) {
        setItemSource("none");
      }
    } else {
      clearItem(index);
    }
  };

  // Clear item data
  const clearItem = (index) => {
    const updatedItems = [...formData.items];
    updatedItems[index] = {
      product_id: "",
      article_no: "",
      product_name: "",
      description: "",
      quantity: "1",
      unit_price: 0,
      total_amount: 0,
      notes: "",
    };

    setFormData((prev) => ({
      ...prev,
      items: updatedItems,
    }));

    if (updatedItems.filter((item) => item.product_id).length === 0) {
      setItemSource("none");
    }

    setTimeout(calculateTotals, 0);
  };

  // Add new empty item row
  const addNewItemRow = () => {
    if (itemSource === "products" || itemSource === "none") {
      setFormData((prev) => ({
        ...prev,
        items: [
          ...prev.items,
          {
            product_id: "",
            article_no: "",
            product_name: "",
            description: "",
            quantity: "1",
            unit_price: 0,
            total_amount: 0,
            notes: "",
          },
        ],
      }));
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    const totalAmount = parseFloat(formData.total_amount) || 0;
    const advanceAmount = parseFloat(formData.advance_amount) || 0;
    const balanceAmount = Math.max(0, totalAmount - advanceAmount);

    // Always use FormData for file upload
    const formDataToSend = new FormData();

    // Append all form data as fields
    formDataToSend.append("job_card_date", formData.job_card_date);
    formDataToSend.append(
      "expected_delivery_date",
      formData.expected_delivery_date
    );
    if (formData.delivery_date) {
      formDataToSend.append("delivery_date", formData.delivery_date);
    }

    // Append items as JSON string
    const itemsToSend = formData.items
      .filter((item) => item.product_id)
      .map((item) => ({
        product_id: item.product_id,
        product_code: item.article_no, // Match backend field name
        product_name: item.product_name,
        description: item.description,
        quantity: parseFloat(item.quantity) || 1,
        unit_price: parseFloat(item.unit_price) || 0,
        total_amount: parseFloat(item.total_amount) || 0,
        notes: item.notes,
      }));

    formDataToSend.append("items", JSON.stringify(itemsToSend));

    // Append other fields
    formDataToSend.append("note", formData.note);
    formDataToSend.append("instructions", formData.instructions);
    formDataToSend.append("priority", formData.priority);
    formDataToSend.append("status", formData.status);
    formDataToSend.append("total_amount", totalAmount);
    formDataToSend.append("advance_amount", advanceAmount);
    formDataToSend.append("balance_amount", balanceAmount);

    if (formData.assigned_to) {
      formDataToSend.append("assigned_to", formData.assigned_to);
    }

    // Handle customer data
    if (itemSource !== "products") {
      if (formData.customer_id) {
        formDataToSend.append("customer_id", formData.customer_id);
      }
      if (formData.customer_name) {
        formDataToSend.append("customer_name", formData.customer_name);
      }
      if (formData.customer_mobile) {
        formDataToSend.append("customer_mobile", formData.customer_mobile);
      }
    }

    // Handle quotation data
    if (formData.quotation_id) {
      formDataToSend.append("quotation_id", formData.quotation_id);
      formDataToSend.append("quotation_number", formData.quotation_number);
    }

    // Append image files (actual File objects)
    imageFiles.forEach((file, index) => {
      formDataToSend.append("images", file); // Use "images" as field name, backend expects req.files
    });

    console.log("Submitting job card with FormData:", {
      hasImages: imageFiles.length > 0,
      imageCount: imageFiles.length,
      hasQuotation: !!formData.quotation_id,
      itemsCount: itemsToSend.length,
    });

    // Log FormData contents for debugging
    for (let [key, value] of formDataToSend.entries()) {
      console.log(`${key}:`, value);
    }

    onSave(formDataToSend);
  };

  const handleClose = () => {
    setFormData({
      customer_id: "",
      customer_name: "",
      customer_mobile: "",
      job_card_date: new Date().toISOString().split("T")[0],
      expected_delivery_date: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
        .toISOString()
        .split("T")[0],
      delivery_date: "",
      items: [],
      note: "",
      instructions: "",
      priority: "medium",
      status: "pending",
      total_amount: 0,
      advance_amount: 0,
      balance_amount: 0,
      assigned_to: "",
    });
    setErrors({});
    setSelectedQuotation(null);
    setSearchTerm("");
    setFilteredQuotations([]);
    setShowQuotationDropdown(false);
    setProductSearch("");
    setFilteredProducts([]);
    setShowProductDropdown(false);
    setItemSource("none");
    setActiveTab("products");

    // Reset image states
    setImageFiles([]);
    setImagePreviews([]);
    setUploadingImages(false);

    onClose();
  };

  const isDisabled =
    loading ||
    loadingEmployees ||
    loadingQuotations ||
    loadingProducts ||
    uploadingImages;

  const isSourceSelectionDisabled = hasItems;

  // Format currency
  const formatCurrency = (amount) => {
    const numAmount = typeof amount === "string" ? parseFloat(amount) : amount;
    return `₹${(numAmount || 0).toLocaleString("en-IN", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })}`;
  };

  // Get priority badge
  const getPriorityBadge = (priority) => {
    const priorityOption = priorityOptions.find((p) => p.value === priority);
    return (
      <span className={`badge bg-${priorityOption?.color || "secondary"}`}>
        {priorityOption?.label || priority}
      </span>
    );
  };

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
      <div className="modal-dialog modal-dialog-centered modal-xl">
        <div
          className="modal-content rounded-3"
          style={{ maxHeight: "95vh", overflow: "hidden" }}
        >
          <div
            className="modal-header border-bottom pb-3 sticky-top bg-white"
            style={{ zIndex: 1020 }}
          >
            <h5 className="modal-title fw-bold fs-5">
              {selectedQuotation
                ? "Create Job Card from Quotation"
                : "Create New Job Card"}
              {selectedQuotation && (
                <span className="ms-2 fs-6 text-muted">
                  (QT-
                  {selectedQuotation.quotation_number?.split("-").pop() || ""})
                </span>
              )}
            </h5>
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
              {/* Source Selection Tabs */}
              <div className="card mb-4">
                <div className="card-body p-3">
                  <div className="d-flex mb-3">
                    <div className="btn-group" role="group">
                      <button
                        type="button"
                        className={`btn btn-${
                          activeTab === "products"
                            ? "primary"
                            : "outline-primary"
                        } d-flex align-items-center gap-2`}
                        onClick={switchToProductsTab}
                        disabled={
                          isDisabled ||
                          (isSourceSelectionDisabled &&
                            itemSource !== "products")
                        }
                      >
                        <FiPackage size={16} />
                        Add Products Directly
                        {isSourceSelectionDisabled &&
                          itemSource !== "products" && (
                            <span className="ms-1 text-warning">
                              (Disabled - Items already added)
                            </span>
                          )}
                      </button>
                      <button
                        type="button"
                        className={`btn btn-${
                          activeTab === "quotation"
                            ? "primary"
                            : "outline-primary"
                        } d-flex align-items-center gap-2`}
                        onClick={switchToQuotationTab}
                        disabled={
                          isDisabled ||
                          (isSourceSelectionDisabled &&
                            itemSource !== "quotation")
                        }
                      >
                        <FiShoppingCart size={16} />
                        Use Quotation
                        {isSourceSelectionDisabled &&
                          itemSource !== "quotation" && (
                            <span className="ms-1 text-warning">
                              (Disabled - Items already added)
                            </span>
                          )}
                      </button>
                    </div>
                  </div>

                  {activeTab === "quotation" ? (
                    // Quotation Search Section
                    <div className="row align-items-center">
                      <div className="col-md-8 position-relative">
                        <label className="form-label fw-medium mb-1">
                          <FiSearch className="me-2" />
                          Search Quotation
                          {itemSource === "products" && (
                            <span className="text-danger ms-2">
                              (Disabled - Items already added from Products)
                            </span>
                          )}
                        </label>
                        <div className="input-group" ref={searchInputRef}>
                          <input
                            type="text"
                            className="form-control"
                            placeholder={
                              itemSource === "products"
                                ? "Clear items first to use quotations"
                                : "Search by quotation number, customer name or mobile..."
                            }
                            value={searchTerm}
                            onChange={handleSearchChange}
                            disabled={isDisabled || itemSource === "products"}
                            onFocus={() => {
                              if (
                                searchTerm.length >= 2 &&
                                itemSource !== "products"
                              ) {
                                setShowQuotationDropdown(true);
                              }
                            }}
                          />
                          {selectedQuotation && (
                            <button
                              type="button"
                              className="btn btn-outline-danger"
                              onClick={clearQuotationSelection}
                              disabled={isDisabled}
                            >
                              Clear
                            </button>
                          )}
                        </div>

                        {/* Quotation Dropdown */}
                        {showQuotationDropdown &&
                          filteredQuotations.length > 0 && (
                            <div
                              ref={dropdownRef}
                              className="position-absolute bg-white border rounded shadow-sm mt-1"
                              style={{
                                zIndex: 1050,
                                width: "calc(100% - 12px)",
                                maxHeight: "300px",
                                overflowY: "auto",
                                top: "100%",
                                left: "6px",
                              }}
                            >
                              <div className="p-2">
                                {filteredQuotations.map((quotation) => (
                                  <div
                                    key={quotation._id}
                                    className="p-2 border-bottom hover-bg-light cursor-pointer"
                                    onClick={() =>
                                      itemSource !== "products" &&
                                      handleQuotationSelect(quotation)
                                    }
                                    onMouseEnter={(e) =>
                                      itemSource !== "products" &&
                                      (e.currentTarget.style.backgroundColor =
                                        "#f8f9fa")
                                    }
                                    onMouseLeave={(e) =>
                                      (e.currentTarget.style.backgroundColor =
                                        "")
                                    }
                                    style={{
                                      cursor:
                                        itemSource === "products"
                                          ? "not-allowed"
                                          : "pointer",
                                      opacity:
                                        itemSource === "products" ? 0.6 : 1,
                                    }}
                                  >
                                    <div className="d-flex justify-content-between align-items-center">
                                      <div>
                                        <div className="fw-bold">
                                          {quotation.quotation_number}
                                        </div>
                                        <div className="small text-muted">
                                          Customer: {quotation.customer_name}
                                        </div>
                                        <div className="small text-muted">
                                          Mobile: {quotation.customer_mobile}
                                        </div>
                                        {itemSource === "products" && (
                                          <div className="small text-danger mt-1">
                                            Clear products first to select
                                            quotation
                                          </div>
                                        )}
                                      </div>
                                      <div className="text-end">
                                        <div className="fw-bold">
                                          {formatCurrency(
                                            quotation.grand_total
                                          )}
                                        </div>
                                        <div className="small text-muted">
                                          {quotation.quotation_date
                                            ? new Date(
                                                quotation.quotation_date
                                              ).toLocaleDateString()
                                            : "N/A"}
                                        </div>
                                        <div className="small">
                                          <span
                                            className={`badge bg-${
                                              quotation.status === "accepted"
                                                ? "success"
                                                : quotation.status === "pending"
                                                ? "warning"
                                                : "secondary"
                                            }`}
                                          >
                                            {quotation.status}
                                          </span>
                                        </div>
                                      </div>
                                    </div>
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}

                        {loadingQuotations &&
                          !selectedQuotation &&
                          itemSource !== "products" && (
                            <div className="text-muted small mt-1">
                              <span className="spinner-border spinner-border-sm me-1" />
                              Loading quotations...
                            </div>
                          )}

                        {!loadingQuotations &&
                          searchTerm.length >= 2 &&
                          filteredQuotations.length === 0 &&
                          itemSource !== "products" && (
                            <div className="text-muted small mt-1">
                              No quotations found for "{searchTerm}"
                            </div>
                          )}
                      </div>

                      <div className="col-md-4">
                        {selectedQuotation ? (
                          <div className="alert alert-success mb-0">
                            <div className="d-flex align-items-center">
                              <FiCheckCircle className="me-2" />
                              <div>
                                <strong>Quotation Selected:</strong>{" "}
                                {selectedQuotation.quotation_number}
                                <div className="small">
                                  Customer: {selectedQuotation.customer_name} |
                                  Total:{" "}
                                  {formatCurrency(
                                    selectedQuotation.grand_total
                                  )}
                                </div>
                              </div>
                            </div>
                          </div>
                        ) : itemSource === "products" ? (
                          <div className="alert alert-warning mb-0">
                            <div className="d-flex align-items-center">
                              <FiAlertCircle className="me-2" />
                              <div>
                                <strong>Products Selected</strong>
                                <div className="small">
                                  Clear items first to select quotation
                                </div>
                              </div>
                            </div>
                          </div>
                        ) : (
                          <div className="alert alert-info mb-0">
                            <div className="d-flex align-items-center">
                              <FiShoppingCart className="me-2" />
                              <div>
                                <strong>Select Quotation</strong>
                                <div className="small">
                                  Search and select a quotation to auto-fill
                                  items
                                </div>
                              </div>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  ) : (
                    // Product Search Section
                    <div className="row align-items-center">
                      <div className="col-md-8 position-relative">
                        <label className="form-label fw-medium mb-1">
                          <FiSearch className="me-2" />
                          Search Products
                          {itemSource === "quotation" && (
                            <span className="text-danger ms-2">
                              (Disabled - Items already added from Quotation)
                            </span>
                          )}
                        </label>
                        <div className="input-group" ref={productSearchRef}>
                          <input
                            type="text"
                            className="form-control"
                            placeholder={
                              itemSource === "quotation"
                                ? "Clear quotation first to add products"
                                : "Search by product name, code or description..."
                            }
                            value={productSearch}
                            onChange={handleProductSearchChange}
                            disabled={isDisabled || itemSource === "quotation"}
                            onFocus={() => {
                              if (
                                productSearch.length >= 2 &&
                                itemSource !== "quotation"
                              ) {
                                setShowProductDropdown(true);
                              }
                            }}
                          />
                          {productSearch && (
                            <button
                              type="button"
                              className="btn btn-outline-secondary"
                              onClick={() => {
                                setProductSearch("");
                                setShowProductDropdown(false);
                              }}
                              disabled={isDisabled}
                            >
                              Clear
                            </button>
                          )}
                        </div>

                        {/* Product Dropdown */}
                        {showProductDropdown && filteredProducts.length > 0 && (
                          <div
                            ref={dropdownRef}
                            className="position-absolute bg-white border rounded shadow-sm mt-1"
                            style={{
                              zIndex: 1050,
                              width: "calc(100% - 12px)",
                              maxHeight: "300px",
                              overflowY: "auto",
                              top: "100%",
                              left: "6px",
                            }}
                          >
                            <div className="p-2">
                              {filteredProducts.map((product) => (
                                <div
                                  key={product._id}
                                  className="p-2 border-bottom hover-bg-light cursor-pointer"
                                  onClick={() =>
                                    itemSource !== "quotation" &&
                                    handleProductSelect(product)
                                  }
                                  onMouseEnter={(e) =>
                                    itemSource !== "quotation" &&
                                    (e.currentTarget.style.backgroundColor =
                                      "#f8f9fa")
                                  }
                                  onMouseLeave={(e) =>
                                    (e.currentTarget.style.backgroundColor = "")
                                  }
                                  style={{
                                    cursor:
                                      itemSource === "quotation"
                                        ? "not-allowed"
                                        : "pointer",
                                    opacity:
                                      itemSource === "quotation" ? 0.6 : 1,
                                  }}
                                >
                                  <div className="d-flex justify-content-between align-items-center">
                                    <div>
                                      <div className="fw-bold">
                                        {product.product_name ||
                                          "Unnamed Product"}
                                      </div>
                                      <div className="small text-muted">
                                        Code: {product.article_no || "N/A"}
                                      </div>
                                      <div className="small text-muted">
                                        Category:{" "}
                                        {product.category ||
                                          product.product_category ||
                                          "N/A"}
                                      </div>
                                      {product.selling_price_with_gst && (
                                        <div className="small">
                                          <div>
                                            Base: ₹
                                            {product.grand_total?.toLocaleString(
                                              "en-IN"
                                            ) || 0}
                                          </div>
                                          <div>
                                            GST: ₹
                                            {product.gst_amount?.toLocaleString(
                                              "en-IN"
                                            ) || 0}
                                          </div>
                                        </div>
                                      )}
                                      {itemSource === "quotation" && (
                                        <div className="small text-danger mt-1">
                                          Clear quotation first to add products
                                        </div>
                                      )}
                                    </div>
                                    <div className="text-end">
                                      <div className="fw-bold">
                                        {formatCurrency(
                                          product.selling_price_with_gst ||
                                            product.selling_price ||
                                            product.unit_price ||
                                            0
                                        )}
                                      </div>
                                      <div className="small text-muted">
                                        Stock: {product.stock_quantity || 0}
                                      </div>
                                      {product.selling_price_with_gst && (
                                        <div className="small text-success">
                                          (Includes GST)
                                        </div>
                                      )}
                                      <div className="small">
                                        <span
                                          className={`badge bg-${
                                            product.status === "active"
                                              ? "success"
                                              : "secondary"
                                          }`}
                                        >
                                          {product.status || "active"}
                                        </span>
                                      </div>
                                    </div>
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}

                        {loadingProducts && itemSource !== "quotation" && (
                          <div className="text-muted small mt-1">
                            <span className="spinner-border spinner-border-sm me-1" />
                            Loading products...
                          </div>
                        )}

                        {!loadingProducts &&
                          productSearch.length >= 2 &&
                          filteredProducts.length === 0 &&
                          itemSource !== "quotation" && (
                            <div className="text-muted small mt-1">
                              No products found for "{productSearch}"
                            </div>
                          )}
                      </div>

                      <div className="col-md-4">
                        {itemSource === "quotation" ? (
                          <div className="alert alert-warning mb-0">
                            <div className="d-flex align-items-center">
                              <FiAlertCircle className="me-2" />
                              <div>
                                <strong>Quotation Selected</strong>
                                <div className="small">
                                  Clear quotation first to add products
                                </div>
                              </div>
                            </div>
                          </div>
                        ) : (
                          <div className="alert alert-info mb-0">
                            <div className="d-flex align-items-center">
                              <FiPackage className="me-2" />
                              <div>
                                <strong>Add Products Manually</strong>
                                <div className="small">
                                  Search and select products to add to job card
                                </div>
                              </div>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Quick Actions */}
                  <div className="d-flex gap-2 mt-3">
                    {itemSource === "products" && (
                      <button
                        type="button"
                        className="btn btn-sm btn-outline-primary d-flex align-items-center gap-1"
                        onClick={addNewItemRow}
                        disabled={isDisabled}
                      >
                        <FiPlus size={14} />
                        Add Empty Item Row
                      </button>
                    )}

                    {hasItems && (
                      <button
                        type="button"
                        className="btn btn-sm btn-outline-danger d-flex align-items-center gap-1"
                        onClick={clearAllItems}
                        disabled={isDisabled}
                      >
                        <FiTrash2 size={14} />
                        Clear All Items
                      </button>
                    )}

                    {hasItems && (
                      <div className="ms-auto">
                        <span className="badge bg-info">
                          Items Source:{" "}
                          {itemSource === "quotation"
                            ? "Quotation"
                            : "Manual Products"}
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Basic Information */}
              <div className="row mb-4">
                <div className="col-md-3 mb-3">
                  <label className="form-label fw-medium">
                    Job Card Date <span className="text-danger">*</span>
                  </label>
                  <div className="input-group">
                    <span className="input-group-text">
                      <FiCalendar size={14} />
                    </span>
                    <input
                      type="date"
                      name="job_card_date"
                      className={`form-control ${
                        errors.job_card_date ? "is-invalid" : ""
                      }`}
                      value={formData.job_card_date}
                      onChange={handleChange}
                      disabled={isDisabled}
                    />
                  </div>
                  {errors.job_card_date && (
                    <div className="invalid-feedback">
                      {errors.job_card_date}
                    </div>
                  )}
                </div>

                <div className="col-md-3 mb-3">
                  <label className="form-label fw-medium">
                    Expected Delivery <span className="text-danger">*</span>
                  </label>
                  <div className="input-group">
                    <span className="input-group-text">
                      <FiCalendar size={14} />
                    </span>
                    <input
                      type="date"
                      name="expected_delivery_date"
                      className={`form-control ${
                        errors.expected_delivery_date ? "is-invalid" : ""
                      }`}
                      value={formData.expected_delivery_date}
                      onChange={handleChange}
                      disabled={isDisabled}
                      min={formData.job_card_date}
                    />
                  </div>
                  {errors.expected_delivery_date && (
                    <div className="invalid-feedback">
                      {errors.expected_delivery_date}
                    </div>
                  )}
                </div>

                <div className="col-md-3 mb-3">
                  <label className="form-label fw-medium">
                    Actual Delivery
                  </label>
                  <div className="input-group">
                    <span className="input-group-text">
                      <FiCalendar size={14} />
                    </span>
                    <input
                      type="date"
                      name="delivery_date"
                      className="form-control"
                      value={formData.delivery_date}
                      onChange={handleChange}
                      disabled={isDisabled}
                      min={formData.job_card_date}
                    />
                  </div>
                </div>

                {/* Customer section - Only show when NOT adding products or when quotation is selected */}
                {itemSource !== "products" && (
                  <div className="col-md-3 mb-3">
                    <label className="form-label fw-medium">
                      Customer <span className="text-danger">*</span>
                    </label>
                    <div className="input-group">
                      <span className="input-group-text">
                        <FiUser size={14} />
                      </span>
                      <input
                        type="text"
                        className={`form-control ${
                          errors.customer_id ? "is-invalid" : ""
                        }`}
                        value={formData.customer_name || ""}
                        readOnly
                        placeholder={
                          selectedQuotation
                            ? "Auto-filled from quotation"
                            : "Enter customer name"
                        }
                      />
                    </div>
                    {formData.customer_mobile && (
                      <div className="small text-muted mt-1">
                        Mobile: {formData.customer_mobile}
                      </div>
                    )}

                    {errors.customer_id && (
                      <div className="invalid-feedback">
                        {errors.customer_id}
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* IMAGE UPLOAD SECTION - Similar to Quotation form */}
              <div className="row mb-4">
                <div className="col-md-12">
                  <div className="card">
                    <div className="card-body">
                      <label className="form-label fw-medium d-flex align-items-center gap-2 mb-3">
                        <FiImage size={18} />
                        Job Card Images (Optional)
                        {imagePreviews.length > 0 && (
                          <span className="badge bg-primary ms-2">
                            {imagePreviews.length} image(s)
                          </span>
                        )}
                      </label>

                      {/* Hidden file input */}
                      <input
                        type="file"
                        ref={fileInputRef}
                        className="d-none"
                        accept="image/*"
                        multiple
                        onChange={handleFileSelect}
                        disabled={isDisabled}
                      />

                      <div className="d-flex align-items-start gap-4 mb-4">
                        {/* Upload button */}
                        <div className="flex-shrink-0">
                          <button
                            type="button"
                            className="btn btn-outline-primary d-flex align-items-center gap-2 px-4"
                            onClick={triggerFileInput}
                            disabled={isDisabled || uploadingImages}
                          >
                            {uploadingImages ? (
                              <>
                                <span className="spinner-border spinner-border-sm" />
                                Uploading...
                              </>
                            ) : (
                              <>
                                <FiCamera size={18} />
                                Upload Images
                              </>
                            )}
                          </button>

                          <div className="form-text mt-2">
                            Max 10 images • 2MB each • JPEG, PNG, JPG, WEBP, GIF
                          </div>

                          {errors.images && (
                            <div className="text-danger small mt-2 d-flex align-items-center gap-1">
                              <FiAlertCircle size={14} />
                              {errors.images}
                            </div>
                          )}
                        </div>

                        {/* Clear all button */}
                        {imagePreviews.length > 0 && (
                          <button
                            type="button"
                            className="btn btn-outline-danger d-flex align-items-center gap-2"
                            onClick={clearAllImages}
                            disabled={isDisabled}
                          >
                            <FiTrash2 size={16} />
                            Clear All Images
                          </button>
                        )}
                      </div>

                      {/* Image previews grid */}
                      {imagePreviews.length > 0 && (
                        <div className="row row-cols-2 row-cols-md-3 row-cols-lg-4 g-3 mt-3">
                          {imagePreviews.map((preview, index) => (
                            <div key={index} className="col">
                              <div className="border rounded p-2 bg-light position-relative">
                                <img
                                  src={preview}
                                  alt={`Preview ${index + 1}`}
                                  className="rounded w-100"
                                  style={{
                                    height: "120px",
                                    objectFit: "cover",
                                  }}
                                />
                                <button
                                  type="button"
                                  className="btn btn-sm btn-danger position-absolute top-0 end-0"
                                  onClick={() => handleRemoveImage(index)}
                                  disabled={isDisabled}
                                  style={{
                                    transform: "translate(30%, -30%)",
                                    borderRadius: "50%",
                                    width: "30px",
                                    height: "30px",
                                    display: "flex",
                                    alignItems: "center",
                                    justifyContent: "center",
                                  }}
                                >
                                  <FiX size={14} />
                                </button>
                                <div className="small text-muted text-center mt-1">
                                  Image {index + 1}
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}

                      {/* No images placeholder */}
                      {imagePreviews.length === 0 && (
                        <div className="border rounded d-flex align-items-center justify-content-center p-5 bg-light">
                          <div className="text-center text-muted">
                            <FiImage size={48} className="mb-3" />
                            <div className="fw-medium mb-1">
                              No images uploaded
                            </div>
                            <div className="small">
                              Click "Upload Images" to add job card images
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {/* Additional Information */}
              <div className="row mb-4">
                <div className="col-md-3 mb-3">
                  <label className="form-label fw-medium">Priority</label>
                  <select
                    name="priority"
                    className="form-select"
                    value={formData.priority}
                    onChange={handleChange}
                    disabled={isDisabled}
                  >
                    {priorityOptions.map((priority) => (
                      <option key={priority.value} value={priority.value}>
                        {priority.label}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="col-md-3 mb-3">
                  <label className="form-label fw-medium">Status</label>
                  <select
                    name="status"
                    className="form-select"
                    value={formData.status}
                    onChange={handleChange}
                    disabled={isDisabled}
                  >
                    {statusOptions.map((status) => (
                      <option key={status.value} value={status.value}>
                        {status.label}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="col-md-3 mb-3">
                  <label className="form-label fw-medium">Assign To</label>
                  <select
                    name="assigned_to"
                    className="form-select"
                    value={formData.assigned_to}
                    onChange={handleChange}
                    disabled={isDisabled || loadingEmployees}
                  >
                    <option value="">Select Employee</option>
                    {loadingEmployees ? (
                      <option value="" disabled>
                        Loading employees...
                      </option>
                    ) : (
                      employees?.map((employee) => (
                        <option key={employee._id} value={employee._id}>
                          {employee.name || employee.employee_name}
                          {employee.employee_code
                            ? ` (${employee.employee_code})`
                            : ""}
                        </option>
                      ))
                    )}
                  </select>
                </div>

                <div className="col-md-3 mb-3">
                  <label className="form-label fw-medium">Item Source</label>
                  <div className="form-control bg-light">
                    {itemSource === "quotation" ? (
                      <div className="d-flex align-items-center">
                        <FiShoppingCart className="me-2 text-success" />
                        <span className="fw-medium">From Quotation</span>
                        {selectedQuotation && (
                          <span className="ms-2 text-muted small">
                            ({selectedQuotation.quotation_number})
                          </span>
                        )}
                      </div>
                    ) : (
                      <div className="d-flex align-items-center">
                        <FiPackage className="me-2 text-primary" />
                        <span className="fw-medium">Manual Products</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Order Table Section */}
              <div className="border rounded-3 p-3 mb-4">
                <div className="d-flex justify-content-between align-items-center mb-3">
                  <h6 className="fw-bold mb-0">
                    Job Card Items
                    <span className="text-muted ms-2 fs-6">
                      ({formData.items.filter((item) => item.product_id).length}{" "}
                      items)
                      {selectedQuotation && " - From Quotation"}
                    </span>
                  </h6>
                  <div className="d-flex gap-2">
                    <button
                      type="button"
                      className="btn btn-sm btn-outline-primary d-flex align-items-center gap-1"
                      onClick={addNewItemRow}
                      disabled={isDisabled}
                    >
                      <FiPlus size={14} />
                      Add Item Row
                    </button>
                  </div>
                </div>

                {/* Items Table */}
                <div
                  className="table-responsive"
                  style={{ maxHeight: "400px", overflowY: "auto" }}
                >
                  <table className="table table-bordered align-middle mb-0">
                    <thead className="table-light">
                      <tr>
                        <th style={{ width: "25%" }}>Product</th>
                        <th style={{ width: "20%" }}>Description</th>
                        <th style={{ width: "10%" }}>Quantity</th>
                        <th style={{ width: "15%" }}>Unit Price</th>
                        <th style={{ width: "15%" }}>Total</th>
                        <th style={{ width: "10%" }}>Notes</th>
                        <th style={{ width: "5%" }}>Action</th>
                      </tr>
                    </thead>
                    <tbody>
                      {formData.items
                        .filter((item) => item.product_id)
                        .map((item, index) => (
                          <tr key={index}>
                            <td>
                              <div className="d-flex align-items-center">
                                <div className="flex-grow-1">
                                  <div className="fw-medium">
                                    {item.product_name || "Unknown Product"}
                                  </div>
                                  <div className="small text-muted">
                                    Code: {item.article_no}
                                  </div>
                                </div>
                                <button
                                  type="button"
                                  className="btn btn-sm btn-outline-secondary ms-2 flex-shrink-0"
                                  onClick={() => clearItem(index)}
                                  disabled={isDisabled}
                                  title="Clear item"
                                >
                                  <FiX size={14} />
                                </button>
                              </div>
                            </td>
                            <td>
                              <textarea
                                className="form-control"
                                rows={2}
                                value={item.description}
                                onChange={(e) =>
                                  handleItemChange(
                                    index,
                                    "description",
                                    e.target.value
                                  )
                                }
                                disabled={isDisabled}
                                placeholder="Description"
                              />
                            </td>
                            <td>
                              <input
                                type="number"
                                className="form-control"
                                value={item.quantity}
                                onChange={(e) =>
                                  handleItemChange(
                                    index,
                                    "quantity",
                                    e.target.value
                                  )
                                }
                                disabled={isDisabled}
                                min="1"
                                step="1"
                              />
                            </td>
                            <td>
                              <div className="input-group">
                                <span className="input-group-text">₹</span>
                                <input
                                  type="number"
                                  className="form-control"
                                  value={item.unit_price}
                                  onChange={(e) =>
                                    handleItemChange(
                                      index,
                                      "unit_price",
                                      e.target.value
                                    )
                                  }
                                  disabled={isDisabled}
                                  min="0"
                                  step="0.01"
                                />
                              </div>
                              {item.price_info && (
                                <div className="small text-muted mt-1">
                                  <div>
                                    Base: ₹
                                    {item.price_info.base_price?.toLocaleString(
                                      "en-IN"
                                    ) || 0}
                                  </div>
                                  <div>
                                    GST: ₹
                                    {item.price_info.gst_amount?.toLocaleString(
                                      "en-IN"
                                    ) || 0}
                                  </div>
                                </div>
                              )}
                            </td>
                            <td>
                              <div className="input-group">
                                <span className="input-group-text">₹</span>
                                <input
                                  type="text"
                                  className="form-control bg-light fw-medium"
                                  value={formatCurrency(item.total_amount || 0)}
                                  readOnly
                                />
                              </div>
                            </td>
                            <td>
                              <textarea
                                className="form-control"
                                rows={2}
                                value={item.notes}
                                onChange={(e) =>
                                  handleItemChange(
                                    index,
                                    "notes",
                                    e.target.value
                                  )
                                }
                                disabled={isDisabled}
                                placeholder="Notes"
                              />
                            </td>
                            <td className="text-center">
                              <button
                                type="button"
                                className="btn btn-sm btn-outline-danger"
                                onClick={() => removeItem(index)}
                                disabled={
                                  isDisabled ||
                                  formData.items.filter((i) => i.product_id)
                                    .length === 1
                                }
                                title="Remove item"
                              >
                                <FiTrash2 size={14} />
                              </button>
                            </td>
                          </tr>
                        ))}

                      {/* Empty state */}
                      {formData.items.filter((item) => item.product_id)
                        .length === 0 && (
                        <tr>
                          <td
                            colSpan="7"
                            className="text-center py-5 text-muted"
                          >
                            <div className="d-flex flex-column align-items-center">
                              <FiAlertCircle className="mb-2" size={32} />
                              <span className="fs-6">
                                {selectedQuotation
                                  ? "No items found in quotation"
                                  : "No items added to job card"}
                              </span>
                              {!selectedQuotation && (
                                <button
                                  type="button"
                                  className="btn btn-sm btn-outline-primary mt-3"
                                  onClick={addNewItemRow}
                                >
                                  <FiPlus className="me-1" />
                                  Add First Item
                                </button>
                              )}
                            </div>
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>

                {/* Summary Section */}
                <div className="row mt-4">
                  <div className="col-md-6">
                    <div className="mb-3">
                      <label className="form-label fw-medium">
                        Special Instructions
                      </label>
                      <textarea
                        className="form-control"
                        rows={3}
                        placeholder="Any special instructions for the job..."
                        value={formData.instructions}
                        onChange={handleChange}
                        name="instructions"
                        disabled={isDisabled}
                      ></textarea>
                    </div>
                    <div className="mb-3">
                      <label className="form-label fw-medium">Notes</label>
                      <textarea
                        className="form-control"
                        rows={3}
                        placeholder="Additional notes..."
                        value={formData.note}
                        onChange={handleChange}
                        name="note"
                        disabled={isDisabled}
                      ></textarea>
                    </div>
                  </div>

                  <div className="col-md-6">
                    <div className="bg-light p-4 rounded-3">
                      <h6 className="fw-bold mb-3">Job Summary</h6>

                      {selectedQuotation && (
                        <div className="alert alert-info mb-3">
                          <div className="small">
                            <strong>Quotation Reference:</strong>{" "}
                            {selectedQuotation.quotation_number}
                            <div className="mt-1">
                              Original Total:{" "}
                              {formatCurrency(selectedQuotation.grand_total)}
                            </div>
                          </div>
                        </div>
                      )}

                      <div className="mb-3">
                        <div className="row mb-2">
                          <div className="col-6">
                            <span className="text-muted">Priority:</span>
                          </div>
                          <div className="col-6">
                            {getPriorityBadge(formData.priority)}
                          </div>
                        </div>
                        <div className="row mb-2">
                          <div className="col-6">
                            <span className="text-muted">Status:</span>
                          </div>
                          <div className="col-6">
                            <span className="fw-medium">
                              {
                                statusOptions.find(
                                  (s) => s.value === formData.status
                                )?.label
                              }
                            </span>
                          </div>
                        </div>
                        <div className="row mb-2">
                          <div className="col-6">
                            <span className="text-muted">Assigned To:</span>
                          </div>
                          <div className="col-6">
                            <span className="fw-medium">
                              {formData.assigned_to
                                ? employees.find(
                                    (e) => e._id === formData.assigned_to
                                  )?.name || "N/A"
                                : "Not Assigned"}
                            </span>
                          </div>
                        </div>
                        <div className="row mb-2">
                          <div className="col-6">
                            <span className="text-muted">Item Source:</span>
                          </div>
                          <div className="col-6">
                            <span className="fw-medium">
                              {itemSource === "quotation"
                                ? "Quotation"
                                : "Manual"}
                            </span>
                          </div>
                        </div>
                        <div className="row mb-2">
                          <div className="col-6">
                            <span className="text-muted">Images:</span>
                          </div>
                          <div className="col-6">
                            <span className="fw-medium">
                              {imagePreviews.length} uploaded
                            </span>
                          </div>
                        </div>
                      </div>

                      <div className="mb-3">
                        <div className="d-flex justify-content-between mb-2">
                          <span className="text-muted">Total Amount:</span>
                          <span className="fw-medium">
                            {formatCurrency(formData.total_amount || 0)}
                          </span>
                        </div>
                        <div className="d-flex justify-content-between mb-2">
                          <span className="text-muted">Advance Amount:</span>
                          <div className="input-group input-group-sm w-50">
                            <span className="input-group-text">₹</span>
                            <input
                              type="number"
                              className="form-control"
                              name="advance_amount"
                              value={formData.advance_amount}
                              onChange={handleChange}
                              disabled={isDisabled}
                              min="0"
                              step="0.01"
                              placeholder="0.00"
                            />
                          </div>
                        </div>
                        <hr />
                        <div className="d-flex justify-content-between">
                          <span className="fw-bold fs-5">Balance Amount:</span>
                          <span className="fw-bold fs-5 text-primary">
                            {formatCurrency(formData.balance_amount || 0)}
                          </span>
                        </div>
                        <div className="small text-muted mt-2">
                          Expected Delivery: {formData.expected_delivery_date}
                        </div>
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
                    Creating Job Card...
                  </>
                ) : (
                  <>
                    <FiUpload size={16} />
                    Create Job Card
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

export default AddJobCardForm;
