import { useState, useEffect } from "react";
import {
  FiEdit2,
  FiSearch,
  FiPlus,
  FiChevronLeft,
  FiChevronRight,
  FiChevronsLeft,
  FiChevronsRight,
  FiDollarSign,
  FiImage,
} from "react-icons/fi";
import { RiDeleteBin6Line } from "react-icons/ri";
import AddInventoryItemModal from "./AddInventoryItemForm";
import EditInventoryItemModal from "./EditInventoryItemForm";
import useInventoryItems from "@/hooks/useInventoryItems";

const InventoryItemTable = () => {
  const {
    items,
    inventoryCategories,
    loading,
    addInventoryItem,
    updateInventoryItem,
    deleteInventoryItem,
    suppliers,
    subCategories,
  } = useInventoryItems();

  const [search, setSearch] = useState("");
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null);
  const [actionLoading, setActionLoading] = useState({ type: null, id: null });

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);

  // Filter items based on search
  const filtered = items.filter(
    (item) =>
      item.name?.toLowerCase().includes(search.toLowerCase()) ||
      item.item_code?.toLowerCase().includes(search.toLowerCase()) ||
      item.category_name?.toLowerCase().includes(search.toLowerCase()) ||
      item.sub_category_name?.toLowerCase().includes(search.toLowerCase()) ||
      item.purity?.toLowerCase().includes(search.toLowerCase()) ||
      item.supplier_name?.toLowerCase().includes(search.toLowerCase()) ||
      item.description?.toLowerCase().includes(search.toLowerCase())
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

  // Add new inventory item
  const handleAddItem = async (itemData) => {
    setActionLoading({ type: "add", id: null });
    try {
      await addInventoryItem(itemData);
      setShowAddModal(false);
    } catch (error) {
      console.error("Add failed:", error);
    } finally {
      setActionLoading({ type: null, id: null });
    }
  };

  // Edit inventory item
  const handleEditItem = async (updatedItem) => {
    if (!selectedItem) return;

    setActionLoading({ type: "update", id: selectedItem._id });
    try {
      await updateInventoryItem(selectedItem._id, updatedItem);
      setShowEditModal(false);
      setSelectedItem(null);
    } catch (error) {
      console.error("Update failed:", error);
    } finally {
      setActionLoading({ type: null, id: null });
    }
  };

  // Delete inventory item
  const handleDeleteItem = async () => {
    if (!selectedItem) return;

    setActionLoading({ type: "delete", id: selectedItem._id });
    try {
      await deleteInventoryItem(selectedItem._id);
      setShowDeleteModal(false);
      setSelectedItem(null);
    } catch (error) {
      console.error("Delete failed:", error);
    } finally {
      setActionLoading({ type: null, id: null });
    }
  };

  // Open edit modal
const handleOpenEdit = (purchaseOrder) => {
  // You can also fetch the full data here if needed
  setSelectedItem(purchaseOrder);
  setShowEditModal(true);
};
  // Open delete modal
  const handleOpenDelete = (item) => {
    setSelectedItem(item);
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

  // Format category name
  const getCategoryName = (item) => {
    return item.category_name || "No Category";
  };

  // Format sub-category name
  const getSubCategoryName = (item) => {
    return item.sub_category_name || "No Sub-Category";
  };

  // Format supplier name
  const getSupplierName = (item) => {
    return item.supplier_name || "No Supplier";
  };

  // Format price with Indian Rupees
  const formatPrice = (price) => {
    return `₹${parseFloat(price || 0).toLocaleString('en-IN')}`;
  };

  // Get selling price
  const getSellingPrice = (item) => {
    return item.final_price || item.selling_price || 0;
  };

  // Show image in modal
  const showImageModal = (imageUrl) => {
    if (!imageUrl) return;
    
    const modalHtml = `
      <div class="modal fade show d-block" style="background-color: rgba(0,0,0,0.8)" tabindex="-1">
        <div class="modal-dialog modal-dialog-centered modal-lg">
          <div class="modal-content">
            <div class="modal-header">
              <h5 class="modal-title">Item Image</h5>
              <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
            </div>
            <div class="modal-body text-center">
              <img src="${imageUrl}" alt="Item Image" class="img-fluid" style="max-height: 70vh; object-fit: contain;" />
            </div>
          </div>
        </div>
      </div>
    `;
    
    const modalContainer = document.createElement('div');
    modalContainer.innerHTML = modalHtml;
    document.body.appendChild(modalContainer);
    
    // Add click handler to close modal
    const closeBtn = modalContainer.querySelector('.btn-close');
    closeBtn.addEventListener('click', () => {
      document.body.removeChild(modalContainer);
    });
    
    // Close modal when clicking outside
    modalContainer.addEventListener('click', (e) => {
      if (e.target === modalContainer) {
        document.body.removeChild(modalContainer);
      }
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
            <h5 className="modal-title fw-bold fs-5">Delete Inventory Item</h5>
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
              Are you sure you want to delete{" "}
              <strong>{selectedItem?.name}</strong>?
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
              onClick={handleDeleteItem}
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
              <h1 className="h3 fw-bold mb-2">Inventory Items</h1>
              <p className="text-muted mb-0">
                Manage jewelry items inventory
              </p>
            </div>

            <div className="col-md-6 d-flex justify-content-end gap-2">
              <button
                className="btn btn-primary d-flex align-items-center gap-2"
                onClick={() => setShowAddModal(true)}
                disabled={loading || actionLoading.type === "add"}
              >
                <FiPlus size={18} />
                Add Inventory Item
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
                  placeholder="Search items, categories, suppliers..."
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
                <th>Item Code</th>
                <th>Item Name</th>
                <th>Category</th>
                <th>Sub Category</th>
                <th>Purity</th>
                <th>Purchase Price</th>
                <th>Selling Price</th>
                <th>Profit Margin</th>
                <th>Supplier</th>
                <th>Status</th>
                <th className="text-end">Actions</th>
              </tr>
            </thead>

            <tbody>
              {loading && items.length === 0 ? (
                <tr>
                  <td colSpan="13" className="text-center py-4">
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
                  <td colSpan="13" className="text-center py-4 text-muted">
                    {search
                      ? "No inventory items found for your search"
                      : "No inventory items available"}
                  </td>
                </tr>
              ) : (
                currentItems.map((item, index) => {
                  const sellingPrice = getSellingPrice(item);
                  
                  return (
                    <tr key={item._id || index}>
                      <td>{indexOfFirstItem + index + 1}</td>

                      <td>
                        <div className="fw-medium text-primary">
                          {item.item_code || "N/A"}
                        </div>
                      </td>

                      <td>
                        <div className="fw-semibold">{item.name}</div>
                        {/* {item.description && (
                          <div className="text-muted small text-truncate" style={{ maxWidth: "200px" }}>
                            {item.description}
                          </div>
                        )} */}
                      </td>

                      <td>
                        <span className="badge bg-primary fw-semibold">
                          {getCategoryName(item)}
                        </span>
                      </td>

                      <td>
                        <span className="badge bg-info fw-semibold">
                          {getSubCategoryName(item)}
                        </span>
                      </td>

                      <td>
                        <span className="badge bg-warning text-dark fw-semibold">
                          {item.purity || "No Purity"}
                        </span>
                      </td>

                      <td className="fw-bold text-success">
                        {formatPrice(item.purchase_price)}
                      </td>

                      <td className="fw-bold text-primary">
                        {formatPrice(sellingPrice)}
                      </td>

                      <td>
                        <span className="fw-medium">
                          {item.profit_margin || 0}%
                        </span>
                      </td>

                      <td>
                        <div className="small">
                          <span className="text-muted">
                            {getSupplierName(item)}
                          </span>
                        </div>
                      </td>

                      {/* Image Column */}
                      {/* <td>
                        {hasImage ? (
                          <button
                            type="button"
                            className="btn btn-sm btn-outline-info d-flex align-items-center gap-1"
                            onClick={() => showImageModal(item.images[0])}
                            title="View Image"
                          >
                            <FiImage size={16} />
                            View
                          </button>
                        ) : (
                          <span className="text-muted small">No Image</span>
                        )}
                      </td> */}

                      {/* Status Column */}
                      <td>
                        <span
                          className={`badge fw-semibold ${
                            item.status === "active" 
                              ? "bg-success" 
                              : item.status === "inactive" 
                                ? "bg-danger" 
                                : "bg-secondary"
                          }`}
                        >
                          {item.status?.toUpperCase() || "UNKNOWN"}
                        </span>
                      </td>

                      {/* ACTION BUTTONS */}
                      <td>
                        <div className="d-flex justify-content-end gap-2">
                          <button
                            className="btn btn-sm btn-outline-primary d-flex align-items-center gap-1"
                            onClick={() => handleOpenEdit(item)}
                            disabled={
                              actionLoading.type &&
                              actionLoading.id === item._id
                            }
                          >
                            {actionLoading.type === "update" &&
                            actionLoading.id === item._id ? (
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
                            onClick={() => handleOpenDelete(item)}
                            disabled={
                              actionLoading.type &&
                              actionLoading.id === item._id
                            }
                          >
                            {actionLoading.type === "delete" &&
                            actionLoading.id === item._id ? (
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
                  );
                })
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

      {/* ADD MODAL */}
      {showAddModal && (
        <AddInventoryItemModal
          key="add-modal"
          onClose={() => setShowAddModal(false)}
          onSave={handleAddItem}
          loading={actionLoading.type === "add"}
          inventoryCategories={inventoryCategories}
          subCategories={subCategories}
          suppliers={suppliers || []}
        />
      )}

      {/* EDIT MODAL */}
      {showEditModal && selectedItem && (
        <EditInventoryItemModal
          key={`edit-modal-${selectedItem._id}`}
          onClose={() => {
            setShowEditModal(false);
            setTimeout(() => setSelectedItem(null), 100);
          }}
          onSave={handleEditItem}
          item={selectedItem}
          loading={
            actionLoading.type === "update" &&
            actionLoading.id === selectedItem._id
          }
          inventoryCategories={inventoryCategories}
          subCategories={subCategories}
          suppliers={suppliers || []}
        />
      )}

      {/* DELETE MODAL */}
      {showDeleteModal && selectedItem && (
        <DeleteConfirmationModal key={`delete-modal-${selectedItem._id}`} />
      )}
    </div>
  );
};

export default InventoryItemTable;