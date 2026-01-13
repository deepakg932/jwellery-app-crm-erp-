import React, { useState, useEffect } from "react";
import {
  FiEdit2,
  FiSearch,
  FiPlus,
  FiChevronLeft,
  FiChevronRight,
  FiChevronsLeft,
  FiChevronsRight,
  FiUser,
} from "react-icons/fi";
import { RiDeleteBin6Line } from "react-icons/ri";
import AddEmployeeForm from "./AddEmployeeForm";
import EditEmployeeForm from "./EditEmployeeForm";
import useEmployees from "@/hooks/useEmployees";

const EmployeeTable = () => {
  const {
    employees,
    roles,
    loading,
    error,
    addEmployee,
    updateEmployee,
    deleteEmployee,
    fetchEmployees,
  } = useEmployees();

  const [search, setSearch] = useState("");
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null);
  const [actionLoading, setActionLoading] = useState({ type: null, id: null });

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);

  // Filter employees based on search
  const filteredEmployees = employees.filter(
    (employee) =>
      employee.name?.toLowerCase().includes(search.toLowerCase()) ||
      employee.email?.toLowerCase().includes(search.toLowerCase()) ||
      employee.phone?.includes(search) ||
      employee.role_name?.toLowerCase().includes(search.toLowerCase()) ||
      employee.address?.toLowerCase().includes(search.toLowerCase())
  );

  // Reset to first page when search changes
  useEffect(() => {
    setCurrentPage(1);
  }, [search]);

  // Calculate pagination
  const totalItems = filteredEmployees.length;
  const totalPages = Math.ceil(totalItems / itemsPerPage);

  // Get current items for the page
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentEmployees = filteredEmployees.slice(
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
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  // Add new employee
  const handleAddEmployee = async (employeeData) => {
    setActionLoading({ type: "add", id: null });
    try {
      await addEmployee(employeeData);
      setShowAddModal(false);
    } catch (error) {
      console.error("Add failed:", error);
    } finally {
      setActionLoading({ type: null, id: null });
    }
  };

  // Edit employee
  const handleEditEmployee = async (updatedEmployee) => {
    if (!selectedItem) return;

    console.log("Starting edit for:", selectedItem._id);

    // Set loading state
    setActionLoading({ type: "update", id: selectedItem._id });

    try {
      await updateEmployee(selectedItem._id, updatedEmployee);
      console.log("Edit successful");

      // Close modal after successful update
      setShowEditModal(false);
      setSelectedItem(null);
    } catch (error) {
      console.error("Update failed:", error);
    } finally {
      // Always reset loading state
      setActionLoading({ type: null, id: null });
    }
  };

  const handleCloseEdit = () => {
    console.log("handleCloseEdit called");

    // Only allow closing if not currently loading
    if (!actionLoading.type || actionLoading.type !== "update") {
      console.log("Closing edit modal");
      setShowEditModal(false);
      setSelectedItem(null);
    } else {
      console.log("Cannot close - update in progress");
    }
  };

  // Delete employee
  const handleDeleteEmployee = async () => {
    if (!selectedItem) return;

    console.log("Starting delete for:", selectedItem._id);

    // Set loading state with the employee ID
    setActionLoading({ type: "delete", id: selectedItem._id });

    try {
      // Call deleteEmployee and wait for response
      const result = await deleteEmployee(selectedItem._id);

      console.log("Delete result:", result);

      if (result?.success) {
        // Close modal only on successful deletion
        console.log("Delete successful, closing modal");
        setShowDeleteModal(false);
        setSelectedItem(null);
      } else {
        // Keep modal open on error
        console.log("Delete failed, keeping modal open");
        // You could show an error message here
      }
    } catch (error) {
      console.error("Delete failed with error:", error);
      // Keep modal open on error
    } finally {
      // Always reset loading state
      setActionLoading({ type: null, id: null });
    }
  };

  // Open edit modal
  const handleOpenEdit = (employee) => {
    setSelectedItem(employee);
    setShowEditModal(true);
  };

  // Open delete modal
  const handleOpenDelete = (employee) => {
    setSelectedItem(employee);
    setShowDeleteModal(true);
  };

  // Handle refresh
  const handleRefresh = () => {
    fetchEmployees();
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
  const DeleteConfirmationModal = () => {
    const isDeleting =
      actionLoading.type === "delete" && actionLoading.id === selectedItem?._id;

    return (
      <div
        className="modal fade show d-block"
        style={{ backgroundColor: "rgba(0,0,0,0.5)" }}
        tabIndex="-1"
      >
        <div className="modal-dialog modal-dialog-centered">
          <div className="modal-content rounded-3">
            <div className="modal-header border-bottom pb-3">
              <h5 className="modal-title fw-bold fs-5">Delete Employee</h5>
              <button
                type="button"
                className="btn-close"
                onClick={() => {
                  if (!isDeleting) {
                    setShowDeleteModal(false);
                    setSelectedItem(null);
                  }
                }}
                disabled={isDeleting}
                aria-label="Close"
              ></button>
            </div>

            <div className="modal-body">
              <p>
                Are you sure you want to delete{" "}
                <strong>{selectedItem?.name}</strong>?
              </p>
              <p className="text-muted small">
                Role: <strong>{selectedItem?.role_name || "N/A"}</strong>
                <br />
                Email: <strong>{selectedItem?.email || "N/A"}</strong>
              </p>
              <p className="text-muted small">This action cannot be undone.</p>
            </div>

            <div className="modal-footer border-top pt-3">
              <button
                type="button"
                className="btn btn-outline-secondary"
                onClick={() => {
                  if (!isDeleting) {
                    setShowDeleteModal(false);
                    setSelectedItem(null);
                  }
                }}
                disabled={isDeleting}
              >
                Cancel
              </button>
              <button
                type="button"
                className="btn btn-danger"
                onClick={handleDeleteEmployee}
                disabled={isDeleting}
              >
                {isDeleting ? (
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
              <h1 className="h3 fw-bold mb-2">Employees</h1>
              <p className="text-muted mb-0">
                Manage your employees with complete details
              </p>
              {roles.length === 0 && (
                <div
                  className="alert alert-warning alert-dismissible fade show mt-2"
                  role="alert"
                >
                  <i className="bi bi-exclamation-triangle me-2"></i>
                  No roles found. Please create roles first.
                </div>
              )}
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
                disabled={
                  loading || actionLoading.type === "add" || roles.length === 0
                }
              >
                <FiPlus size={18} />
                Add Employee
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
                  placeholder="Search employees by name, email, phone, role..."
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
                <th>Image</th>
                <th>Employee Name</th>
                <th>Email</th>
                <th>Phone</th>
                <th>PAN</th>
                <th>Aadhar</th>
                <th>Role</th>
                <th>Basic Salary</th>
                <th>Address</th>
                <th>Status</th>
                <th>Created Date</th>
                <th className="text-end">Actions</th>
              </tr>
            </thead>

            <tbody>
              {loading && employees.length === 0 ? (
                <tr>
                  <td colSpan="11" className="text-center py-4">
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
              ) : filteredEmployees.length === 0 ? (
                <tr>
                  <td colSpan="11" className="text-center py-4 text-muted">
                    {search
                      ? "No employees found for your search"
                      : "No employees available"}
                  </td>
                </tr>
              ) : (
                currentEmployees.map((employee, index) => (
                  <tr key={employee._id || index}>
                    <td>{indexOfFirstItem + index + 1}</td>

                    <td>
                      <div
                        className="rounded-circle border"
                        style={{ width: "40px", height: "40px" }}
                      >
                        {employee.image ? (
                          <img
                            src={employee.image}
                            alt={employee.name}
                            className="rounded-circle w-100 h-100 object-fit-cover"
                          />
                        ) : (
                          <div className="w-100 h-100 rounded-circle bg-light d-flex align-items-center justify-content-center">
                            <FiUser size={20} className="text-muted" />
                          </div>
                        )}
                      </div>
                    </td>

                    <td className="fw-semibold">{employee.name}</td>

                    <td>
                      <span className="text-muted small">
                        {employee.email || "N/A"}
                      </span>
                    </td>

                    <td>
                      <span className="badge bg-light text-dark fw-semibold">
                        {employee.phone || "N/A"}
                      </span>
                    </td>
                    <td>
                      <span className="badge bg-light text-dark fw-semibold">
                        {employee.pan_number || "N/A"}
                      </span>
                    </td>

                    <td>
                      <span className="badge bg-light text-dark fw-semibold">
                        {employee.aadhaar_number || "N/A"}
                      </span>
                    </td>
                    <td>
                      <span className="badge bg-info text-dark fw-semibold">
                        {employee.role_name || "N/A"}
                      </span>
                    </td>

                    <td>
                      <span className="badge bg-success text-white fw-semibold">
                        {formatCurrency(employee.basic_salary || 0)}
                      </span>
                    </td>

                    <td>
                      <span className="text-muted small">
                        {employee.address
                          ? `${employee.address.substring(0, 30)}${
                              employee.address.length > 30 ? "..." : ""
                            }`
                          : "N/A"}
                      </span>
                    </td>

                    <td>
                      <span
                        className={`badge fw-semibold ${
                          employee.status ? "bg-success" : "bg-danger"
                        }`}
                      >
                        {employee.status ? "Active" : "Inactive"}
                      </span>
                    </td>

                    <td>
                      <span className="text-muted small">
                        {formatDate(employee.createdAt)}
                      </span>
                    </td>

                    {/* ACTION BUTTONS */}
                    <td>
                      <div className="d-flex justify-content-end gap-2">
                        <button
                          className="btn btn-sm btn-outline-primary d-flex align-items-center gap-1"
                          onClick={() => handleOpenEdit(employee)}
                          disabled={
                            actionLoading.type &&
                            actionLoading.id === employee._id
                          }
                        >
                          {actionLoading.type === "update" &&
                          actionLoading.id === employee._id ? (
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
                          onClick={() => handleOpenDelete(employee)}
                          disabled={
                            actionLoading.type &&
                            actionLoading.id === employee._id
                          }
                        >
                          {actionLoading.type === "delete" &&
                          actionLoading.id === employee._id ? (
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
          {filteredEmployees.length > 0 && (
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
        <AddEmployeeForm
          onClose={() => setShowAddModal(false)}
          onSave={handleAddEmployee}
          loading={actionLoading.type === "add"}
          roles={roles}
        />
      )}

      {showEditModal && selectedItem && (
        <EditEmployeeForm
          onClose={() => {
            setShowEditModal(false);
            setSelectedItem(null);
          }}
          onSave={handleEditEmployee}
          employee={selectedItem}
          loading={
            actionLoading.type === "update" &&
            actionLoading.id === selectedItem._id
          }
          roles={roles}
        />
      )}

      {/* DELETE MODAL */}
      {showDeleteModal && selectedItem && <DeleteConfirmationModal />}
    </div>
  );
};

export default EmployeeTable;
