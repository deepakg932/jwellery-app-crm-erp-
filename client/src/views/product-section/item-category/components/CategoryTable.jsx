import { useState } from "react";
import { FiEdit2, FiSearch, FiPlus, FiImage, FiX, FiUpload } from "react-icons/fi";
import { RiDeleteBin6Line } from "react-icons/ri";
import {AddCategoryModal} from "./AddCategoryModal";
import {EditCategoryModal} from "./EditCategoryModal";


// Import your data
import { categoriesTable } from "../data";

// ==================== MAIN COMPONENT ====================

const CategoryTable = () => {
  const [categories, setCategories] = useState(categoriesTable.data);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState(null);

  const filtered = categories.filter((cat) =>
    cat.categoryName.toLowerCase().includes(search.toLowerCase()) ||
    cat.metalType?.toLowerCase().includes(search.toLowerCase())
  );

  // Add new category
  const handleAddCategory = async (categoryData) => {
    setLoading(true);

    await new Promise((resolve) => setTimeout(resolve, 600));

    const newCategory = {
      ...categoryData,
      image: categoryData.imageFile ? URL.createObjectURL(categoryData.imageFile) : null
    };

    setCategories([...categories, newCategory]);
    setShowAddModal(false);
    setLoading(false);
  };

  // Edit category
  const handleEditCategory = (updatedCategory) => {
    const updated = categories.map((cat, idx) => 
      idx === selectedCategory.index ? updatedCategory : cat
    );
    setCategories(updated);
    setShowEditModal(false);
    setSelectedCategory(null);
  };

  // Delete category
  const handleDeleteCategory = async () => {
    setLoading(true);

    const cat = categories[selectedCategory.index];
    if (cat?.image) URL.revokeObjectURL(cat.image);

    await new Promise((resolve) => setTimeout(resolve, 400));

    const updated = categories.filter((_, idx) => idx !== selectedCategory.index);
    setCategories(updated);
    setShowDeleteModal(false);
    setSelectedCategory(null);
    setLoading(false);
  };

  // Open edit modal
  const handleOpenEdit = (index) => {
    setSelectedCategory({
      index,
      data: categories[index]
    });
    setShowEditModal(true);
  };

  // Open delete modal
  const handleOpenDelete = (index) => {
    setSelectedCategory({
      index,
      data: categories[index]
    });
    setShowDeleteModal(true);
  };

  // Delete Confirmation Modal
  const DeleteConfirmationModal = () => (
    <div className="modal fade show d-block" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }} tabIndex="-1">
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
            ></button>
          </div>
          
          <div className="modal-body">
            <p>Are you sure you want to delete <strong>{selectedCategory?.data?.categoryName}</strong>?</p>
            <p className="text-danger">This action cannot be undone.</p>
          </div>
          
          <div className="modal-footer border-top pt-3">
            <button
              type="button"
              className="btn btn-outline-secondary"
              onClick={() => {
                setShowDeleteModal(false);
                setSelectedCategory(null);
              }}
            >
              Cancel
            </button>
            <button
              type="button"
              className="btn btn-danger"
              onClick={handleDeleteCategory}
              disabled={loading}
            >
              {loading ? (
                <>
                  <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                  Deleting...
                </>
              ) : (
                'Delete'
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
              >
                <FiPlus size={18} />
                Add Item Category
              </button>
            </div>
          </div>

          {/* SEARCH */}
          <div className="row">
            <div className="col-md-4">
              <div className="input-group">
                <span className="input-group-text bg-transparent border-end-0">
                  <FiSearch className="text-muted" />
                </span>
                <input
                  type="text"
                  className="form-control border-start-0"
                  placeholder="Search categories..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                />
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
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan="5" className="text-center py-4 text-muted">
                    No categories found
                  </td>
                </tr>
              ) : (
                filtered.map((category, index) => (
                  <tr key={index}>
                    <td>{index + 1}</td>

                    {/* IMAGE PREVIEW */}
                    <td>
                      {category.image ? (
                        <img
                          src={category.image}
                          alt={category.categoryName}
                          width="45"
                          height="45"
                          className="rounded border"
                          style={{ objectFit: "cover" }}
                        />
                      ) : (
                        <div
                          className="bg-light border rounded d-flex justify-content-center align-items-center"
                          style={{ width: 45, height: 45 }}
                        >
                          <FiImage className="text-muted" />
                        </div>
                      )}
                    </td>

                    <td className="fw-semibold">{category.categoryName}</td>
                    <td>
                      <span className="badge bg-secondary fw-semibold">
                        {category.metalType}
                      </span>
                    </td>

                    {/* ACTION BUTTONS */}
                    <td>
                      <div className="d-flex justify-content-end gap-2">
                        <button
                          className="btn btn-sm btn-outline-primary d-flex align-items-center gap-1"
                          onClick={() => handleOpenEdit(index)}
                        >
                          <FiEdit2 size={16} />
                          Edit
                        </button>

                        <button
                          className="btn btn-sm btn-outline-danger d-flex align-items-center gap-1"
                          onClick={() => handleOpenDelete(index)}
                        >
                          <RiDeleteBin6Line size={16} />
                          Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* ADD MODAL */}
      {showAddModal && (
        <AddCategoryModal
          onClose={() => setShowAddModal(false)}
          onSave={handleAddCategory}
          loading={loading}
        />
      )}

      {/* EDIT MODAL */}
      {showEditModal && selectedCategory && (
        <EditCategoryModal
          show={showEditModal}
          onHide={() => {
            setShowEditModal(false);
            setSelectedCategory(null);
          }}
          onSubmit={handleEditCategory}
          category={selectedCategory.data}
        />
      )}

      {/* DELETE MODAL */}
      {showDeleteModal && selectedCategory && (
        <DeleteConfirmationModal />
      )}
    </div>
  );
};

export default CategoryTable;