import React, { useState } from "react";
import { FiEdit2, FiSearch, FiPlus, FiImage } from "react-icons/fi";
import { RiDeleteBin6Line } from "react-icons/ri";
import AddSubCategoryModal from "./AddSubCategoryModal";
import EditSubCategoryModal from "./EditSubCategoryModal";

// Mock data - you can replace with your actual data
const initialSubCategories = [
  { id: 1, name: "Diamond Rings", categoryId: 1, categoryName: "Rings", image: null },
  { id: 2, name: "Gold Chains", categoryId: 2, categoryName: "Necklaces", image: null },
  { id: 3, name: "Silver Bangles", categoryId: 3, categoryName: "Bracelets", image: null },
  { id: 4, name: "Platinum Earrings", categoryId: 4, categoryName: "Earrings", image: null },
  { id: 5, name: "Gold Nose Pins", categoryId: 5, categoryName: "Nose Pins", image: null },
];

// Mock parent categories data
const parentCategories = [
  { id: 1, name: "Rings" },
  { id: 2, name: "Necklaces" },
  { id: 3, name: "Bracelets" },
  { id: 4, name: "Earrings" },
  { id: 5, name: "Nose Pins" },
  { id: 6, name: "Anklets" },
  { id: 7, name: "Brooches" },
];

const SubCategory = () => {
  const [subCategories, setSubCategories] = useState(initialSubCategories);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedSubCategory, setSelectedSubCategory] = useState(null);

  // Filter subcategories based on search
  const filtered = subCategories.filter((subCat) =>
    subCat.name.toLowerCase().includes(search.toLowerCase()) ||
    subCat.categoryName?.toLowerCase().includes(search.toLowerCase())
  );

  // Add new sub-category
  const handleSave = async (subCategoryData) => {
    setLoading(true);

    await new Promise((resolve) => setTimeout(resolve, 600));

    const newSubCategory = {
      id: Date.now(),
      name: subCategoryData.name,
      categoryId: parseInt(subCategoryData.categoryId),
      categoryName: subCategoryData.categoryName,
      image: subCategoryData.imageFile ? URL.createObjectURL(subCategoryData.imageFile) : null
    };

    setSubCategories([...subCategories, newSubCategory]);
    setShowAddModal(false);
    setLoading(false);
  };

  // Edit sub-category
  const handleEditSubCategory = (updatedSubCategory) => {
    const updated = subCategories.map((subCat) => 
      subCat.id === selectedSubCategory.id ? updatedSubCategory : subCat
    );
    setSubCategories(updated);
    setShowEditModal(false);
    setSelectedSubCategory(null);
  };

  // Delete sub-category
  const handleDeleteSubCategory = async () => {
    if (!selectedSubCategory) return;
    
    setLoading(true);

    const subCat = subCategories.find((c) => c.id === selectedSubCategory.id);
    if (subCat?.image) URL.revokeObjectURL(subCat.image);

    await new Promise((resolve) => setTimeout(resolve, 400));

    setSubCategories(subCategories.filter((c) => c.id !== selectedSubCategory.id));
    setShowDeleteModal(false);
    setSelectedSubCategory(null);
    setLoading(false);
  };

  // Open edit modal
  const handleOpenEdit = (subCategory) => {
    setSelectedSubCategory(subCategory);
    setShowEditModal(true);
  };

  // Open delete modal
  const handleOpenDelete = (subCategory) => {
    setSelectedSubCategory(subCategory);
    setShowDeleteModal(true);
  };

  // Delete Confirmation Modal Component
  const DeleteConfirmationModal = () => (
    <div className="modal fade show d-block" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }} tabIndex="-1">
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
            ></button>
          </div>
          
          <div className="modal-body">
            <p>Are you sure you want to delete <strong>{selectedSubCategory?.name}</strong>?</p>
            <p className="text-danger">This action cannot be undone.</p>
          </div>
          
          <div className="modal-footer border-top pt-3">
            <button
              type="button"
              className="btn btn-outline-secondary"
              onClick={() => {
                setShowDeleteModal(false);
                setSelectedSubCategory(null);
              }}
            >
              Cancel
            </button>
            <button
              type="button"
              className="btn btn-danger"
              onClick={handleDeleteSubCategory}
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
              <h1 className="h3 fw-bold mb-2">Item Sub-Categories</h1>
              <p className="text-muted mb-0">
                Manage your item sub-categories in a table layout
              </p>
            </div>

            <div className="col-md-6 d-flex justify-content-end gap-2">
              <button
                className="btn btn-primary d-flex align-items-center gap-2"
                onClick={() => setShowAddModal(true)}
              >
                <FiPlus size={18} />
                Add Sub-Category
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
                  placeholder="Search sub-categories..."
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
                <th>Sub-Category Name</th>
                <th>Parent Category</th>
                <th className="text-end">Actions</th>
              </tr>
            </thead>

            <tbody>
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan="5" className="text-center py-4 text-muted">
                    No sub-categories found
                  </td>
                </tr>
              ) : (
                filtered.map((subCategory, index) => (
                  <tr key={subCategory.id}>
                    <td>{index + 1}</td>

                    {/* IMAGE PREVIEW */}
                    <td>
                      {subCategory.image ? (
                        <img
                          src={subCategory.image}
                          alt={subCategory.name}
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

                    <td className="fw-semibold">{subCategory.name}</td>
                    <td>
                      <span className="badge bg-info">
                        {subCategory.categoryName}
                      </span>
                    </td>

                    {/* ACTION BUTTONS */}
                    <td>
                      <div className="d-flex justify-content-end gap-2">
                        <button
                          className="btn btn-sm btn-outline-primary d-flex align-items-center gap-1"
                          onClick={() => handleOpenEdit(subCategory)}
                        >
                          <FiEdit2 size={16} />
                          Edit
                        </button>

                        <button
                          className="btn btn-sm btn-outline-danger d-flex align-items-center gap-1"
                          onClick={() => handleOpenDelete(subCategory)}
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
        <AddSubCategoryModal
          onClose={() => setShowAddModal(false)}
          onSave={handleSave}
          loading={loading}
          categories={parentCategories}
        />
      )}

      {/* EDIT MODAL */}
      {showEditModal && selectedSubCategory && (
        <EditSubCategoryModal
          show={showEditModal}
          onHide={() => {
            setShowEditModal(false);
            setSelectedSubCategory(null);
          }}
          onSubmit={handleEditSubCategory}
          subCategory={selectedSubCategory}
          categories={parentCategories}
        />
      )}

      {/* DELETE MODAL */}
      {showDeleteModal && selectedSubCategory && (
        <DeleteConfirmationModal />
      )}
    </div>
  );
};

export default SubCategory;