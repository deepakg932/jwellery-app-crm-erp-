import React, { useState, useEffect } from "react";
import {
  FiEdit2,
  FiSearch,
  FiPlus,
  FiChevronLeft,
  FiChevronRight,
  FiChevronsLeft,
  FiChevronsRight,
  FiCalendar,
  FiEye,
} from "react-icons/fi";
import { RiDeleteBin6Line } from "react-icons/ri";
import AddSaleForm from "./AddSaleForm";
import EditSaleForm from "./EditSaleForm";
import ViewSaleModal from "./ViewSaleModal";
import useSales from "@/hooks/useSales";

const SalesTable = () => {
  const {
    sales,
    loading,
    error,
    addSale,
    updateSale,
    deleteSale,
    fetchSales,
  } = useSales();

  const [search, setSearch] = useState("");
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showViewModal, setShowViewModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedItem, setSelectedItem] = useState([]);
  const [actionLoading, setActionLoading] = useState({ type: null, id: null });

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);

  // Filter sales based on search
  const filteredSales = sales.filter(
    (sale) =>
      sale.sale_number?.toLowerCase().includes(search.toLowerCase()) ||
      sale.reference_no?.toLowerCase().includes(search.toLowerCase()) ||
      sale.customer_id?.name?.toLowerCase().includes(search.toLowerCase()) ||
      sale.customer_id?.customer_name?.toLowerCase().includes(search.toLowerCase()) ||
      sale.status?.toLowerCase().includes(search.toLowerCase()) ||
      sale.items?.some(
        (item) =>
          item.product?.name?.toLowerCase().includes(search.toLowerCase()) ||
          item.item_name?.toLowerCase().includes(search.toLowerCase())
      )
  );

  // Reset to first page when search changes
  useEffect(() => {
    setCurrentPage(1);
  }, [search]);

  // Calculate pagination
  const totalItems = filteredSales.length;
  const totalPages = Math.ceil(totalItems / itemsPerPage);

  // Get current items for the page
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentSales = filteredSales.slice(
    indexOfFirstItem,
    indexOfLastItem
  );

  // Calculate totals for each sale
  const calculateTotal = (items) => {
    if (!items) return 0;
    return items.reduce((total, item) => {
      const quantity = parseFloat(item.quantity) || 0;
      const rate = parseFloat(item.rate) || 0;
      const discount = parseFloat(item.discount) || 0;
      const tax = parseFloat(item.tax) || 0;
      
      const subtotal = quantity * rate;
      const itemTotal = subtotal - discount + tax;
      
      return total + itemTotal;
    }, 0);
  };

  // Add new sale
  const handleAddSale = async (saleData) => {
    setActionLoading({ type: "add", id: null });
    try {
      await addSale(saleData);
      setShowAddModal(false);
    } catch (error) {
      console.error("Add failed:", error);
    } finally {
      setActionLoading({ type: null, id: null });
    }
  };

  // Edit sale
  const handleEditSale = async (updatedSale) => {
    if (!selectedItem) return;

    setActionLoading({ type: "update", id: selectedItem?._id });
    try {
      await updateSale(selectedItem._id, updatedSale);
      setShowEditModal(false);
      setSelectedItem(null);
    } catch (error) {
      console.error("Update failed:", error);
    } finally {
      setActionLoading({ type: null, id: null });
    }
  };

  // Delete sale
  const handleDeleteSale = async () => {
    if (!selectedItem) return;

    setActionLoading({ type: "delete", id: selectedItem._id });
    try {
      await deleteSale(selectedItem._id);
      setShowDeleteModal(false);
      setSelectedItem(null);
    } catch (error) {
      console.error("Delete failed:", error);
    } finally {
      setActionLoading({ type: null, id: null });
    }
  };

  // Open view modal
  const handleOpenView = (sale) => {
    setSelectedItem(sale);
    setShowViewModal(true);
  };

  // Open edit modal
  const handleOpenEdit = (sale) => {
    setSelectedItem(sale);
    setShowEditModal(true);
  };

  // Open delete modal
  const handleOpenDelete = (sale) => {
    setSelectedItem(sale);
    setShowDeleteModal(true);
  };

  // Handle refresh
  const handleRefresh = () => {
    fetchSales();
  };

  // Pagination handlers
  const goToPage = (pageNumber) => {
    if (pageNumber >= 1 && pageNumber <= totalPages) {
      setCurrentPage(pageNumber);
    }
  };

  const goToFirstPage = () => goToPage(1);
  const goToLastPage = () => goToPage(totalPages);
  const goToNextPage = () => goToPage(currentPage + 1);
  const goToPrevPage = () => goToPage(currentPage - 1);

  // Generate page numbers to show
  const getPageNumbers = () => {
    const pageNumbers = [];
    const maxPagesToShow = 5;

    if (totalPages <= maxPagesToShow) {
      for (let i = 1; i <= totalPages; i++) {
        pageNumbers.push(i);
      }
    } else {
      let startPage = Math.max(1, currentPage - 2);
      let endPage = Math.min(totalPages, currentPage + 2);

      if (currentPage <= 3) {
        endPage = maxPagesToShow;
      } else if (currentPage >= totalPages - 2) {
        startPage = totalPages - maxPagesToShow + 1;
      }

      for (let i = startPage; i <= endPage; i++) {
        pageNumbers.push(i);
      }
    }

    return pageNumbers;
  };

  // Format date
  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  // Get item count with details
  const getItemDetails = (items) => {
    if (!items || items.length === 0) return "0 items";

    const itemCount = items.length;
    const quantitySum = items.reduce(
      (sum, item) => sum + (parseFloat(item.quantity) || 0),
      0
    );

    let details = `${itemCount} item${itemCount > 1 ? "s" : ""}`;
    if (quantitySum > 0) details += `, ${quantitySum} qty`;

    return details;
  };

  // Get item names
  const getItemNames = (items) => {
    if (!items || items.length === 0) return "No items";

    const names = items.map((item) => {
      return (
        item.product?.name ||
        item.item_name ||
        item.product_id?.name ||
        "Unknown Item"
      );
    });

    if (names.length <= 2) {
      return names.join(", ");
    } else {
      return `${names[0]}, ${names[1]} +${names.length - 2} more`;
    }
  };

  // Get customer name
  const getCustomerName = (customer) => {
    if (!customer) return "N/A";
    return customer.name || customer.customer_name || "Unknown Customer";
  };

  // Delete Confirmation Modal
  const DeleteConfirmationModal = () => {
    if (!showDeleteModal || !selectedItem) return null;

    return (
      <div
        className="modal fade show d-block"
        style={{ backgroundColor: "rgba(0,0,0,0.5)" }}
        tabIndex="-1"
      >
        <div className="modal-dialog modal-dialog-centered">
          <div className="modal-content rounded-3">
            <div className="modal-header border-bottom pb-3">
              <h5 className="modal-title fw-bold fs-5">Delete Sale</h5>
              <button
                type="button"
                className="btn-close"
                onClick={() => {
                  setShowDeleteModal(false);
                  setSelectedItem(null);
                }}
                disabled={actionLoading.type === "delete"}
                aria-label="Close"
              ></button>
            </div>

            <div className="modal-body">
              <p>
                Are you sure you want to delete Sale{" "}
                <strong>{selectedItem?.sale_number}</strong>?
              </p>
              <p className="text-muted small">This action cannot be undone.</p>
            </div>

            <div className="modal-footer border-top pt-3">
              <button
                type="button"
                className="btn btn-outline-secondary"
                onClick={() => {
                  setShowDeleteModal(false);
                  setSelectedItem(null);
                }}
                disabled={actionLoading.type === "delete"}
              >
                Cancel
              </button>
              <button
                type="button"
                className="btn btn-danger"
                onClick={handleDeleteSale}
                disabled={actionLoading.type === "delete"}
              >
                {actionLoading.type === "delete" ? (
                  <>
                    <span
                      className="spinner-border spinner-border-sm me-2"
                      role="status"
                      aria-hidden="true"
                    ></span>
                    Deleting...
                  </>
                ) : (
                  "Delete"
                )}
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="container-fluid py-4">
      {/* Error Display */}
      {error && (
        <div
          className="alert alert-danger alert-dismissible fade show mb-4"
          role="alert"
        >
          {error}
          <button type="button" className="btn-close" onClick={() => {}} />
        </div>
      )}

      {/* HEADER */}
      <div className="card border-0 shadow-sm mb-4">
        <div className="card-body">
          <div className="row align-items-center mb-4">
            <div className="col-md-6">
              <h1 className="h3 fw-bold mb-2">Sales</h1>
              <p className="text-muted mb-0">
                Manage your sales in a table layout
              </p>
            </div>

            <div className="col-md-6 d-flex justify-content-end gap-2">
              <button
                className="btn btn-outline-secondary d-flex align-items-center gap-2"
                onClick={handleRefresh}
                disabled={loading}
              >
                Refresh
              </button>
              <button
                className="btn btn-primary d-flex align-items-center gap-2"
                onClick={() => setShowAddModal(true)}
                disabled={loading || actionLoading.type === "add"}
              >
                <FiPlus size={18} />
                New Sale
              </button>
            </div>
          </div>

          {/* SEARCH AND FILTERS */}
          <div className="row align-items-center">
            <div className="col-md-4">
              <div className="input-group">
                <span className="input-group-text bg-transparent border-end-0">
                  <FiSearch className="text-muted" />
                </span>
                <input
                  type="text"
                  className="form-control border-start-0"
                  placeholder="Search by Sale number, reference, customer, or item..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  disabled={loading}
                />
              </div>
            </div>

            {/* Items per page selector */}
            <div className="col-md-3 ms-auto">
              <div className="d-flex align-items-center justify-content-end">
                <label className="me-2 text-muted small">Show:</label>
                <select
                  className="form-select form-select-sm w-auto"
                  value={itemsPerPage}
                  onChange={(e) => {
                    setItemsPerPage(Number(e.target.value));
                    setCurrentPage(1);
                  }}
                  disabled={loading}
                >
                  <option value="5">5</option>
                  <option value="10">10</option>
                  <option value="20">20</option>
                  <option value="50">50</option>
                </select>
                <span className="ms-2 text-muted small">entries</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* TABLE */}
      <div className="card border-0 shadow-sm">
        <div className="card-body table-responsive">
          <table className="table align-middle">
            <thead>
              <tr>
                <th>#</th>
                <th>Sale Number</th>
                <th>Customer</th>
                <th>Sale Date</th>
                <th>Reference No</th>
                <th>Items</th>
                <th>Total Amount</th>
                <th>Status</th>
                <th>Payment Status</th>
                <th className="text-end">Actions</th>
              </tr>
            </thead>

            <tbody>
              {loading && sales.length === 0 ? (
                <tr>
                  <td colSpan="10" className="text-center py-4">
                    <div className="d-flex justify-content-center">
                      <div
                        className="spinner-border text-primary"
                        role="status"
                      >
                        <span className="visually-hidden">Loading...</span>
                      </div>
                    </div>
                  </td>
                </tr>
              ) : filteredSales.length === 0 ? (
                <tr>
                  <td colSpan="10" className="text-center py-4 text-muted">
                    {search
                      ? "No sales found for your search"
                      : "No sales available"}
                  </td>
                </tr>
              ) : (
                currentSales.map((sale, index) => {
                  const total = sale.grand_total || calculateTotal(sale.items);
                  return (
                    <tr key={sale._id || index}>
                      <td>{indexOfFirstItem + index + 1}</td>

                      <td className="fw-semibold">
                        {sale.sale_number || "SALE-N/A"}
                      </td>

                      <td>
                        <div className="fw-medium">
                          {getCustomerName(sale.customer_id)}
                        </div>
                        <div className="text-muted small">
                          {sale.customer_id?.phone || ""}
                          {sale.customer_id?.customer_code
                            ? ` (${sale.customer_id.customer_code})`
                            : ""}
                        </div>
                      </td>

                      <td>
                        <span className="badge bg-light text-dark">
                          <FiCalendar className="me-1" size={12} />
                          {formatDate(sale.sale_date)}
                        </span>
                      </td>

                      <td>
                        <span className="fw-medium">
                          {sale.reference_no || "N/A"}
                        </span>
                      </td>

                      <td>
                        <div className="small">
                          <div className="fw-medium">
                            {getItemNames(sale.items)}
                          </div>
                          <div className="text-muted">
                            {getItemDetails(sale.items)}
                          </div>
                        </div>
                      </td>

                      <td>
                        <span className="fw-bold">
                          ₹{total.toLocaleString("en-IN")}
                        </span>
                      </td>

                      <td>
                        <span
                          className={`badge fw-semibold ${
                            sale.status === "completed"
                              ? "bg-success"
                              : sale.status === "draft"
                              ? "bg-secondary"
                              : sale.status === "pending"
                              ? "bg-warning"
                              : sale.status === "cancelled"
                              ? "bg-danger"
                              : sale.status === "approved"
                              ? "bg-primary"
                              : sale.status === "shipped"
                              ? "bg-info"
                              : "bg-secondary"
                          }`}
                        >
                          {sale.status
                            ? sale.status.charAt(0).toUpperCase() +
                              sale.status.slice(1)
                            : "Draft"}
                        </span>
                      </td>

                      <td>
                        <span
                          className={`badge fw-semibold ${
                            sale.payment_status === "paid"
                              ? "bg-success"
                              : sale.payment_status === "pending"
                              ? "bg-warning"
                              : sale.payment_status === "partial"
                              ? "bg-info"
                              : "bg-secondary"
                          }`}
                        >
                          {sale.payment_status
                            ? sale.payment_status.charAt(0).toUpperCase() +
                              sale.payment_status.slice(1)
                            : "Pending"}
                        </span>
                      </td>

                      {/* ACTION BUTTONS */}
                      <td>
                        <div className="d-flex justify-content-end gap-2">
                          {/* View Button */}
                          <button
                            className="btn btn-sm btn-outline-info d-flex align-items-center gap-1"
                            onClick={() => handleOpenView(sale)}
                            title="View Details"
                          >
                            <FiEye size={14} />
                            View
                          </button>

                          {/* Edit Button */}
                          <button
                            className="btn btn-sm btn-outline-primary d-flex align-items-center gap-1"
                            onClick={() => handleOpenEdit(sale)}
                            disabled={
                              actionLoading.type && actionLoading.id === sale._id
                            }
                            title="Edit"
                          >
                            {actionLoading.type === "update" &&
                            actionLoading.id === sale._id ? (
                              <>
                                <span
                                  className="spinner-border spinner-border-sm me-1"
                                  role="status"
                                  aria-hidden="true"
                                ></span>
                                Editing...
                              </>
                            ) : (
                              <>
                                <FiEdit2 size={14} />
                                Edit
                              </>
                            )}
                          </button>

                          {/* Delete Button */}
                          <button
                            className="btn btn-sm btn-outline-danger d-flex align-items-center gap-1"
                            onClick={() => handleOpenDelete(sale)}
                            disabled={
                              actionLoading.type && actionLoading.id === sale._id
                            }
                            title="Delete"
                          >
                            {actionLoading.type === "delete" &&
                            actionLoading.id === sale._id ? (
                              <>
                                <span
                                  className="spinner-border spinner-border-sm me-1"
                                  role="status"
                                  aria-hidden="true"
                                ></span>
                                Deleting...
                              </>
                            ) : (
                              <>
                                <RiDeleteBin6Line size={14} />
                                Delete
                              </>
                            )}
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>

          {/* PAGINATION */}
          {filteredSales.length > 0 && (
            <div className="d-flex flex-column flex-md-row justify-content-between align-items-center border-top pt-3 mt-3">
              <div className="mb-2 mb-md-0">
                <p className="text-muted mb-0">
                  Showing {indexOfFirstItem + 1} to{" "}
                  {Math.min(indexOfLastItem, totalItems)} of {totalItems}{" "}
                  entries
                </p>
              </div>

              <div className="d-flex align-items-center gap-1">
                {/* First Page */}
                <button
                  className="btn btn-sm btn-outline-secondary"
                  onClick={goToFirstPage}
                  disabled={currentPage === 1 || loading}
                  aria-label="First page"
                >
                  <FiChevronsLeft size={16} />
                </button>

                {/* Previous Page */}
                <button
                  className="btn btn-sm btn-outline-secondary"
                  onClick={goToPrevPage}
                  disabled={currentPage === 1 || loading}
                  aria-label="Previous page"
                >
                  <FiChevronLeft size={16} />
                </button>

                {/* Page Numbers */}
                {getPageNumbers().map((pageNumber) => (
                  <button
                    key={pageNumber}
                    className={`btn btn-sm ${
                      currentPage === pageNumber
                        ? "btn-primary"
                        : "btn-outline-secondary"
                    }`}
                    onClick={() => goToPage(pageNumber)}
                    disabled={loading}
                    aria-label={`Page ${pageNumber}`}
                    aria-current={
                      currentPage === pageNumber ? "page" : undefined
                    }
                  >
                    {pageNumber}
                  </button>
                ))}

                {/* Next Page */}
                <button
                  className="btn btn-sm btn-outline-secondary"
                  onClick={goToNextPage}
                  disabled={currentPage === totalPages || loading}
                  aria-label="Next page"
                >
                  <FiChevronRight size={16} />
                </button>

                {/* Last Page */}
                <button
                  className="btn btn-sm btn-outline-secondary"
                  onClick={goToLastPage}
                  disabled={currentPage === totalPages || loading}
                  aria-label="Last page"
                >
                  <FiChevronsRight size={16} />
                </button>
              </div>

              {/* Page info */}
              <div className="mt-2 mt-md-0">
                <span className="text-muted">
                  Page {currentPage} of {totalPages}
                </span>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* ADD MODAL */}
      {showAddModal && (
        <AddSaleForm
          key="add-modal"
          onClose={() => setShowAddModal(false)}
          onSave={handleAddSale}
          loading={actionLoading.type === "add"}
        />
      )}

      {/* VIEW MODAL */}
      {showViewModal && selectedItem && (
        <ViewSaleModal
          key={`view-modal-${selectedItem._id}`}
          sale={selectedItem}
          onClose={() => {
            setShowViewModal(false);
            setSelectedItem(null);
          }}
        />
      )}

      {/* EDIT MODAL */}
      {showEditModal && selectedItem && (
        <EditSaleForm
          key={`edit-modal-${selectedItem._id}`}
          onClose={() => {
            setShowEditModal(false);
            setSelectedItem(null);
          }}
          onSave={handleEditSale}
          sale={selectedItem}
          loading={
            actionLoading.type === "update" &&
            actionLoading.id === selectedItem._id
          }
        />
      )}

      {/* DELETE MODAL */}
      <DeleteConfirmationModal />
    </div>
  );
};

export default SalesTable;