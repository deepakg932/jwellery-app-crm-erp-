import { useState, useEffect } from "react";
import { 
  FiEdit2, 
  FiSearch, 
  FiPlus, 
  FiImage, 
  FiChevronLeft, 
  FiChevronRight, 
  FiChevronsLeft, 
  FiChevronsRight 
} from "react-icons/fi";
import { RiDeleteBin6Line } from "react-icons/ri";
import  AddCategoryModal  from "./AddCategoryModal";
import EditCategoryModal from "./EditCategoryModal";
import useItemCategories from "@/hooks/useItemCategories";

const CategoryTable = () => {
  const { 
    categories, 
    metalTypes, 
    loading, 
    addCategory, 
    updateCategory, 
    deleteCategory,
    getMetalNameById 
  } = useItemCategories();
  
  const [search, setSearch] = useState("");
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [actionLoading, setActionLoading] = useState({ type: null, id: null });
  
  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);

  // Create metal options for dropdowns
  const allMetalOptions = metalTypes.map(metal => ({
    id: metal.id,
    name: metal.name
  }));

  // Filter categories based on search
  const filtered = categories.filter(
    (cat) =>
      cat.name?.toLowerCase().includes(search.toLowerCase()) ||
      getMetalNameById(cat.metal_type)?.toLowerCase().includes(search.toLowerCase())
  );

  // Reset to first page when search changes
  useEffect(() => {
    setCurrentPage(1);
  }, [search]);

  // Calculate pagination
  const totalItems = filtered.length;
  const totalPages = Math.ceil(totalItems / itemsPerPage);
  
  // Get current items for the page
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = filtered.slice(indexOfFirstItem, indexOfLastItem);

  // Safe image component to prevent errors
  const SafeImage = ({ src, alt, ...props }) => {
    const [hasError, setHasError] = useState(false);

    if (hasError || !src) {
      return (
        <div
          className="bg-light border rounded d-flex justify-content-center align-items-center"
          style={{ width: 45, height: 45 }}
        >
          <FiImage className="text-muted" />
        </div>
      );
    }

    return (
      <img
        src={src}
        alt={alt || "Category"}
        {...props}
        onError={() => setHasError(true)}
      />
    );
  };

  // Add new category with API
  const handleAddCategory = async (categoryData) => {
    setActionLoading({ type: "add", id: null });
    try {
      await addCategory(categoryData);
      setShowAddModal(false);
    } catch (error) {
      console.error("Add failed:", error);
    } finally {
      setActionLoading({ type: null, id: null });
    }
  };

  // Edit category with API
  const handleEditCategory = async (updatedCategory) => {
    if (!selectedCategory) return;

    setActionLoading({ type: "update", id: selectedCategory._id });
    try {
      await updateCategory(selectedCategory._id, updatedCategory);
      setShowEditModal(false);
      setSelectedCategory(null);
    } catch (error) {
      console.error("Update failed:", error);
    } finally {
      setActionLoading({ type: null, id: null });
    }
  };

  // Delete category with API
  const handleDeleteCategory = async () => {
    if (!selectedCategory) return;

    setActionLoading({ type: "delete", id: selectedCategory._id });
    try {
      await deleteCategory(selectedCategory._id);
      setShowDeleteModal(false);
      setSelectedCategory(null);
    } catch (error) {
      console.error("Delete failed:", error);
    } finally {
      setActionLoading({ type: null, id: null });
    }
  };

  // Open edit modal
  const handleOpenEdit = (category) => {
    setSelectedCategory(category);
    setShowEditModal(true);
  };

  // Open delete modal
  const handleOpenDelete = (category) => {
    setSelectedCategory(category);
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
            <h5 className="modal-title fw-bold fs-5">Delete Category</h5>
            <button
              type="button"
              className="btn-close"
              onClick={() => {
                setShowDeleteModal(false);
                setSelectedCategory(null);
              }}
              disabled={actionLoading.type === "delete"}
            ></button>
          </div>

          <div className="modal-body">
            <p>
              Are you sure you want to delete{" "}
              <strong>{selectedCategory?.name}</strong>?
            </p>
          </div>

          <div className="modal-footer border-top pt-3">
            <button
              type="button"
              className="btn btn-outline-secondary"
              onClick={() => {
                setShowDeleteModal(false);
                setSelectedCategory(null);
              }}
              disabled={actionLoading.type === "delete"}
            >
              Cancel
            </button>
            <button
              type="button"
              className="btn btn-danger"
              onClick={handleDeleteCategory}
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
      {/* HEADER */}
      <div className="card border-0 shadow-sm mb-4">
        <div className="card-body">
          <div className="row align-items-center mb-4">
            <div className="col-md-6">
              <h1 className="h3 fw-bold mb-2">Item Categories</h1>
              <p className="text-muted mb-0">
                Manage your item categories in a table layout
              </p>
            </div>

            <div className="col-md-6 d-flex justify-content-end gap-2">
              <button
                className="btn btn-primary d-flex align-items-center gap-2"
                onClick={() => setShowAddModal(true)}
                disabled={loading || actionLoading.type === "add"}
              >
                <FiPlus size={18} />
                Add Item Category
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
                  placeholder="Search categories or metal types..."
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
                <th>Category Name</th>
                <th>Metal Type</th>
                <th className="text-end">Actions</th>
              </tr>
            </thead>

            <tbody>
              {loading && categories.length === 0 ? (
                <tr>
                  <td colSpan="5" className="text-center py-4">
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
                  <td colSpan="5" className="text-center py-4 text-muted">
                    {search
                      ? "No categories found for your search"
                      : "No categories available"}
                  </td>
                </tr>
              ) : (
                currentItems.map((category, index) => (
                  <tr key={category._id || index}>
                    <td>{indexOfFirstItem + index + 1}</td>

                    {/* IMAGE PREVIEW */}
                    <td>
                      <SafeImage
                        src={category.imageUrl}
                        alt={category.name}
                        width="45"
                        height="45"
                        className="rounded border"
                        style={{ objectFit: "cover" }}
                      />
                    </td>

                    <td className="fw-semibold">{category.name}</td>
                    <td>
                      <span className="badge bg-secondary fw-semibold">
                        {getMetalNameById(category.metal_type)}
                      </span>
                    </td>

                    {/* ACTION BUTTONS */}
                    <td>
                      <div className="d-flex justify-content-end gap-2">
                        <button
                          className="btn btn-sm btn-outline-primary d-flex align-items-center gap-1"
                          onClick={() => handleOpenEdit(category)}
                          disabled={
                            actionLoading.type &&
                            actionLoading.id === category._id
                          }
                        >
                          {actionLoading.type === "update" &&
                          actionLoading.id === category._id ? (
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
                          onClick={() => handleOpenDelete(category)}
                          disabled={
                            actionLoading.type &&
                            actionLoading.id === category._id
                          }
                        >
                          {actionLoading.type === "delete" &&
                          actionLoading.id === category._id ? (
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
                  {Math.min(indexOfLastItem, totalItems)} of {totalItems} entries
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
                    aria-current={currentPage === pageNumber ? "page" : undefined}
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
        <AddCategoryModal
          key="add-modal"
          onClose={() => setShowAddModal(false)}
          onSave={handleAddCategory}
          loading={actionLoading.type === "add"}
          metalOptions={allMetalOptions}
        />
      )}

      {/* EDIT MODAL */}
      {showEditModal && selectedCategory && (
        <EditCategoryModal
          key={`edit-modal-${selectedCategory._id}`}
          show={showEditModal}
          onHide={() => {
            setShowEditModal(false);
            setTimeout(() => setSelectedCategory(null), 100);
          }}
          onSubmit={handleEditCategory}
          category={selectedCategory}
          loading={
            actionLoading.type === "update" &&
            actionLoading.id === selectedCategory._id
          }
          metalOptions={allMetalOptions}
        />
      )}

      {/* DELETE MODAL */}
      {showDeleteModal && selectedCategory && (
        <DeleteConfirmationModal key={`delete-modal-${selectedCategory._id}`} />
      )}
    </div>
  );
};

export default CategoryTable;