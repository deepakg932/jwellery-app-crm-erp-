// SubCategoryTablePage.js
import { useState, useEffect } from "react";
import {
  FiEdit2,
  FiSearch,
  FiPlus,
  FiChevronLeft,
  FiChevronRight,
  FiChevronsLeft,
  FiChevronsRight,
} from "react-icons/fi";
import { RiDeleteBin6Line } from "react-icons/ri";
import AddSubCategoryForm from "./AddSubCategoryForm";
import EditSubCategoryForm from "./EditSubCategoryForm";
import useInventorySubCategories from "@/hooks/useInventorySubCategories";

const SubCategoryTablePage = () => {
  const {
    subCategories,
    categories,
    loading,
    error,
    addSubCategory,
    updateSubCategory,
    deleteSubCategory,
  } = useInventorySubCategories();

  const [search, setSearch] = useState("");
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedSubCategory, setSelectedSubCategory] = useState(null);
  const [actionLoading, setActionLoading] = useState({ type: null, id: null });

  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);

  // Debug: Log state
  console.log("subCategories state:", subCategories);
  console.log("categories state:", categories);
  console.log("loading state:", loading);
  console.log("error state:", error);

  // Filter sub-categories based on search
  const filtered = subCategories.filter(
    (subCat) =>
      subCat.name?.toLowerCase().includes(search.toLowerCase()) ||
      subCat.description?.toLowerCase().includes(search.toLowerCase()) ||
      subCat.category_name?.toLowerCase().includes(search.toLowerCase()) ||
      subCat.subcategory_code?.toLowerCase().includes(search.toLowerCase())
  );

  useEffect(() => {
    setCurrentPage(1);
  }, [search]);

  const totalItems = filtered.length;
  const totalPages = Math.ceil(totalItems / itemsPerPage);
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = filtered.slice(indexOfFirstItem, indexOfLastItem);

  // Add new sub-category
  const handleAddSubCategory = async (subCategoryData) => {
    setActionLoading({ type: "add", id: null });
    try {
      await addSubCategory(subCategoryData);
      setShowAddModal(false);
    } catch (error) {
      console.error("Add failed:", error);
      alert(error.message || "Failed to add sub-category");
    } finally {
      setActionLoading({ type: null, id: null });
    }
  };

  // Edit sub-category
  const handleEditSubCategory = async (updatedSubCategory) => {
    if (!selectedSubCategory) return;

    setActionLoading({ type: "update", id: selectedSubCategory._id });
    try {
      await updateSubCategory(selectedSubCategory._id, updatedSubCategory);
      setShowEditModal(false);
      setSelectedSubCategory(null);
    } catch (error) {
      console.error("Update failed:", error);
      alert(error.message || "Failed to update sub-category");
    } finally {
      setActionLoading({ type: null, id: null });
    }
  };

  // Delete sub-category
  const handleDeleteSubCategory = async () => {
    if (!selectedSubCategory) return;

    setActionLoading({ type: "delete", id: selectedSubCategory._id });
    try {
      await deleteSubCategory(selectedSubCategory._id);
      setShowDeleteModal(false);
      setSelectedSubCategory(null);
    } catch (error) {
      console.error("Delete failed:", error);
      alert(error.message || "Failed to delete sub-category");
    } finally {
      setActionLoading({ type: null, id: null });
    }
  };

  const handleOpenEdit = (subCategory) => {
    setSelectedSubCategory(subCategory);
    setShowEditModal(true);
  };

  const handleOpenDelete = (subCategory) => {
    setSelectedSubCategory(subCategory);
    setShowDeleteModal(true);
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
    return date.toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
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
            <h5 className="modal-title fw-bold fs-5">Delete Sub-Category</h5>
            <button
              type="button"
              className="btn-close"
              onClick={() => {
                setShowDeleteModal(false);
                setSelectedSubCategory(null);
              }}
              disabled={actionLoading.type === "delete"}
              aria-label="Close"
            ></button>
          </div>

          <div className="modal-body">
            <p>
              Are you sure you want to delete{" "}
              <strong>{selectedSubCategory?.name}</strong>?
            </p>
            <p className="text-muted small">
              Code:{" "}
              <strong>{selectedSubCategory?.subcategory_code || "N/A"}</strong>
            </p>
            <p className="text-muted small">
              Category:{" "}
              <strong>{selectedSubCategory?.category_name || "N/A"}</strong>
            </p>
            <p className="text-muted small">This action cannot be undone.</p>
          </div>

          <div className="modal-footer border-top pt-3">
            <button
              type="button"
              className="btn btn-outline-secondary"
              onClick={() => {
                setShowDeleteModal(false);
                setSelectedSubCategory(null);
              }}
              disabled={actionLoading.type === "delete"}
            >
              Cancel
            </button>
            <button
              type="button"
              className="btn btn-danger"
              onClick={handleDeleteSubCategory}
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
          className="alert alert-danger alert-dismissible fade show mb-3"
          role="alert"
        >
          {error}
          <button
            type="button"
            className="btn-close"
            onClick={() => setError("")}
          ></button>
        </div>
      )}

      <div className="card border-0 shadow-sm mb-4">
        <div className="card-body">
          <div className="row align-items-center mb-4">
            <div className="col-md-6">
              <h1 className="h3 fw-bold mb-2">Sub-Categories</h1>
              <p className="text-muted mb-0">
                Manage your inventory sub-categories
              </p>
            </div>

            <div className="col-md-6 d-flex justify-content-end gap-2">
              <button
                className="btn btn-primary d-flex align-items-center gap-2"
                onClick={() => setShowAddModal(true)}
                disabled={loading || actionLoading.type === "add"}
              >
                <FiPlus size={18} />
                Add Sub-Category
              </button>
            </div>
          </div>

          <div className="row align-items-center">
            <div className="col-md-4">
              <div className="input-group">
                <span className="input-group-text bg-transparent border-end-0">
                  <FiSearch className="text-muted" />
                </span>
                <input
                  type="text"
                  className="form-control border-start-0"
                  placeholder="Search by name, code, description, or category..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  disabled={loading}
                />
              </div>
            </div>

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

      <div className="card border-0 shadow-sm">
        <div className="card-body table-responsive">
          <table className="table align-middle">
            <thead>
              <tr>
                <th>#</th>
                <th>Sub-Category Name</th>
                <th>Description</th>
                <th>Category</th>
                <th>Status</th>
                <th className="text-end">Actions</th>
              </tr>
            </thead>

            <tbody>
              {loading && subCategories.length === 0 ? (
                <tr>
                  <td colSpan="8" className="text-center py-4">
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
              ) : filtered.length === 0 ? (
                <tr>
                  <td colSpan="8" className="text-center py-4 text-muted">
                    {search
                      ? "No sub-categories found for your search"
                      : "No sub-categories available"}
                  </td>
                </tr>
              ) : (
                currentItems.map((subCategory, index) => (
                  <tr key={subCategory._id || index}>
                    <td>{indexOfFirstItem + index + 1}</td>
                    <td className="fw-semibold">{subCategory.name}</td>
                    <td>
                      <span className="text-muted">
                        {subCategory.description || "No description"}
                      </span>
                    </td>
                    <td>
                      <span className="badge bg-info text-dark fw-semibold">
                        {subCategory.category_name || "Uncategorized"}
                      </span>
                    </td>

                    <td>
                      <span
                        className={`badge fw-semibold ${
                          subCategory.status ? "bg-success" : "bg-danger"
                        }`}
                      >
                        {subCategory.status ? "Active" : "Inactive"}
                      </span>
                    </td>

                    <td>
                      <div className="d-flex justify-content-end gap-2">
                        <button
                          className="btn btn-sm btn-outline-primary d-flex align-items-center gap-1"
                          onClick={() => handleOpenEdit(subCategory)}
                          disabled={
                            actionLoading.type &&
                            actionLoading.id === subCategory._id
                          }
                        >
                          {actionLoading.type === "update" &&
                          actionLoading.id === subCategory._id ? (
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
                          onClick={() => handleOpenDelete(subCategory)}
                          disabled={
                            actionLoading.type &&
                            actionLoading.id === subCategory._id
                          }
                        >
                          {actionLoading.type === "delete" &&
                          actionLoading.id === subCategory._id ? (
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
          {filtered.length > 0 && (
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

      {/* Modals */}
      {showAddModal && (
        <AddSubCategoryForm
          onClose={() => setShowAddModal(false)}
          onSave={handleAddSubCategory}
          loading={actionLoading.type === "add"}
          categories={categories}
        />
      )}

      {showEditModal && selectedSubCategory && (
        <EditSubCategoryForm
          show={showEditModal}
          onHide={() => {
            setShowEditModal(false);
            setSelectedSubCategory(null);
          }}
          onSubmit={handleEditSubCategory}
          subCategory={selectedSubCategory}
          loading={
            actionLoading.type === "update" &&
            actionLoading.id === selectedSubCategory._id
          }
          categories={categories}
        />
      )}

      {showDeleteModal && selectedSubCategory && <DeleteConfirmationModal />}
    </div>
  );
};

export default SubCategoryTablePage;
