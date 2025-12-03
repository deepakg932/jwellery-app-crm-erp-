import React, { useState } from "react";
import { FiEdit2, FiSearch, FiPlus, FiGrid } from "react-icons/fi";
import { RiDeleteBin6Line } from "react-icons/ri";
import AddMetalTypeModal from "./AddMetalTypeForm";
import EditMetalTypeModal from "./EditMetalTypeForm";
// import DeleteMetalTypeModal from "./components/DeleteMetalTypeModal";

export default function MetalTypesPage() {
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState(null);

  const [categories, setCategories] = useState([
    { id: 1, name: "Gold", image: null },
    { id: 2, name: "Silver", image: null },
    { id: 3, name: "Platinum", image: null },
    { id: 4, name: "Copper", image: null },
    { id: 5, name: "Bronze", image: null },
    { id: 6, name: "Brass", image: null },
    { id: 7, name: "Steel", image: null },
    { id: 8, name: "Aluminum", image: null },
    { id: 9, name: "Titanium", image: null }
  ]);

  const filtered = categories.filter((c) =>
    c.name.toLowerCase().includes(search.toLowerCase())
  );

  const handleSave = async (name, imageFile) => {
    setLoading(true);

    await new Promise((resolve) => setTimeout(resolve, 600));

    const newCategory = {
      id: Date.now(),
      name,
      color: "bg-body-secondary text-body-emphasis",
      image: imageFile ? URL.createObjectURL(imageFile) : null
    };

    setCategories([...categories, newCategory]);
    setShowAddModal(false);
    setLoading(false);
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this metal type?")) return;

    setLoading(true);

    const cat = categories.find((c) => c.id === id);
    if (cat?.image) URL.revokeObjectURL(cat.image);

    await new Promise((resolve) => setTimeout(resolve, 400));

    setCategories(categories.filter((c) => c.id !== id));
    setLoading(false);
  };

  const handleEditCategory = (updatedCategory) => {
    const updated = categories.map((cat) => 
      cat.id === selectedCategory.id ? updatedCategory : cat
    );
    setCategories(updated);
    setShowEditModal(false);
    setSelectedCategory(null);
  };

  const handleDeleteCategory = () => {
    const updated = categories.filter((cat) => cat.id !== selectedCategory.id);
    setCategories(updated);
    setShowDeleteModal(false);
    setSelectedCategory(null);
  };

  const handleOpenEdit = (category) => {
    setSelectedCategory(category);
    setShowEditModal(true);
  };

  const handleOpenDelete = (category) => {
    setSelectedCategory(category);
    setShowDeleteModal(true);
  };

  // Simple Delete Modal (you can create a separate component for this)
  const DeleteConfirmationModal = () => (
    <div className="modal fade show d-block" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }} tabIndex="-1">
      <div className="modal-dialog modal-dialog-centered">
        <div className="modal-content rounded-3">
          <div className="modal-header border-bottom pb-3">
            <h5 className="modal-title fw-bold fs-5">Delete Metal Type</h5>
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
            <p>Are you sure you want to delete <strong>{selectedCategory?.name}</strong>?</p>
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
              onClick={() => handleDeleteCategory()}
            >
              Delete
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
              <h1 className="h3 fw-bold mb-2">Metal Types</h1>
              <p className="text-muted mb-0">
                Manage your metal types in a table layout
              </p>
            </div>

            <div className="col-md-6 d-flex justify-content-end gap-2">
              <button
                className="btn btn-primary d-flex align-items-center gap-2"
                onClick={() => setShowAddModal(true)}
              >
                <FiPlus size={18} />
                Add Metal Type
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
                  placeholder="Search metal types..."
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
                <th>Metal Name</th>
                <th className="text-end">Actions</th>
              </tr>
            </thead>

            <tbody>
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan="4" className="text-center py-4 text-muted">
                    No metal types found
                  </td>
                </tr>
              ) : (
                filtered.map((category, index) => (
                  <tr key={category.id}>
                    <td>{index + 1}</td>

                    {/* IMAGE PREVIEW */}
                    <td>
                      {category.image ? (
                        <img
                          src={category.image}
                          alt={category.name}
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
                          <span className="text-muted small">No Image</span>
                        </div>
                      )}
                    </td>

                    <td className="fw-semibold">{category.name}</td>

                    {/* ACTION BUTTONS */}
                    <td>
                      <div className="d-flex justify-content-end gap-2">
                        <button
                          className="btn btn-sm btn-outline-primary d-flex align-items-center gap-1"
                          onClick={() => handleOpenEdit(category)}  // FIXED: Call the function
                        >
                          <FiEdit2 size={16} />
                          Edit
                        </button>

                        <button
                          className="btn btn-sm btn-outline-danger d-flex align-items-center gap-1"
                          onClick={() => handleOpenDelete(category)}  // FIXED: Call the function
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
        <AddMetalTypeModal
          onClose={() => setShowAddModal(false)}
          onSave={handleSave}
          loading={loading}
        />
      )}

      {/* EDIT MODAL */}
      {showEditModal && selectedCategory && (
        <EditMetalTypeModal
          show={showEditModal}
          onHide={() => {
            setShowEditModal(false);
            setSelectedCategory(null);
          }}
          onSubmit={handleEditCategory}
          metalType={selectedCategory}
        />
      )}

      {/* DELETE MODAL */}
      {showDeleteModal && selectedCategory && (
        <DeleteConfirmationModal />
      )}

    </div>
  );
}