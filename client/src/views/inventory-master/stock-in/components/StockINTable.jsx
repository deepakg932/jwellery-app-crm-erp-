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
  FiPackage,
  FiRefreshCw,
  FiFilter,
} from "react-icons/fi";
import { RiDeleteBin6Line } from "react-icons/ri";
import AddStockINForm from "./AddStockINForm";
import EditStockINForm from "./EditStockINForm";
import ViewStockINPage from "./ViewStockINPage";
import useStockIn from "@/hooks/useStockIn";

const StockINTable = () => {
  const { grns, loading, error, addGRN, updateGRN, deleteGRN, fetchGRNs } =
    useStockIn();

  const [search, setSearch] = useState("");
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showViewModal, setShowViewModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null);
  const [actionLoading, setActionLoading] = useState({ type: null, id: null });

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);

  // Filter state
  const [filters, setFilters] = useState({
    dateFrom: "",
    dateTo: "",
    supplier: "",
    branch: "",
    status: "",
  });

  // Filter GRNs based on search and filters
  const filteredGRNs = grns.filter((grn) => {
    const matchesSearch =
      grn.grn_number?.toLowerCase().includes(search.toLowerCase()) ||
      grn.supplier?.name?.toLowerCase().includes(search.toLowerCase()) ||
      grn.branch?.name?.toLowerCase().includes(search.toLowerCase()) ||
      grn.po_reference?.order_number
        ?.toLowerCase()
        .includes(search.toLowerCase());

    const matchesFilters =
      (!filters.dateFrom ||
        new Date(grn.grn_date) >= new Date(filters.dateFrom)) &&
      (!filters.dateTo || new Date(grn.grn_date) <= new Date(filters.dateTo)) &&
      (!filters.supplier || grn.supplier_id === filters.supplier) &&
      (!filters.branch || grn.branch_id === filters.branch) &&
      (!filters.status || grn.status === filters.status);

    return matchesSearch && matchesFilters;
  });

  // Reset to first page when search changes
  useEffect(() => {
    setCurrentPage(1);
  }, [search, filters]);

  // Calculate pagination
  const totalItems = filteredGRNs.length;
  const totalPages = Math.ceil(totalItems / itemsPerPage);

  // Get current items for the page
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentGRNs = filteredGRNs.slice(indexOfFirstItem, indexOfLastItem);

  // Add new GRN
  const handleAddGRN = async (grnData) => {
    setActionLoading({ type: "add", id: null });
    try {
      await addGRN(grnData);
      setShowAddModal(false);
    } catch (error) {
      console.error("Add failed:", error);
    } finally {
      setActionLoading({ type: null, id: null });
    }
  };

  // Edit GRN
  const handleEditGRN = async (updatedGRN) => {
    if (!selectedItem) return;

    setActionLoading({ type: "update", id: selectedItem._id });
    try {
      await updateGRN(selectedItem._id, updatedGRN);
      setShowEditModal(false);
      setSelectedItem(null);
    } catch (error) {
      console.error("Update failed:", error);
    } finally {
      setActionLoading({ type: null, id: null });
    }
  };

  // Delete GRN
  const handleDeleteGRN = async () => {
    if (!selectedItem) return;

    setActionLoading({ type: "delete", id: selectedItem._id });
    try {
      await deleteGRN(selectedItem._id);
      setShowDeleteModal(false);
      setSelectedItem(null);
    } catch (error) {
      console.error("Delete failed:", error);
    } finally {
      setActionLoading({ type: null, id: null });
    }
  };

  // Open view modal
  const handleOpenView = (grn) => {
    setSelectedItem(grn);
    setShowViewModal(true);
  };

  // Open edit modal
  const handleOpenEdit = (grn) => {
    setSelectedItem(grn);
    setShowEditModal(true);
  };

  // Open delete modal
  const handleOpenDelete = (grn) => {
    setSelectedItem(grn);
    setShowDeleteModal(true);
  };

  // Handle refresh
  const handleRefresh = () => {
    fetchGRNs();
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
    const qtySum = items.reduce(
      (sum, item) => sum + (parseFloat(item.received_qty) || 0),
      0
    );
    const weightSum = items.reduce(
      (sum, item) => sum + (parseFloat(item.received_weight) || 0),
      0
    );

    let details = `${itemCount} item${itemCount > 1 ? "s" : ""}`;
    if (qtySum > 0) details += `, ${qtySum} qty`;
    if (weightSum > 0) details += `, ${weightSum} wt`;

    return details;
  };

  // Get item names
  const getItemNames = (items) => {
    if (!items || items.length === 0) return "No items";

    const names = items.map((item) => {
      return (
        item.inventory_item_id?.item_name ||
        item.inventory_item_id?.name ||
        item.inventory_item?.name ||
        "Unknown Item"
      );
    });

    if (names.length <= 2) {
      return names.join(", ");
    } else {
      return `${names[0]}, ${names[1]} +${names.length - 2} more`;
    }
  };

  // Get unique suppliers for filter
  const uniqueSuppliers = [...new Set(grns.map((grn) => grn.supplier_id))];
  const uniqueBranches = [...new Set(grns.map((grn) => grn.branch_id))];
  const uniqueStatuses = [...new Set(grns.map((grn) => grn.status))];

  // Delete Confirmation Modal
  const DeleteConfirmationModal = () => (
    <div
      className="modal fade show d-block"
      style={{ backgroundColor: "rgba(0,0,0,0.5)" }}
      tabIndex="-1"
    >
      <div className="modal-dialog modal-dialog-centered">
        <div className="modal-content rounded-3">
          <div className="modal-header border-bottom pb-3">
            <h5 className="modal-title fw-bold fs-5">
              Delete Goods Receipt Note
            </h5>
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
              Are you sure you want to delete GRN{" "}
              <strong>{selectedItem?.grn_number}</strong>?
            </p>
            <p className="text-muted small">
              This action cannot be undone and will remove all associated item
              records.
            </p>
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
              onClick={handleDeleteGRN}
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
                "Delete GRN"
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );

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
              <h1 className="h3 fw-bold mb-2">Goods Receipt Notes (GRN)</h1>
              <p className="text-muted mb-0">
                Manage your stock in records and goods receipts
              </p>
            </div>

            <div className="col-md-6 d-flex justify-content-end gap-2">
              <button
                className="btn btn-outline-secondary d-flex align-items-center gap-2"
                onClick={handleRefresh}
                disabled={loading}
              >
                <FiRefreshCw size={18} />
                Refresh
              </button>
              <button
                className="btn btn-primary d-flex align-items-center gap-2"
                onClick={() => setShowAddModal(true)}
                disabled={loading || actionLoading.type === "add"}
              >
                <FiPlus size={18} />
                New GRN
              </button>
            </div>
          </div>

          {/* SEARCH AND FILTERS */}
          <div className="row g-3">
            <div className="col-md-4">
              <div className="input-group">
                <span className="input-group-text bg-transparent border-end-0">
                  <FiSearch className="text-muted" />
                </span>
                <input
                  type="text"
                  className="form-control border-start-0"
                  placeholder="Search by GRN, supplier, branch, or PO..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  disabled={loading}
                />
              </div>
            </div>

            {/* Advanced Filters */}
            <div className="col-md-8">
              <div className="row g-2">
                <div className="col">
                  <input
                    type="date"
                    className="form-control form-control-sm"
                    placeholder="From Date"
                    value={filters.dateFrom}
                    onChange={(e) =>
                      setFilters({ ...filters, dateFrom: e.target.value })
                    }
                    disabled={loading}
                  />
                </div>
                <div className="col">
                  <input
                    type="date"
                    className="form-control form-control-sm"
                    placeholder="To Date"
                    value={filters.dateTo}
                    onChange={(e) =>
                      setFilters({ ...filters, dateTo: e.target.value })
                    }
                    disabled={loading}
                  />
                </div>
                <div className="col">
                  <select
                    className="form-select form-select-sm"
                    value={filters.supplier}
                    onChange={(e) =>
                      setFilters({ ...filters, supplier: e.target.value })
                    }
                    disabled={loading}
                  >
                    <option value="">All Suppliers</option>
                    {uniqueSuppliers.map((supplierId, index) => {
                      const supplier = grns.find(
                        (g) => g.supplier_id === supplierId
                      )?.supplier;
                      return (
                        <option key={index} value={supplierId}>
                          {supplier?.name ||
                            supplier?.supplier_name ||
                            `Supplier ${index + 1}`}
                        </option>
                      );
                    })}
                  </select>
                </div>
                <div className="col">
                  <select
                    className="form-select form-select-sm"
                    value={filters.status}
                    onChange={(e) =>
                      setFilters({ ...filters, status: e.target.value })
                    }
                    disabled={loading}
                  >
                    <option value="">All Status</option>
                    {uniqueStatuses.map((status, index) => (
                      <option key={index} value={status}>
                        {status.charAt(0).toUpperCase() + status.slice(1)}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </div>

            {/* Items per page selector */}
            <div className="col-md-4 mt-2">
              <div className="d-flex align-items-center">
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
                <th>GRN Number</th>
                <th>Supplier</th>
                <th>Branch</th>
                <th>PO Reference</th>
                <th>GRN Date</th>
                <th>Items</th>
                <th>Total Cost</th>
                <th>Status</th>
                <th className="text-end">Actions</th>
              </tr>
            </thead>

            <tbody>
              {loading && grns.length === 0 ? (
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
              ) : filteredGRNs.length === 0 ? (
                <tr>
                  <td colSpan="10" className="text-center py-4 text-muted">
                    {search || Object.values(filters).some((f) => f)
                      ? "No GRNs found for your search criteria"
                      : "No GRNs available"}
                  </td>
                </tr>
              ) : (
                currentGRNs.map((grn, index) => (
                  <tr key={grn._id || index}>
                    <td>{indexOfFirstItem + index + 1}</td>

                    <td className="fw-semibold">
                      <span className="badge bg-info text-dark">
                        {grn.grn_number || "GRN-N/A"}
                      </span>
                    </td>

                    <td>
                      <div className="fw-medium">
                        {grn.supplier?.name ||
                          grn.supplier?.supplier_name ||
                          "N/A"}
                      </div>
                      <div className="text-muted small">
                        {grn.supplier?.phone || ""}
                      </div>
                    </td>

                    <td>
                      <div className="fw-medium">
                        {grn.branch?.name || grn.branch?.branch_name || "N/A"}
                      </div>
                      <div className="text-muted small">
                        {grn.branch?.address || ""}
                      </div>
                    </td>

                    <td>
                      {grn.po_reference?.po_number ? (
                        <div>
                          <span className="badge bg-light text-dark mb-1">
                            {grn.po_reference.po_number}
                          </span>
                        </div>
                      ) : (
                        <span className="text-muted">Direct Stock</span>
                      )}
                    </td>

                    <td>
                      <span className="badge bg-light text-dark">
                        <FiCalendar className="me-1" size={12} />
                        {formatDate(grn.grn_date)}
                      </span>
                    </td>

                    <td>
                      <div className="small">
                        <div className="fw-medium">
                          {getItemNames(grn.items)}
                        </div>
                        <div className="text-muted">
                          {getItemDetails(grn.items)}
                        </div>
                      </div>
                    </td>

                    <td>
                      <span className="fw-bold text-success">
                        ₹
                        {(grn.total_cost || 0).toLocaleString("en-IN", {
                          minimumFractionDigits: 2,
                        })}
                      </span>
                    </td>

                    <td>
                      <span
                        className={`badge fw-semibold ${
                          grn.status === "completed"
                            ? "bg-success"
                            : grn.status === "draft"
                            ? "bg-secondary"
                            : grn.status === "pending"
                            ? "bg-warning"
                            : grn.status === "cancelled"
                            ? "bg-danger"
                            : grn.status === "approved"
                            ? "bg-primary"
                            : grn.status === "received"
                            ? "bg-info"
                            : "bg-secondary"
                        }`}
                      >
                        {grn.status
                          ? grn.status.charAt(0).toUpperCase() +
                            grn.status.slice(1)
                          : "Draft"}
                      </span>
                    </td>

                    {/* ACTION BUTTONS */}
                    <td>
                      <div className="d-flex justify-content-end gap-2">
                        {/* View Button */}
                        <button
                          className="btn btn-sm btn-outline-info d-flex align-items-center gap-1"
                          onClick={() => handleOpenView(grn)}
                          title="View Details"
                        >
                          <FiEye size={14} />
                          View
                        </button>

                        {/* Edit Button */}
                        <button
                          className="btn btn-sm btn-outline-primary d-flex align-items-center gap-1"
                          onClick={() => handleOpenEdit(grn)}
                          disabled={
                            actionLoading.type && actionLoading.id === grn._id
                          }
                          title="Edit"
                        >
                          {actionLoading.type === "update" &&
                          actionLoading.id === grn._id ? (
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
                          onClick={() => handleOpenDelete(grn)}
                          disabled={
                            actionLoading.type && actionLoading.id === grn._id
                          }
                          title="Delete"
                        >
                          {actionLoading.type === "delete" &&
                          actionLoading.id === grn._id ? (
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
                ))
              )}
            </tbody>
          </table>

          {/* PAGINATION */}
          {filteredGRNs.length > 0 && (
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
        <AddStockINForm
          key="add-modal"
          onClose={() => setShowAddModal(false)}
          onSave={handleAddGRN}
          loading={actionLoading.type === "add"}
        />
      )}

      {/* VIEW MODAL */}
      {showViewModal && selectedItem && (
        <ViewStockINPage
          key={`view-modal-${selectedItem._id}`}
          grn={selectedItem}
          onClose={() => {
            setShowViewModal(false);
            setSelectedItem(null);
          }}
        />
      )}

      {/* EDIT MODAL */}
      {showEditModal && selectedItem && (
        <EditStockINForm
          key={`edit-modal-${selectedItem._id}`}
          onClose={() => {
            setShowEditModal(false);
            setSelectedItem(null);
          }}
          onSave={handleEditGRN}
          grn={selectedItem}
          loading={
            actionLoading.type === "update" &&
            actionLoading.id === selectedItem._id
          }
        />
      )}

      {/* DELETE MODAL */}
      {showDeleteModal && selectedItem && (
        <DeleteConfirmationModal key={`delete-modal-${selectedItem._id}`} />
      )}
    </div>
  );
};

export default StockINTable;
