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
  FiEye,
  FiRefreshCw,
} from "react-icons/fi";
import { RiDeleteBin6Line } from "react-icons/ri";
import AddEmployeeForm from "./AddEmployeeForm";
import EditEmployeeForm from "./EditEmployeeForm";
import ViewEmployeeModal from "./ViewEmployeeModal";
import useEmployees from "@/hooks/useEmployees";
import { toast } from "react-toastify";

const EmployeeTable = () => {
  const {
    employees,
    departments,
    designations,
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
  const [showViewModal, setShowViewModal] = useState(false);
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
      employee.mobile?.includes(search) ||
      employee.phone?.includes(search) ||
      employee.role_name?.toLowerCase().includes(search.toLowerCase()) ||
      employee.designation_name?.toLowerCase().includes(search.toLowerCase()) ||
      employee.department_name?.toLowerCase().includes(search.toLowerCase()) ||
      employee.employee_id?.toLowerCase().includes(search.toLowerCase()),
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
    indexOfLastItem,
  );

  console.log(currentEmployees);

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
      throw error;
    } finally {
      setActionLoading({ type: null, id: null });
    }
  };

  // Edit employee
  const handleEditEmployee = async (updatedEmployee) => {
    if (!selectedItem) return;
    setActionLoading({ type: "update", id: selectedItem._id });
    try {
      await updateEmployee(selectedItem._id, updatedEmployee);
      setShowEditModal(false);
      setSelectedItem(null);
    } catch (error) {
      console.error("Update failed:", error);
      throw error;
    } finally {
      setActionLoading({ type: null, id: null });
    }
  };

  // Delete employee
  const handleDeleteEmployee = async () => {
    if (!selectedItem) return;
    setActionLoading({ type: "delete", id: selectedItem._id });
    const toastId = toast.loading("Deleting employee...");
    try {
      const result = await deleteEmployee(selectedItem._id);
      toast.update(toastId, {
        render: "Employee deleted successfully!",
        type: "success",
        isLoading: false,
        autoClose: 3000,
      });
      setShowDeleteModal(false);
      setSelectedItem(null);
    } catch (error) {
      console.error("Delete failed:", error);
      toast.update(toastId, {
        render: error.response?.data?.message || "Failed to delete employee",
        type: "error",
        isLoading: false,
        autoClose: 4000,
      });
    } finally {
      setActionLoading({ type: null, id: null });
    }
  };

  // Open view modal
  const handleOpenView = (employee) => {
    setSelectedItem(employee);
    setShowViewModal(true);
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
    toast.success("Employee list refreshed!");
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
                <FiRefreshCw size={18} className={loading ? "spin" : ""} />
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
                  placeholder="Search by ID, name, email, phone, role, designation..."
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
                <th>Name</th>
                <th>Email</th>
                <th>Mobile</th>
                <th>Role</th>
                <th>Designation</th>
                <th>Department</th>
                <th>Address</th>
                <th>Status</th>
                <th className="text-end">Actions</th>
              </tr>
            </thead>

            <tbody>
              {loading && employees.length === 0 ? (
                <tr>
                  <td colSpan="27" className="text-center py-4">
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
                  <td colSpan="27" className="text-center py-4 text-muted">
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
                        {employee.fullImageUrl || employee.image ? (
                          <img
                            src={employee.fullImageUrl || employee.image}
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

                    <td className="fw-semibold">
                      <div
                        className="d-flex align-items-center gap-1"
                        style={{ lineHeight: 1 }}
                      >
                        <span className="text-muted small">
                          {employee.salutation || "N/A"}
                        </span>
                        {employee.name}
                      </div>
                    </td>

                    <td>
                      <span className="text-muted small">
                        {employee.email || "N/A"}
                      </span>
                    </td>

                    <td>
                      <span className="badge bg-light text-dark fw-semibold">
                        {employee.mobile || employee.phone || "N/A"}
                      </span>
                    </td>


                    <td>
                      <span className="badge bg-secondary text-white">
                        {employee.role_name || "N/A"}
                      </span>
                    </td>
                    
                    <td>
                      <span className="badge bg-light text-dark">
                        {employee.designation_name || "N/A"}
                      </span>
                    </td>

                    <td className="text-center">
                      <span className="badge bg-light text-dark">
                        {employee.department_name || "N/A"}
                      </span>
                    </td>

                    <td>
                      <span
                        className="text-muted small"
                        title={employee.address}
                      >
                        {employee.address
                          ? `${employee.address.substring(0, 20)}${
                              employee.address.length > 20 ? "..." : ""
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

                    {/* ACTION BUTTONS */}
                    <td>
                      <div className="d-flex justify-content-end gap-2">
                        {/* View Button */}
                        <button
                          className="btn btn-sm btn-outline-info d-flex align-items-center gap-1"
                          onClick={() => handleOpenView(employee)}
                          disabled={
                            actionLoading.type &&
                            actionLoading.id === employee._id
                          }
                          title="View Details"
                        >
                          <FiEye size={16} />
                        </button>

                        {/* Edit Button */}
                        <button
                          className="btn btn-sm btn-outline-primary d-flex align-items-center gap-1"
                          onClick={() => handleOpenEdit(employee)}
                          disabled={
                            actionLoading.type &&
                            actionLoading.id === employee._id
                          }
                          title="Edit Employee"
                        >
                          {actionLoading.type === "update" &&
                          actionLoading.id === employee._id ? (
                            <span
                              className="spinner-border spinner-border-sm"
                              role="status"
                              aria-hidden="true"
                            ></span>
                          ) : (
                            <FiEdit2 size={16} />
                          )}
                        </button>

                        {/* Delete Button */}
                        <button
                          className="btn btn-sm btn-outline-danger d-flex align-items-center gap-1"
                          onClick={() => handleOpenDelete(employee)}
                          disabled={
                            actionLoading.type &&
                            actionLoading.id === employee._id
                          }
                          title="Delete Employee"
                        >
                          {actionLoading.type === "delete" &&
                          actionLoading.id === employee._id ? (
                            <span
                              className="spinner-border spinner-border-sm"
                              role="status"
                              aria-hidden="true"
                            ></span>
                          ) : (
                            <RiDeleteBin6Line size={16} />
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
          employees={employees}
          departments={departments}
          designations={designations}
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
          employees={employees}
          departments={departments}
          designations={designations}
        />
      )}

      {showViewModal && selectedItem && (
        <ViewEmployeeModal
          employee={selectedItem}
          onClose={() => {
            setShowViewModal(false);
            setSelectedItem(null);
          }}
        />
      )}

      {/* DELETE MODAL */}
      {showDeleteModal && selectedItem && <DeleteConfirmationModal />}
    </div>
  );
};

export default EmployeeTable;
