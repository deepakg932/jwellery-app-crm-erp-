// components/repairs/RepairsTable.jsx
import React, { useState, useEffect } from "react";
import {
  FiEdit2,
  FiSearch,
  FiPlus,
  FiChevronLeft,
  FiChevronRight,
  FiChevronsLeft,
  FiChevronsRight,
  FiEye,
  FiCheckCircle,
  FiPrinter,
  FiDollarSign,
  FiCalendar,
  FiUser,
  FiPackage,
} from "react-icons/fi";
import { RiDeleteBin6Line } from "react-icons/ri";
import { BsTools } from "react-icons/bs";
import AddRepairForm from "./AddRepairForm";
import EditRepairForm from "./EditRepairForm";
import ViewRepairModal from "./ViewRepairModal";
import useRepair from "@/hooks/useRepair";

const RepairsTable = () => {
  const {
    repairs,
    customerGroups,
    customers,
    employees,
    saleItems,
    statusOptions,
    accountOptions,
    loading,
    error,
    addCustomer,
    addRepair,
    updateRepair,
    deleteRepair,
    fetchRepairs,
    fetchCustomers,
  } = useRepair();

  console.log("Repairs data:", repairs);

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [showCustomerModal, setShowCustomerModal] = useState(false);
  const [addingCustomer, setAddingCustomer] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showViewModal, setShowViewModal] = useState(false);
  const [selectedRepair, setSelectedRepair] = useState(null);
  const [actionLoading, setActionLoading] = useState({ type: null, id: null });

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);

  // Status options including "all"
  const allStatusOptions = [
    { value: "all", label: "All Status" },
    ...statusOptions,
  ];

  // Filter repairs
  const filteredRepairs = repairs.filter((repair) => {
    // Search filter
    const matchesSearch =
      search === "" ||
      repair.product_name?.toLowerCase().includes(search.toLowerCase()) ||
      repair.repair_number?.toLowerCase().includes(search.toLowerCase()) ||
      repair.customer_name?.toLowerCase().includes(search.toLowerCase()) ||
      repair.customer_mobile?.includes(search);

    // Status filter
    const matchesStatus =
      statusFilter === "all" || repair.status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  // Reset to first page when search or filter changes
  useEffect(() => {
    setCurrentPage(1);
  }, [search, statusFilter]);

  // Calculate pagination
  const totalItems = filteredRepairs.length;
  const totalPages = Math.ceil(totalItems / itemsPerPage);

  // Get current items for the page
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentRepairs = filteredRepairs.slice(
    indexOfFirstItem,
    indexOfLastItem
  );

  // Format date
  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    const date = new Date(dateString);
    return date.toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  };

  // Format currency
  const formatCurrency = (amount) => {
    return `₹${parseFloat(amount || 0).toLocaleString("en-IN", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })}`;
  };

  // Get status badge
  const getStatusBadge = (status) => {
    const statusConfig = {
      pending: { color: "warning", label: "Pending", icon: "⏳" },
      received: { color: "info", label: "Received", icon: "📥" },
      in_progress: { color: "primary", label: "In Progress", icon: "🔧" },
      ready_for_delivery: {
        color: "success",
        label: "Ready for Delivery",
        icon: "✅",
      },
      delivered: { color: "success", label: "Delivered", icon: "🚚" },
      cancelled: { color: "danger", label: "Cancelled", icon: "❌" },
    };

    const config = statusConfig[status] || {
      color: "secondary",
      label: status,
      icon: "📝",
    };

    return (
      <span className={`badge bg-${config.color} text-white fw-semibold`}>
        {config.icon} {config.label}
      </span>
    );
  };

  // Get account badge
  const getAccountBadge = (account) => {
    const accountConfig = {
      cash: { color: "success", label: "Cash" },
      card: { color: "info", label: "Card" },
      upi: { color: "primary", label: "UPI" },
      bank_transfer: { color: "info", label: "Bank Transfer" },
      credit: { color: "warning", label: "Credit" },
      multiple: { color: "secondary", label: "Multiple" },
    };

    const config = accountConfig[account] || {
      color: "secondary",
      label: account,
    };

    return (
      <span className={`badge bg-${config.color}-subtle text-${config.color}`}>
        {config.label}
      </span>
    );
  };


   const handleAddCustomer = async (customerData) => {
    try {
      setAddingCustomer(true);
      
      // Format customer data for API
      const apiData = {
        ...customerData,
        name: customerData.customer_name?.trim(),
        mobile: customerData.mobile?.trim() || customerData.phone?.trim() || "",
        customer_group_id: customerData.customer_group_id,
        status: customerData.status ? "active" : "inactive",
      };

      console.log("Adding customer from repair form:", apiData);
      
      // Call addCustomer from your hook
      const newCustomer = await addCustomer(apiData);
      
      // Refresh customers list
      if (fetchCustomers) {
        await fetchCustomers();
      }
      
      return newCustomer;
    } catch (error) {
      console.error("Failed to add customer:", error);
      throw error;
    } finally {
      setAddingCustomer(false);
    }
  };

  // Add new repair
  const handleAddRepair = async (repairData) => {
    setActionLoading({ type: "add", id: null });
    try {
      await addRepair(repairData);
      setShowAddModal(false);
    } catch (error) {
      console.error("Add failed:", error);
    } finally {
      setActionLoading({ type: null, id: null });
    }
  };

  // Edit repair
  const handleEditRepair = async (updatedRepair) => {
    if (!selectedRepair) return;

    setActionLoading({ type: "update", id: selectedRepair._id });
    try {
      await updateRepair(selectedRepair._id, updatedRepair);
      setShowEditModal(false);
      setSelectedRepair(null);
    } catch (error) {
      console.error("Update failed:", error);
    } finally {
      setActionLoading({ type: null, id: null });
    }
  };

  // Delete repair
  const handleDeleteRepair = async () => {
    if (!selectedRepair) return;

    setActionLoading({ type: "delete", id: selectedRepair._id });
    try {
      await deleteRepair(selectedRepair._id);
      setShowDeleteModal(false);
      setSelectedRepair(null);
    } catch (error) {
      console.error("Delete failed:", error);
    } finally {
      setActionLoading({ type: null, id: null });
    }
  };

  // Open edit modal
  const handleOpenEdit = (repair) => {
    if (repair.status === "delivered" || repair.status === "cancelled") {
      alert("Cannot edit a delivered or cancelled repair");
      return;
    }
    setSelectedRepair(repair);
    setShowEditModal(true);
  };

  // Open view modal
  const handleOpenView = (repair) => {
    setSelectedRepair(repair);
    setShowViewModal(true);
  };

  // Open delete modal
  const handleOpenDelete = (repair) => {
    setSelectedRepair(repair);
    setShowDeleteModal(true);
  };

  // Handle refresh
  const handleRefresh = () => {
    fetchRepairs();
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
            <h5 className="modal-title fw-bold fs-5">Delete Repair</h5>
            <button
              type="button"
              className="btn-close"
              onClick={() => {
                setShowDeleteModal(false);
                setSelectedRepair(null);
              }}
              disabled={actionLoading.type === "delete"}
              aria-label="Close"
            ></button>
          </div>

          <div className="modal-body">
            <p>
              Are you sure you want to delete repair{" "}
              <strong>{selectedRepair?.repair_number}</strong>?
            </p>
            <p className="text-muted small">
              Product: <strong>{selectedRepair?.product_name || "N/A"}</strong>
              <br />
              Customer:{" "}
              <strong>{selectedRepair?.customer_name || "N/A"}</strong>
              <br />
              Status: <strong>{selectedRepair?.status}</strong>
            </p>
            <p className="text-muted small">This action cannot be undone.</p>
          </div>

          <div className="modal-footer border-top pt-3">
            <button
              type="button"
              className="btn btn-outline-secondary"
              onClick={() => {
                setShowDeleteModal(false);
                setSelectedRepair(null);
              }}
              disabled={actionLoading.type === "delete"}
            >
              Cancel
            </button>
            <button
              type="button"
              className="btn btn-danger"
              onClick={handleDeleteRepair}
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
              <h1 className="h3 fw-bold mb-2">
                <BsTools className="me-2" />
                Repair Management
              </h1>
              <p className="text-muted mb-0">
                Manage product repairs and track repair status
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
                New Repair
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
                  placeholder="Search by repair #, product, customer..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  disabled={loading}
                />
              </div>
            </div>

            <div className="col-md-3">
              <select
                className="form-select"
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                disabled={loading}
              >
                {allStatusOptions.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
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
                <th>Repair #</th>
                <th>Product</th>
                <th>Customer</th>
                <th>Problem</th>
                <th>Receiving Date</th>
                <th>Delivery Date</th>
                <th>Status</th>
                <th className="text-end">Repair Charge</th>
                <th className="text-end">Paid</th>
                <th className="text-end">Due</th>
                <th className="text-end">Actions</th>
              </tr>
            </thead>

            <tbody>
              {loading && repairs.length === 0 ? (
                <tr>
                  <td colSpan="12" className="text-center py-4">
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
              ) : filteredRepairs.length === 0 ? (
                <tr>
                  <td colSpan="12" className="text-center py-4 text-muted">
                    {search || statusFilter !== "all"
                      ? "No repairs found for your search criteria"
                      : "No repairs available"}
                  </td>
                </tr>
              ) : (
                currentRepairs.map((repair, index) => (
                  <tr
                    key={repair._id || index}
                    className={
                      repair.status === "delivered"
                        ? "table-success"
                        : repair.status === "cancelled"
                        ? "table-danger"
                        : repair.status === "in_progress"
                        ? "table-info"
                        : ""
                    }
                  >
                    <td>{indexOfFirstItem + index + 1}</td>
                    <td className="fw-bold text-primary">
                      {repair.repair_number}
                    </td>
                    <td>
                      <div>
                        <div className="fw-semibold">
                          <FiPackage className="me-1" size={14} />
                          {repair.product_name || "N/A"}
                        </div>
                        {repair.product_module && (
                          <small className="text-muted">
                            Module: {repair.product_module}
                          </small>
                        )}
                      </div>
                    </td>
                    <td>
                      <div>
                        <div className="fw-semibold">
                          <FiUser className="me-1" size={14} />
                          {repair.customer_name || "N/A"}
                        </div>
                        <small className="text-muted">
                          {repair.customer_mobile}
                        </small>
                      </div>
                    </td>
                    <td>
                      <div
                        className="small text-truncate"
                        style={{ maxWidth: "200px" }}
                      >
                        {repair.problem_description || "No description"}
                      </div>
                    </td>
                    <td>
                      <div className="small">
                        <FiCalendar className="me-1" size={12} />
                        {formatDate(repair.receiving_date)}
                      </div>
                    </td>
                    <td>
                      <div className="small">
                        <FiCalendar className="me-1" size={12} />
                        {repair.delivery_date
                          ? formatDate(repair.delivery_date)
                          : "Not set"}
                        {repair.delivery_date &&
                          new Date(repair.delivery_date) < new Date() && (
                            <div className="text-danger small">Overdue</div>
                          )}
                      </div>
                    </td>
                    <td>
                      {getStatusBadge(repair.status)}
                      <div className="small text-muted mt-1">
                        {getAccountBadge(repair.account)}
                      </div>
                    </td>
                    <td className="text-end fw-bold text-primary">
                      {formatCurrency(repair.repair_charge)}
                    </td>
                    <td className="text-end fw-bold text-success">
                      {formatCurrency(repair.paid_amount)}
                    </td>
                    <td className="text-end fw-bold text-danger">
                      {formatCurrency(repair.due_amount)}
                    </td>

                    {/* ACTION BUTTONS */}
                    <td>
                      <div className="d-flex justify-content-end gap-2">
                        <button
                          className="btn btn-sm btn-outline-info d-flex align-items-center gap-1"
                          onClick={() => handleOpenView(repair)}
                          disabled={
                            actionLoading.type &&
                            actionLoading.id === repair._id
                          }
                          title="View Details"
                        >
                          <FiEye size={16} />
                        </button>

                        <button
                          className="btn btn-sm btn-outline-primary d-flex align-items-center gap-1"
                          onClick={() => handleOpenEdit(repair)}
                          disabled={
                            (actionLoading.type &&
                              actionLoading.id === repair._id) ||
                            repair.status === "delivered" ||
                            repair.status === "cancelled"
                          }
                          title="Edit"
                        >
                          {actionLoading.type === "update" &&
                          actionLoading.id === repair._id ? (
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
                              <FiEdit2 size={16} />
                              Edit
                            </>
                          )}
                        </button>

                        <button
                          className="btn btn-sm btn-outline-danger d-flex align-items-center gap-1"
                          onClick={() => handleOpenDelete(repair)}
                          disabled={
                            (actionLoading.type &&
                              actionLoading.id === repair._id) ||
                            repair.status === "delivered"
                          }
                          title="Delete"
                        >
                          {actionLoading.type === "delete" &&
                          actionLoading.id === repair._id ? (
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
                              <RiDeleteBin6Line size={16} />
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
          {filteredRepairs.length > 0 && (
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

      {/* MODALS */}
      {showAddModal && (
        <AddRepairForm
          onClose={() => setShowAddModal(false)}
          onSave={handleAddRepair}
           onAddCustomer={handleAddCustomer}
          loading={actionLoading.type === "add"}
          customerGroups={customerGroups} 
          customers={customers}
          employees={employees}
          saleItems={saleItems}
          statusOptions={statusOptions}
          accountOptions={accountOptions}
        />
      )}

      {showEditModal && selectedRepair && (
        <EditRepairForm
          onClose={() => {
            setShowEditModal(false);
            setSelectedRepair(null);
          }}
          onSave={handleEditRepair}
           onAddCustomer={handleAddCustomer}
          repair={selectedRepair}
          customers={customers}
          customerGroups={customerGroups} 
          employees={employees}
          statusOptions={statusOptions}
          accountOptions={accountOptions}
          loading={
            actionLoading.type === "update" &&
            actionLoading.id === selectedRepair._id
          }
        />
      )}

      {/* VIEW MODAL */}
      {showViewModal && selectedRepair && (
        <ViewRepairModal
          repair={selectedRepair}
          onClose={() => {
            setShowViewModal(false);
            setSelectedRepair(null);
          }}
        />
      )}

      {/* DELETE MODAL */}
      {showDeleteModal && selectedRepair && <DeleteConfirmationModal />}
    </div>
  );
};

export default RepairsTable;
