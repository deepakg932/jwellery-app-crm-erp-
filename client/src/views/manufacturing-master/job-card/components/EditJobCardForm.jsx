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
  FiEdit2,
  FiLock,
  FiUnlock,
} from "react-icons/fi";
import useJobCards from "@/hooks/useJobCards";

const EditJobCardForm = ({
  onClose,
  onSave,
  loading = false,
  jobCardData = null,
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

  // Determine initial source based on job card data
  const getInitialSource = (jobCard) => {
    if (!jobCard) return "none";
    
    // Check if job card has quotation_id or quotation_number
    if (jobCard.quotation_id || jobCard.quotation_number) {
      console.log("Job Card has quotation data:", {
        quotation_id: jobCard.quotation_id,
        quotation_number: jobCard.quotation_number
      });
      return "quotation";
    }
    
    // Check if job card has items
    if (jobCard.items && jobCard.items.length > 0) {
      console.log("Job Card has items, no quotation data");
      return "products";
    }
    
    return "none";
  };

  const [itemSource, setItemSource] = useState("none");
  const [activeTab, setActiveTab] = useState("products");
  const [isSourceLocked, setIsSourceLocked] = useState(true); // Lock source initially

  // Refs
  const dropdownRef = useRef(null);
  const searchInputRef = useRef(null);
  const productSearchRef = useRef(null);

  const [formData, setFormData] = useState({
    _id: "",
    job_card_no: "",
    quotation_id: "",
    quotation_number: "",
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

  // Initialize form with job card data
  useEffect(() => {
    if (jobCardData) {
      const jobCard = jobCardData.data?.[0] || jobCardData;
      
      console.log("Job Card Data for Edit:", jobCard);
      console.log("Quotation Data:", {
        quotation_id: jobCard.quotation_id,
        quotation_number: jobCard.quotation_number,
        hasItems: jobCard.items?.length > 0
      });
      
      // Format items from API response
      const formattedItems = (jobCard.items || []).map((item) => ({
        product_id: item.product_id?._id || item.product_id || "",
        product_code: item.product_id?.product_code || item.product_id?.article_no || "",
        product_name: item.product_name || item.product_id?.product_name || "",
        description: item.description || "",
        quantity: (item.quantity || 1).toString(),
        unit_price: item.unit_price || 0,
        total_amount: item.total_amount || 0,
        notes: item.notes || "",
        // Store product details for display
        product_details: item.product_id,
      }));

      const initialSource = getInitialSource(jobCard);
      console.log("Initial source determined:", initialSource);

      // Set active tab based on source
      let initialActiveTab = "products";
      if (initialSource === "quotation") {
        initialActiveTab = "quotation";
        
        // If from quotation, we need to find and set the quotation
        if (jobCard.quotation_id && allQuotations.length > 0) {
          const foundQuotation = allQuotations.find(q => q._id === jobCard.quotation_id);
          if (foundQuotation) {
            console.log("Found quotation in list:", foundQuotation);
            setSelectedQuotation(foundQuotation);
            setSearchTerm(foundQuotation.quotation_number || "");
          }
        }
      }
      
      console.log("Active tab set to:", initialActiveTab);

      // Set form data
      setFormData({
        _id: jobCard._id || "",
        job_card_no: jobCard.job_card_no || "",
        quotation_id: jobCard.quotation_id || "",
        quotation_number: jobCard.quotation_number || "",
        customer_id: jobCard.customer_id?._id || jobCard.customer_id || "",
        customer_name: jobCard.customer_id?.name || jobCard.customer_name || "",
        customer_mobile: jobCard.customer_id?.mobile || jobCard.customer_mobile || "",
        job_card_date: jobCard.job_card_date 
          ? new Date(jobCard.job_card_date).toISOString().split("T")[0]
          : new Date().toISOString().split("T")[0],
        expected_delivery_date: jobCard.expected_delivery_date
          ? new Date(jobCard.expected_delivery_date).toISOString().split("T")[0]
          : new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split("T")[0],
        delivery_date: jobCard.delivery_date
          ? new Date(jobCard.delivery_date).toISOString().split("T")[0]
          : "",
        items: formattedItems,
        note: jobCard.note || "",
        instructions: jobCard.instructions || "",
        priority: jobCard.priority || "medium",
        status: jobCard.status || "pending",
        total_amount: jobCard.total_amount || 0,
        advance_amount: jobCard.advance_amount || 0,
        balance_amount: jobCard.balance_amount || 0,
        assigned_to: jobCard.assigned_to?._id || jobCard.assigned_to || "",
      });

      // Set item source and active tab
      setItemSource(initialSource);
      setActiveTab(initialActiveTab);

      console.log("Form initialized with source:", initialSource, "and tab:", initialActiveTab);
    }
  }, [jobCardData, allQuotations]);

  // Auto-fetch quotation if job card has quotation data
  useEffect(() => {
    if (jobCardData && !selectedQuotation) {
      const jobCard = jobCardData.data?.[0] || jobCardData;
      
      if (jobCard.quotation_id) {
        console.log("Auto-fetching quotation for job card:", jobCard.quotation_id);
        
        // Try to find in already loaded quotations
        if (allQuotations.length > 0) {
          const foundQuotation = allQuotations.find(q => q._id === jobCard.quotation_id);
          if (foundQuotation) {
            console.log("Found quotation in loaded list:", foundQuotation);
            setSelectedQuotation(foundQuotation);
            setSearchTerm(foundQuotation.quotation_number || jobCard.quotation_number || "");
          } else {
            console.log("Quotation not found in loaded list, fetching...");
            fetchQuotations();
          }
        } else {
          console.log("No quotations loaded yet, fetching...");
          fetchQuotations();
        }
      }
    }
  }, [jobCardData, selectedQuotation, allQuotations, fetchQuotations]);

  // Filter quotations based on search term
  useEffect(() => {
    if (!searchTerm.trim() || searchTerm.trim().length < 2) {
      setFilteredQuotations([]);
      setShowQuotationDropdown(false);
      return;
    }

    const searchTermLower = searchTerm.toLowerCase();

    const filtered = allQuotations.filter((quotation) => {
      // Check if quotation is already selected
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

      const matchProductCode = product.product_code
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

  // Toggle source lock
  const toggleSourceLock = () => {
    if (isSourceLocked) {
      // Only allow unlocking if no items are selected
      if (formData.items.some(item => item.product_id)) {
        alert("Please clear all items before changing source");
        return;
      }
    }
    setIsSourceLocked(!isSourceLocked);
  };

  // Handle product selection from search - FOR PRODUCTS SOURCE
  const handleProductSelect = (product) => {
    // Allow in products mode OR when source is unlocked
    if (itemSource !== "products" && isSourceLocked) {
      alert("Please switch to products mode or unlock source to add products");
      return;
    }

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
        product_code: product.product_code || product.article_no || "",
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

    setProductSearch("");
    setShowProductDropdown(false);
    setTimeout(calculateTotals, 100);
  };

  // Handle quotation selection - FOR QUOTATION SOURCE
  const handleQuotationSelect = (quotation) => {
    // Allow in quotation mode OR when source is unlocked
    if (itemSource !== "quotation" && isSourceLocked) {
      alert("Please switch to quotation mode or unlock source to select quotation");
      return;
    }

    const customer = quotation.customer_id || {};

    const jobCardItems = (quotation.items || []).map((item) => ({
      product_id: item.product_id?._id || item.product_id || "",
      product_code: item.product_code || "",
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
      note:
        `Created from Quotation: ${quotation.quotation_number || ""}` +
        (quotation.note ? `\nQuotation Note: ${quotation.note}` : ""),
      instructions: quotation.terms_conditions || "",
      expected_delivery_date: expectedDelivery.toISOString().split("T")[0],
      job_card_date: jobCardDate,
      quotation_id: quotation._id,
      quotation_number: quotation.quotation_number,
    }));

    setSelectedQuotation(quotation);
    setShowQuotationDropdown(false);
    setSearchTerm(quotation.quotation_number || "");
    
    // Set source to quotation
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
    if (isSourceLocked && hasItems) {
      alert("Cannot clear quotation while items exist. Clear items first or unlock source.");
      return;
    }

    setSelectedQuotation(null);
    setSearchTerm("");
    setFilteredQuotations([]);
    setShowQuotationDropdown(false);

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
      quotation_id: "",
      quotation_number: "",
    }));

    // Switch to products mode
    setItemSource("products");
    setActiveTab("products");
    
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
    calculateTotals();
  };

  // Switch to products tab
  const switchToProductsTab = () => {
    if (isSourceLocked && itemSource === "quotation") {
      alert("Source is locked. Please unlock first to switch from quotation to products.");
      return;
    }

    if (hasItems && itemSource === "quotation") {
      alert("Cannot switch to products while quotation items exist. Clear items first.");
      return;
    }

    setActiveTab("products");
    if (!isSourceLocked) {
      setItemSource("products");
    }
    
    // Clear quotation selection when switching to products
    setSelectedQuotation(null);
    setSearchTerm("");
    setFilteredQuotations([]);
    
    clearAllItems();
  };

  // Switch to quotation tab
  const switchToQuotationTab = () => {
    if (isSourceLocked && itemSource === "products") {
      alert("Source is locked. Please unlock first to switch from products to quotation.");
      return;
    }

    if (hasItems && itemSource === "products") {
      alert("Cannot switch to quotation while product items exist. Clear items first.");
      return;
    }

    setActiveTab("quotation");
    if (!isSourceLocked) {
      setItemSource("quotation");
    }
    clearAllItems();
  };

  // Validate form
  const validateForm = () => {
    const newErrors = {};

    // Customer validation depends on source
    if (itemSource === "quotation" && !formData.customer_id) {
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
    } else {
      clearItem(index);
    }
  };

  // Clear item data
  const clearItem = (index) => {
    const updatedItems = [...formData.items];
    updatedItems[index] = {
      product_id: "",
      product_code: "",
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

    setTimeout(calculateTotals, 0);
  };

  // Add new empty item row - FOR PRODUCTS SOURCE
  const addNewItemRow = () => {
    // Allow in products mode OR when source is unlocked
    if (itemSource !== "products" && isSourceLocked) {
      alert("Can only add empty rows in products mode");
      return;
    }

    setFormData((prev) => ({
      ...prev,
      items: [
        ...prev.items,
        {
          product_id: "",
          product_code: "",
          product_name: "",
          description: "",
          quantity: "1",
          unit_price: 0,
          total_amount: 0,
          notes: "",
        },
      ],
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    const totalAmount = parseFloat(formData.total_amount) || 0;
    const advanceAmount = parseFloat(formData.advance_amount) || 0;
    const balanceAmount = Math.max(0, totalAmount - advanceAmount);

    const payload = {
      _id: formData._id,
      job_card_date: formData.job_card_date,
      expected_delivery_date: formData.expected_delivery_date,
      delivery_date: formData.delivery_date || null,
      items: formData.items
        .filter((item) => item.product_id)
        .map((item) => ({
          product_id: item.product_id,
          product_code: item.product_code,
          product_name: item.product_name,
          description: item.description,
          quantity: parseFloat(item.quantity) || 1,
          unit_price: parseFloat(item.unit_price) || 0,
          total_amount: parseFloat(item.total_amount) || 0,
          notes: item.notes,
        })),
      note: formData.note,
      instructions: formData.instructions,
      priority: formData.priority,
      status: formData.status,
      total_amount: totalAmount,
      advance_amount: advanceAmount,
      balance_amount: balanceAmount,
      assigned_to: formData.assigned_to || null,
    };

    // Add customer data if from quotation
    if (itemSource === "quotation" && formData.customer_id) {
      payload.customer_id = formData.customer_id;
    }

    // Add quotation data if available
    if (formData.quotation_id) {
      payload.quotation_id = formData.quotation_id;
      payload.quotation_number = formData.quotation_number;
    }

    console.log("Updating job card data:", payload);
    onSave(payload);
  };

  const handleClose = () => {
    setFormData({
      _id: "",
      job_card_no: "",
      quotation_id: "",
      quotation_number: "",
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
    setIsSourceLocked(true);
    onClose();
  };

  const isDisabled =
    loading || loadingEmployees || loadingQuotations || loadingProducts;

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

  // Render product details for existing items
  const renderProductDetails = (item) => {
    if (!item.product_details) return null;

    const product = item.product_details;
    return (
      <div className="small text-muted mt-1">
        {product.metals && product.metals.length > 0 && (
          <div>
            Metal: {product.metals[0].metal_type} ({product.metals[0].purity})
          </div>
        )}
        {product.stones && product.stones.length > 0 && (
          <div>Stone: {product.stones[0].stone_type}</div>
        )}
        {product.selling_price_with_gst && (
          <div className="text-success">(Includes GST)</div>
        )}
      </div>
    );
  };

  // Get source badge
  const getSourceBadge = () => {
    if (itemSource === "quotation") {
      return (
        <span className="badge bg-success">
          <FiShoppingCart className="me-1" />
          From Quotation: {formData.quotation_number}
        </span>
      );
    } else if (itemSource === "products") {
      return (
        <span className="badge bg-primary">
          <FiPackage className="me-1" />
          Manual Products
        </span>
      );
    } else {
      return (
        <span className="badge bg-secondary">
          No Source Selected
        </span>
      );
    }
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
              <FiEdit2 className="me-2" />
              Edit Job Card: {formData.job_card_no}
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
              {/* Job Card Info */}
              <div className="alert alert-info mb-4">
                <div className="d-flex align-items-center justify-content-between">
                  <div>
                    <strong>Job Card Number:</strong> {formData.job_card_no}
                    <div className="small mt-1">
                      {getSourceBadge()}
                      <button
                        type="button"
                        className="btn btn-sm btn-outline-warning ms-3"
                        onClick={toggleSourceLock}
                        title={isSourceLocked ? "Unlock to change source" : "Lock current source"}
                      >
                        {isSourceLocked ? (
                          <>
                            <FiLock className="me-1" />
                            Source Locked
                          </>
                        ) : (
                          <>
                            <FiUnlock className="me-1" />
                            Source Unlocked
                          </>
                        )}
                      </button>
                    </div>
                  </div>
                  <div>
                    <span className="badge bg-primary me-2">
                      Source: {itemSource === "quotation" ? "Quotation" : "Products"}
                    </span>
                    <span className="badge bg-secondary">
                      Status: {formData.status}
                    </span>
                  </div>
                </div>
              </div>

              {/* Source Selection Tabs - Only show if source is unlocked */}
              {!isSourceLocked ? (
                <div className="card mb-4">
                  <div className="card-body p-3">
                    <div className="d-flex mb-3 align-items-center">
                      <div className="btn-group" role="group">
                        <button
                          type="button"
                          className={`btn btn-${
                            itemSource === "products"
                              ? "primary"
                              : "outline-primary"
                          } d-flex align-items-center gap-2`}
                          onClick={() => {
                            if (hasItems && itemSource === "quotation") {
                              alert("Cannot switch to products while quotation items exist. Clear items first.");
                              return;
                            }
                            setItemSource("products");
                            setActiveTab("products");
                            setSelectedQuotation(null);
                            setSearchTerm("");
                          }}
                          disabled={isDisabled}
                        >
                          <FiPackage size={16} />
                          Products Mode
                        </button>
                        <button
                          type="button"
                          className={`btn btn-${
                            itemSource === "quotation"
                              ? "primary"
                              : "outline-primary"
                          } d-flex align-items-center gap-2`}
                          onClick={() => {
                            if (hasItems && itemSource === "products") {
                              alert("Cannot switch to quotation while product items exist. Clear items first.");
                              return;
                            }
                            setItemSource("quotation");
                            setActiveTab("quotation");
                          }}
                          disabled={isDisabled}
                        >
                          <FiShoppingCart size={16} />
                          Quotation Mode
                        </button>
                      </div>
                      
                      <div className="ms-3">
                        <small className="text-warning">
                          Source unlocked - you can switch between quotation/products
                        </small>
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="card mb-4">
                  <div className="card-body p-3">
                    <div className="alert alert-warning mb-0">
                      <div className="d-flex align-items-center">
                        <FiLock className="me-2" />
                        <div>
                          <strong>Source Locked</strong>
                          <div className="small">
                            Current source: {itemSource === "quotation" ? "Quotation" : "Products"}
                            {isSourceLocked && " (Cannot change source while items exist)"}
                          </div>
                        </div>
                        <button
                          type="button"
                          className="btn btn-sm btn-outline-warning ms-auto"
                          onClick={toggleSourceLock}
                          disabled={hasItems}
                          title={hasItems ? "Clear items to unlock source" : "Unlock source"}
                        >
                          {hasItems ? (
                            <>
                              <FiLock className="me-1" />
                              Clear Items to Unlock
                            </>
                          ) : (
                            <>
                              <FiUnlock className="me-1" />
                              Unlock Source
                            </>
                          )}
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Quotation Section - Show only if in quotation mode */}
              {itemSource === "quotation" && (
                <div className="card mb-4">
                  <div className="card-body">
                    <h6 className="fw-bold mb-3">Quotation Information</h6>
                    <div className="row align-items-center">
                      <div className="col-md-8 position-relative">
                        <label className="form-label fw-medium mb-1">
                          <FiSearch className="me-2" />
                          {selectedQuotation ? "Change Quotation" : "Select Quotation"}
                        </label>
                        <div className="input-group" ref={searchInputRef}>
                          <input
                            type="text"
                            className="form-control"
                            placeholder="Search by quotation number, customer name or mobile..."
                            value={searchTerm}
                            onChange={handleSearchChange}
                            disabled={isDisabled}
                            onFocus={() => {
                              if (searchTerm.length >= 2) {
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
                        {showQuotationDropdown && filteredQuotations.length > 0 && (
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
                                  onClick={() => handleQuotationSelect(quotation)}
                                  onMouseEnter={(e) =>
                                    (e.currentTarget.style.backgroundColor = "#f8f9fa")
                                  }
                                  onMouseLeave={(e) =>
                                    (e.currentTarget.style.backgroundColor = "")
                                  }
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
                                    </div>
                                    <div className="text-end">
                                      <div className="fw-bold">
                                        {formatCurrency(quotation.grand_total)}
                                      </div>
                                      <div className="small text-muted">
                                        {quotation.quotation_date
                                          ? new Date(quotation.quotation_date).toLocaleDateString()
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
                                  Total: {formatCurrency(selectedQuotation.grand_total)}
                                </div>
                              </div>
                            </div>
                          </div>
                        ) : formData.quotation_id ? (
                          <div className="alert alert-info mb-0">
                            <div className="d-flex align-items-center">
                              <FiShoppingCart className="me-2" />
                              <div>
                                <strong>Current Quotation:</strong>{" "}
                                {formData.quotation_number}
                                <div className="small">
                                  Search to change quotation
                                </div>
                              </div>
                            </div>
                          </div>
                        ) : (
                          <div className="alert alert-warning mb-0">
                            <div className="d-flex align-items-center">
                              <FiAlertCircle className="me-2" />
                              <div>
                                <strong>No Quotation Selected</strong>
                                <div className="small">
                                  Search and select a quotation
                                </div>
                              </div>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Products Section - Show only if in products mode */}
              {itemSource === "products" && (
                <div className="card mb-4">
                  <div className="card-body">
                    <h6 className="fw-bold mb-3">Products Information</h6>
                    <div className="row align-items-center">
                      <div className="col-md-8 position-relative">
                        <label className="form-label fw-medium mb-1">
                          <FiSearch className="me-2" />
                          Search Products
                        </label>
                        <div className="input-group" ref={productSearchRef}>
                          <input
                            type="text"
                            className="form-control"
                            placeholder="Search by product name, code or description..."
                            value={productSearch}
                            onChange={handleProductSearchChange}
                            disabled={isDisabled}
                            onFocus={() => {
                              if (productSearch.length >= 2) {
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
                                  onClick={() => handleProductSelect(product)}
                                  onMouseEnter={(e) =>
                                    (e.currentTarget.style.backgroundColor = "#f8f9fa")
                                  }
                                  onMouseLeave={(e) =>
                                    (e.currentTarget.style.backgroundColor = "")
                                  }
                                >
                                  <div className="d-flex justify-content-between align-items-center">
                                    <div>
                                      <div className="fw-bold">
                                        {product.product_name || "Unnamed Product"}
                                      </div>
                                      <div className="small text-muted">
                                        Code: {product.product_code || product.article_no || "N/A"}
                                      </div>
                                      <div className="small text-muted">
                                        Category: {product.category || product.product_category || "N/A"}
                                      </div>
                                      {product.selling_price_with_gst && (
                                        <div className="small">
                                          <div>
                                            Base: ₹{product.grand_total?.toLocaleString("en-IN") || 0}
                                          </div>
                                          <div>
                                            GST: ₹{product.gst_amount?.toLocaleString("en-IN") || 0}
                                          </div>
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
                                            product.status === "active" ? "success" : "secondary"
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

                        {loadingProducts && (
                          <div className="text-muted small mt-1">
                            <span className="spinner-border spinner-border-sm me-1" />
                            Loading products...
                          </div>
                        )}

                        {!loadingProducts && productSearch.length >= 2 && filteredProducts.length === 0 && (
                          <div className="text-muted small mt-1">
                            No products found for "{productSearch}"
                          </div>
                        )}
                      </div>

                      <div className="col-md-4">
                        <div className="alert alert-info mb-0">
                          <div className="d-flex align-items-center">
                            <FiPackage className="me-2" />
                            <div>
                              <strong>Products Mode</strong>
                              <div className="small">
                                Search and select products to add or edit
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Quick Actions */}
                    <div className="d-flex gap-2 mt-3">
                      <button
                        type="button"
                        className="btn btn-sm btn-outline-primary d-flex align-items-center gap-1"
                        onClick={addNewItemRow}
                        disabled={isDisabled}
                      >
                        <FiPlus size={14} />
                        Add Empty Item Row
                      </button>

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
                    </div>
                  </div>
                </div>
              )}

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

                {/* Customer section - Show for quotation source or when customer exists */}
                {(itemSource === "quotation" || formData.customer_id) && (
                  <div className="col-md-3 mb-3">
                    <label className="form-label fw-medium">
                      Customer {itemSource === "quotation" && <span className="text-danger">*</span>}
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
                          itemSource === "quotation"
                            ? "Auto-filled from quotation"
                            : "Customer from job card"
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
                      ({formData.items.filter((item) => item.product_id).length} items)
                      {itemSource === "quotation" && " - From Quotation"}
                    </span>
                  </h6>
                  <div className="d-flex gap-2">
                    {itemSource === "products" && (
                      <button
                        type="button"
                        className="btn btn-sm btn-outline-primary d-flex align-items-center gap-1"
                        onClick={addNewItemRow}
                        disabled={isDisabled}
                      >
                        <FiPlus size={14} />
                        Add Item Row
                      </button>
                    )}
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
                                    Code: {item.product_code}
                                  </div>
                                  {renderProductDetails(item)}
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
                                  handleItemChange(index, "description", e.target.value)
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
                                  handleItemChange(index, "quantity", e.target.value)
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
                                    handleItemChange(index, "unit_price", e.target.value)
                                  }
                                  disabled={isDisabled}
                                  min="0"
                                  step="0.01"
                                />
                              </div>
                              {item.price_info && (
                                <div className="small text-muted mt-1">
                                  <div>
                                    Base: ₹{item.price_info.base_price?.toLocaleString("en-IN") || 0}
                                  </div>
                                  <div>
                                    GST: ₹{item.price_info.gst_amount?.toLocaleString("en-IN") || 0}
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
                                  handleItemChange(index, "notes", e.target.value)
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
                                  formData.items.filter((i) => i.product_id).length === 1
                                }
                                title="Remove item"
                              >
                                <FiTrash2 size={14} />
                              </button>
                            </td>
                          </tr>
                        ))}

                      {/* Empty state */}
                      {formData.items.filter((item) => item.product_id).length === 0 && (
                        <tr>
                          <td colSpan="7" className="text-center py-5 text-muted">
                            <div className="d-flex flex-column align-items-center">
                              <FiAlertCircle className="mb-2" size={32} />
                              <span className="fs-6">
                                {itemSource === "quotation"
                                  ? "No items found in quotation"
                                  : "No items added to job card"}
                              </span>
                              {itemSource === "products" && (
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

                      {itemSource === "quotation" && selectedQuotation && (
                        <div className="alert alert-info mb-3">
                          <div className="small">
                            <strong>Quotation Reference:</strong>{" "}
                            {selectedQuotation.quotation_number}
                            <div className="mt-1">
                              Original Total: {formatCurrency(selectedQuotation.grand_total)}
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
                              {statusOptions.find((s) => s.value === formData.status)?.label}
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
                                ? employees.find((e) => e._id === formData.assigned_to)?.name || "N/A"
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
                              {itemSource === "quotation" ? "Quotation" : "Manual Products"}
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
                          {formData.delivery_date && (
                            <div className="text-success">
                              Delivered: {formData.delivery_date}
                            </div>
                          )}
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
                    Updating Job Card...
                  </>
                ) : (
                  <>
                    <FiUpload size={16} />
                    Update Job Card
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

export default EditJobCardForm;