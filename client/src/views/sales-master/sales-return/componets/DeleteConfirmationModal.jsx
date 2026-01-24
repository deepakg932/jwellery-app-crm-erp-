// components/DeleteConfirmationModal.jsx
import React from "react";
import { FiAlertTriangle } from "react-icons/fi";

const DeleteConfirmationModal = ({
  show,
  onHide,
  onConfirm,
  loading,
  title = "Confirm Delete",
  message = "Are you sure you want to delete this item?",
  confirmText = "Delete",
  cancelText = "Cancel"
}) => {
  if (!show) return null;

  return (
    <div className="modal fade show d-block" tabIndex="-1" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
      <div className="modal-dialog modal-dialog-centered">
        <div className="modal-content border-0 shadow">
          <div className="modal-header border-0 pb-0">
            <h5 className="modal-title text-danger">
              <FiAlertTriangle className="me-2" />
              {title}
            </h5>
            <button
              type="button"
              className="btn-close"
              onClick={onHide}
              disabled={loading}
            ></button>
          </div>
          <div className="modal-body py-4">
            <div className="text-center">
              <FiAlertTriangle size={48} className="text-danger mb-3" />
              <p className="mb-0">{message}</p>
            </div>
          </div>
          <div className="modal-footer border-0 pt-0">
            <button
              type="button"
              className="btn btn-outline-secondary"
              onClick={onHide}
              disabled={loading}
            >
              {cancelText}
            </button>
            <button
              type="button"
              className="btn btn-danger"
              onClick={onConfirm}
              disabled={loading}
            >
              {loading ? (
                <>
                  <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                  Deleting...
                </>
              ) : (
                confirmText
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DeleteConfirmationModal;