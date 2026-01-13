import React, { useState, useEffect, useRef } from "react";
import { FiUpload, FiTrash2, FiSearch, FiX, FiPlus } from "react-icons/fi";
import useSales from "@/hooks/useSales";

const EditSaleForm = ({ onClose, onSave, sale, loading = false }) => {
  const {
    customers,
    items,
    units,
    branches,
    loadingCustomers,
    loadingItems,
    loadingUnits,
    loadingBranches,
  } = useSales();

  const [formData, setFormData] = useState({
    customer_id: "",
    sale_date: new Date().toISOString().split("T")[0],
    reference_no: "",
    items: [],
    sale_note: "",
    shipping_cost: 0,
    discount: 0,
    vat: 0,
    subtotal: 0,
    total_amount: 0,
    grand_total: 0,
    branch_id: "",
    status: "draft",
    payment_status: "pending",
  });

  const [errors, setErrors] = useState({});
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [showSearchResults, setShowSearchResults] = useState(false);
  const searchRef = useRef(null);

  // Sale status options
  const saleStatusOptions = [
    { value: "draft", label: "Draft", color: "secondary" },
    { value: "pending", label: "Pending", color: "warning" },
    { value: "approved", label: "Approved", color: "primary" },
    { value: "completed", label: "Completed", color: "success" },
    { value: "cancelled", label: "Cancelled", color: "danger" },
    { value: "shipped", label: "Shipped", color: "info" },
  ];

  // Payment status options
  const paymentStatusOptions = [
    { value: "pending", label: "Pending", color: "warning" },
    { value: "partial", label: "Partial", color: "info" },
    { value: "paid", label: "Paid", color: "success" },
    { value: "overdue", label: "Overdue", color: "danger" },
  ];

  // Initialize form with sale data
  useEffect(() => {
    if (sale) {
      setFormData({
        customer_id: sale.customer_id?._id || sale.customer_id || "",
        sale_date: sale.sale_date || new Date().toISOString().split("T")[0],
        reference_no: sale.reference_no || "",
        items: sale.items?.map(item => ({
          product_id: item.product_id?._id || item.product_id || "",
          quantity: item.quantity || "",
          unit_id: item.unit_id || "",
          rate: item.rate || "",
          discount: item.discount || 0,
          tax: item.tax || 0,
          total: item.total || 0,
          product_name: item.product_name || item.product_id?.name || "",
          product_code: item.product_code || item.product_id?.product_code || "",
        })) || [],
        sale_note: sale.sale_note || "",
        shipping_cost: sale.shipping_cost || 0,
        discount: sale.discount || 0,
        vat: sale.vat || 0,
        subtotal: sale.subtotal || 0,
        total_amount: sale.total_amount || 0,
        grand_total: sale.grand_total || 0,
        branch_id: sale.branch_id?._id || sale.branch_id || "",
        status: sale.status || "draft",
        payment_status: sale.payment_status || "pending",
      });
    }
  }, [sale]);

  // Helper function to get selected product details
  const getSelectedProductDetails = (productId) => {
    if (!productId) return null;
    return items.find((item) => item._id === productId);
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.customer_id) {
      newErrors.customer_id = "Customer is required";
    }

    if (!formData.sale_date) {
      newErrors.sale_date = "Sale date is required";
    }

    if (!formData.branch_id) {
      newErrors.branch_id = "Branch is required";
    }

    if (!formData.status) {
      newErrors.status = "Sale status is required";
    }

    // Filter only items that have product_id (selected items)
    const selectedItems = formData.items.filter(
      (item) => item.product_id
    );

    if (selectedItems.length === 0) {
      newErrors.items = "At least one item is required";
    }

    selectedItems.forEach((item, index) => {
      const originalIndex = formData.items.findIndex(
        (i) => i.product_id === item.product_id
      );

      if (!item.quantity || parseFloat(item.quantity) <= 0) {
        newErrors[`items[${originalIndex}].quantity`] = "Valid quantity is required";
      }

      if (!item.unit_id) {
        newErrors[`items[${originalIndex}].unit_id`] = "Unit is required";
      }

      if (!item.rate || parseFloat(item.rate) <= 0) {
        newErrors[`items[${originalIndex}].rate`] = "Valid rate is required";
      }
    });

    // Validate shipping cost (can be 0)
    if (formData.shipping_cost < 0) {
      newErrors.shipping_cost = "Shipping cost cannot be negative";
    }

    // Validate discount (can be 0)
    if (formData.discount < 0) {
      newErrors.discount = "Discount cannot be negative";
    }

    // Validate VAT (can be 0)
    if (formData.vat < 0) {
      newErrors.vat = "VAT cannot be negative";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const calculateItemTotal = (quantity, rate, discount, tax) => {
    const qty = parseFloat(quantity) || 0;
    const rt = parseFloat(rate) || 0;
    const disc = parseFloat(discount) || 0;
    const tx = parseFloat(tax) || 0;

    const subtotal = qty * rt;
    const total = subtotal - disc + tx;
    
    return total > 0 ? total : 0;
  };

  const calculateTotals = () => {
    // Calculate item totals
    const itemSubtotal = formData.items
      .filter((item) => item.product_id)
      .reduce((total, item) => {
        const qty = parseFloat(item.quantity) || 0;
        const rt = parseFloat(item.rate) || 0;
        return total + (qty * rt);
      }, 0);

    const itemDiscount = formData.items
      .filter((item) => item.product_id)
      .reduce((total, item) => {
        return total + (parseFloat(item.discount) || 0);
      }, 0);

    const itemTax = formData.items
      .filter((item) => item.product_id)
      .reduce((total, item) => {
        return total + (parseFloat(item.tax) || 0);
      }, 0);

    const itemTotal = itemSubtotal - itemDiscount + itemTax;

    // Calculate additional charges/discounts
    const shippingCost = parseFloat(formData.shipping_cost) || 0;
    const additionalDiscount = parseFloat(formData.discount) || 0;
    const vatAmount = (itemTotal * (parseFloat(formData.vat) || 0)) / 100;

    const subtotal = itemTotal;
    const grandTotal = itemTotal + shippingCost - additionalDiscount + vatAmount;

    setFormData((prev) => ({
      ...prev,
      subtotal: subtotal,
      total_amount: itemTotal,
      grand_total: grandTotal > 0 ? grandTotal : 0,
    }));
  };

  // Handle search input
  const handleSearch = (query) => {
    setSearchQuery(query);

    if (query.trim() === "") {
      setSearchResults([]);
      setShowSearchResults(false);
      return;
    }

    // Filter out items that are already selected
    const selectedProductIds = formData.items
      .filter((item) => item.product_id)
      .map((item) => item.product_id);

    const results = items.filter(
      (item) =>
        ((item.product_name && item.product_name.toLowerCase().includes(query.toLowerCase())) ||
         (item.product_code && item.product_code.toLowerCase().includes(query.toLowerCase())) ||
         (item.name && item.name.toLowerCase().includes(query.toLowerCase())) ||
         (item.code && item.code.toLowerCase().includes(query.toLowerCase()))) &&
        !selectedProductIds.includes(item._id)
    );

    setSearchResults(results);
    setShowSearchResults(true);
  };

  // Handle product selection from search results
  const handleProductSelect = (product) => {
    // Find the first empty item slot or add a new one
    let itemIndex = formData.items.findIndex((item) => !item.product_id);

    if (itemIndex === -1) {
      // Add new item row
      itemIndex = formData.items.length;
      setFormData((prev) => ({
        ...prev,
        items: [
          ...prev.items,
          {
            product_id: "",
            quantity: "",
            unit_id: "",
            rate: "",
            discount: 0,
            tax: 0,
            total: 0,
            product_name: "",
            product_code: "",
          },
        ],
      }));
    }

    // Update the item with data from the selected product
    const updatedItems = [...formData.items];
    updatedItems[itemIndex] = {
      ...updatedItems[itemIndex],
      product_id: product._id,
      product_code: product.product_code || product.code || "",
      product_name: product.product_name || product.name || "",
      rate: product.selling_price || product.price || 0,
      unit_id: product.unit_id || "",
      quantity: "",
      discount: 0,
      tax: 0,
      total: 0,
    };

    setFormData((prev) => ({
      ...prev,
      items: updatedItems,
    }));

    setSearchQuery("");
    setShowSearchResults(false);
    setSearchResults([]);
  };

  const handleQuantityChange = (index, value) => {
    const item = formData.items[index];
    const rate = parseFloat(item.rate) || 0;
    const discount = parseFloat(item.discount) || 0;
    const tax = parseFloat(item.tax) || 0;

    const updatedItems = [...formData.items];
    updatedItems[index] = {
      ...item,
      quantity: value,
      total: calculateItemTotal(value, rate, discount, tax),
    };

    setFormData((prev) => ({
      ...prev,
      items: updatedItems,
    }));

    calculateTotals();

    // Clear quantity error if any
    if (errors[`items[${index}].quantity`]) {
      setErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors[`items[${index}].quantity`];
        return newErrors;
      });
    }
  };

  const handleRateChange = (index, value) => {
    const item = formData.items[index];
    const quantity = parseFloat(item.quantity) || 0;
    const discount = parseFloat(item.discount) || 0;
    const tax = parseFloat(item.tax) || 0;

    const updatedItems = [...formData.items];
    updatedItems[index] = {
      ...item,
      rate: value,
      total: calculateItemTotal(quantity, value, discount, tax),
    };

    setFormData((prev) => ({
      ...prev,
      items: updatedItems,
    }));

    calculateTotals();

    // Clear rate error if any
    if (errors[`items[${index}].rate`]) {
      setErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors[`items[${index}].rate`];
        return newErrors;
      });
    }
  };

  const handleItemDiscountChange = (index, value) => {
    const item = formData.items[index];
    const quantity = parseFloat(item.quantity) || 0;
    const rate = parseFloat(item.rate) || 0;
    const tax = parseFloat(item.tax) || 0;

    const updatedItems = [...formData.items];
    updatedItems[index] = {
      ...item,
      discount: value,
      total: calculateItemTotal(quantity, rate, value, tax),
    };

    setFormData((prev) => ({
      ...prev,
      items: updatedItems,
    }));

    calculateTotals();
  };

  const handleItemTaxChange = (index, value) => {
    const item = formData.items[index];
    const quantity = parseFloat(item.quantity) || 0;
    const rate = parseFloat(item.rate) || 0;
    const discount = parseFloat(item.discount) || 0;

    const updatedItems = [...formData.items];
    updatedItems[index] = {
      ...item,
      tax: value,
      total: calculateItemTotal(quantity, rate, discount, value),
    };

    setFormData((prev) => ({
      ...prev,
      items: updatedItems,
    }));

    calculateTotals();
  };

  const handleUnitChange = (index, unitId) => {
    const updatedItems = [...formData.items];
    updatedItems[index] = {
      ...updatedItems[index],
      unit_id: unitId,
    };

    setFormData((prev) => ({
      ...prev,
      items: updatedItems,
    }));

    // Clear unit error if any
    if (errors[`items[${index}].unit_id`]) {
      setErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors[`items[${index}].unit_id`];
        return newErrors;
      });
    }
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

    // Recalculate totals for numeric fields
    if (
      name === "shipping_cost" ||
      name === "discount" ||
      name === "vat"
    ) {
      setTimeout(() => calculateTotals(), 0);
    }
  };

  // Remove item row
  const removeItem = (index) => {
    if (formData.items.length > 1) {
      const updatedItems = formData.items.filter((_, i) => i !== index);
      setFormData((prev) => ({
        ...prev,
        items: updatedItems,
      }));

      calculateTotals();
    }
  };

  // Clear item data
  const clearItem = (index) => {
    const updatedItems = [...formData.items];
    updatedItems[index] = {
      product_id: "",
      quantity: "",
      unit_id: "",
      rate: "",
      discount: 0,
      tax: 0,
      total: 0,
      product_name: "",
      product_code: "",
    };

    setFormData((prev) => ({
      ...prev,
      items: updatedItems,
    }));

    calculateTotals();
  };

  // Add new empty item row
  const addNewItemRow = () => {
    setFormData((prev) => ({
      ...prev,
      items: [
        ...prev.items,
        {
          product_id: "",
          quantity: "",
          unit_id: "",
          rate: "",
          discount: 0,
          tax: 0,
          total: 0,
          product_name: "",
          product_code: "",
        },
      ],
    }));
  };

  useEffect(() => {
    calculateTotals();
  }, [formData.items, formData.shipping_cost, formData.discount, formData.vat]);

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

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    const payload = {
      customer_id: formData.customer_id,
      sale_date: formData.sale_date,
      reference_no: formData.reference_no,
      items: formData.items
        .filter((item) => item.product_id)
        .map((item) => ({
          product_id: item.product_id,
          quantity: parseFloat(item.quantity) || 0,
          unit_id: item.unit_id,
          rate: parseFloat(item.rate) || 0,
          discount: parseFloat(item.discount) || 0,
          tax: parseFloat(item.tax) || 0,
          total: parseFloat(item.total) || 0,
          product_name: item.product_name,
          product_code: item.product_code,
        })),
      sale_note: formData.sale_note,
      shipping_cost: parseFloat(formData.shipping_cost) || 0,
      discount: parseFloat(formData.discount) || 0,
      vat: parseFloat(formData.vat) || 0,
      subtotal: parseFloat(formData.subtotal) || 0,
      total_amount: parseFloat(formData.total_amount) || 0,
      grand_total: parseFloat(formData.grand_total) || 0,
      branch_id: formData.branch_id,
      status: formData.status,
      payment_status: formData.payment_status,
    };

    console.log("Updating sale data:", payload);
    onSave(payload);
  };

  const handleClose = () => {
    onClose();
  };

  const isDisabled =
    loading ||
    loadingCustomers ||
    loadingItems ||
    loadingUnits ||
    loadingBranches;

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
            <h5 className="modal-title fw-bold fs-5">Edit Sale</h5>
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
              {/* Similar to AddSaleForm but with existing data */}
              {/* Copy the form structure from AddSaleForm here */}
              {/* Make sure to use formData values for all fields */}
              
              {/* Example of one section - you need to copy all sections */}
              <div className="row mb-4">
                <div className="col-md-3 mb-3">
                  <label className="form-label fw-medium">
                    Sale Date <span className="text-danger">*</span>
                  </label>
                  <input
                    type="date"
                    name="sale_date"
                    className={`form-control ${
                      errors.sale_date ? "is-invalid" : ""
                    }`}
                    value={formData.sale_date}
                    onChange={handleChange}
                    disabled={isDisabled}
                  />
                  {errors.sale_date && (
                    <div className="invalid-feedback">{errors.sale_date}</div>
                  )}
                </div>
                {/* ... rest of the fields similar to AddSaleForm */}
              </div>

              {/* Include all other sections from AddSaleForm */}
              {/* Make sure to handle existing data properly */}
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
                    Updating Sale...
                  </>
                ) : (
                  <>
                    <FiUpload size={16} />
                    Update Sale
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

export default EditSaleForm;