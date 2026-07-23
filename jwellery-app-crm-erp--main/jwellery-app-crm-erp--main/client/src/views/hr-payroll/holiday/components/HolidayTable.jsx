// components/hr/HolidayTable.jsx
import React, { useState } from "react";
import {
  FiEdit2,
  FiSearch,
  FiPlus,
  FiCalendar,
  FiRepeat,
} from "react-icons/fi";
import { RiDeleteBin6Line, RiFlagLine } from "react-icons/ri";
import { useHoliday } from "@/hooks/useHoliday";
import AddHolidayForm from "./AddHolidayForm";
import EditHolidayForm from "./EditHolidayForm";
import { Link } from "react-router";

export default function HolidayTable() {
  const {
    holidays,
    departments,
    designations,
    loading,
    addHoliday,
    updateHoliday,
    deleteHoliday,
  } = useHoliday();

  const [search, setSearch] = useState("");
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null);
  const [actionLoading, setActionLoading] = useState({ type: null, id: null });

  console.log("Raw API Holidays:", holidays);

  // Transform API response to match holiday structure
  const transformHolidayData = (apiData) => {
    return (apiData || []).map((item) => ({
      _id: item._id,
      holiday_name: item.occasion || "Unnamed Holiday",
      holiday_date: item.occasion_date,
      is_recurring: false, // Default value as API doesn't provide this
      department_ids: item.department_id || [],
      departments: item.department_id || [],
      designation_ids: item.designation_id ? [item.designation_id._id] : [],
      designations: item.designation_id ? [item.designation_id] : [],
      employment_types: item.employment_types || item.employment_type || [],
      is_active: item.status === "active",
      status: item.status,
      description: item.description,
    }));
  };

  const transformedHolidays = transformHolidayData(holidays);

  // Filter holidays by search
  const filteredHolidays = (transformedHolidays || []).filter(
    (item) =>
      (item?.occasion || "").toLowerCase().includes(search.toLowerCase()) ||
      (item?.occasion_date || "").includes(search) ||
      (item?.description || "").toLowerCase().includes(search.toLowerCase()),
  );

  // Handle update with loading state
  const handleUpdate = async (holidayData) => {
    if (!selectedItem) return;

    setActionLoading({ type: "update", id: selectedItem._id });
    try {
      await updateHoliday(selectedItem._id, holidayData);
      setShowEditModal(false);
      setSelectedItem(null);
    } catch (error) {
      console.error("Update failed:", error);
    } finally {
      setActionLoading({ type: null, id: null });
    }
  };

  // Handle add with loading state
  const handleAdd = async (holidayData) => {
    setActionLoading({ type: "add", id: null });
    try {
      await addHoliday(holidayData);
      setShowAddModal(false);
    } catch (error) {
      console.error("Add failed:", error);
    } finally {
      setActionLoading({ type: null, id: null });
    }
  };

  // Handle delete with confirmation modal
  const handleDelete = async () => {
    if (!selectedItem) return;

    setActionLoading({ type: "delete", id: selectedItem._id });
    try {
      await deleteHoliday(selectedItem._id);
      setShowDeleteModal(false);
      setSelectedItem(null);
    } catch (error) {
      console.error("Delete failed:", error);
    } finally {
      setActionLoading({ type: null, id: null });
    }
  };

  // Open edit modal
  const handleOpenEdit = (item) => {
    if (!item) return;
    setSelectedItem(item);
    setShowEditModal(true);
  };

  // Open delete modal
  const handleOpenDelete = (item) => {
    if (!item) return;
    setSelectedItem(item);
    setShowDeleteModal(true);
  };

  // Format date
  const formatDate = (date) => {
    if (!date) return "N/A";
    const d = new Date(date);
    const day = String(d.getDate()).padStart(2, "0");
    const month = String(d.getMonth() + 1).padStart(2, "0");
    const year = d.getFullYear();
    return `${day}-${month}-${year}`;
  };

  // Get day of week
  const getDayOfWeek = (date) => {
    if (!date) return "";
    const days = [
      "Sunday",
      "Monday",
      "Tuesday",
      "Wednesday",
      "Thursday",
      "Friday",
      "Saturday",
    ];
    return days[new Date(date).getDay()];
  };

  // Check if holiday is upcoming
  const isUpcoming = (date) => {
    return new Date(date) >= new Date();
  };

  // Get holiday badge color based on month/season
  const getHolidayColor = (name) => {
    const colors = [
      "bg-danger-subtle text-danger",
      "bg-success-subtle text-success",
      "bg-info-subtle text-info",
      "bg-warning-subtle text-warning",
      "bg-primary-subtle text-primary",
      "bg-secondary-subtle text-secondary",
    ];

    const hash =
      name?.split("").reduce((acc, char) => {
        return char.charCodeAt(0) + ((acc << 5) - acc);
      }, 0) || 0;

    return colors[Math.abs(hash) % colors.length];
  };

  // Format department names
  const formatDepartments = (departments) => {
    if (!departments || departments.length === 0) return "All";
    return departments.map((dept) => dept.department_name).join(", ");
  };

  // Format designation names
  const formatDesignations = (designations) => {
    if (!designations || designations.length === 0) return "All";
    return designations.map((des) => des.designation_name).join(", ");
  };

  // Delete Confirmation Modal Component
  const DeleteConfirmationModal = () => (
    <div
      className="modal fade show d-block"
      style={{ backgroundColor: "rgba(0,0,0,0.5)" }}
      tabIndex="-1"
    >
      <div className="modal-dialog modal-dialog-centered">
        <div className="modal-content rounded-3">
          <div className="modal-header border-bottom pb-3">
            <h5 className="modal-title fw-bold fs-5">Delete Holiday</h5>
            <button
              type="button"
              className="btn-close"
              onClick={() => {
                setShowDeleteModal(false);
                setSelectedItem(null);
              }}
              disabled={actionLoading.type === "delete"}
            ></button>
          </div>

          <div className="modal-body">
            <p>
              Are you sure you want to delete holiday{" "}
              <strong className="text-danger">
                {selectedItem?.holiday_name}
              </strong>
              ?
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
              onClick={handleDelete}
              disabled={actionLoading.type === "delete"}
            >
              {actionLoading.type === "delete" ? (
                <>
                  <span className="spinner-border spinner-border-sm me-2"></span>
                  Deleting...
                </>
              ) : (
                "Delete Holiday"
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
              <h1 className="h3 fw-bold mb-2">
                <span className="text-primary">#</span> Holiday Management
              </h1>
              <p className="text-muted mb-0">
                Manage company holidays and observances
              </p>
            </div>

            <div className="col-md-6 d-flex justify-content-end gap-2">
              <button
                className="btn btn-primary d-flex align-items-center gap-2"
                onClick={() => setShowAddModal(true)}
                disabled={loading || actionLoading.type === "add"}
              >
                <FiPlus size={18} />
                Add Holiday
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
                  placeholder="Search holidays..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  disabled={loading}
                />
              </div>
            </div>

            <div className="col-md-8 d-flex justify-content-end gap-2">
              <Link to="/hr/holidays">
                <button
                  className="btn btn-l btn-outline-secondary"
                  data-bs-toggle="tooltip"
                  data-bs-placement="top"
                  title="Calendar"
                >
                  <FiCalendar size={16} />
                </button>
              </Link>
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
                <th style={{ width: "60px" }}>#</th>
                <th>Holiday Name</th>
                <th>Date</th>
                <th>Day</th>
                <th>Departments</th>
                <th>Designations</th>
                <th>Employment Types</th>
                <th>Status</th>
                <th style={{ width: "120px" }} className="text-end">
                  Actions
                </th>
              </tr>
            </thead>

            <tbody>
              {loading && transformedHolidays.length === 0 ? (
                <tr>
                  <td colSpan="10" className="text-center py-4">
                    <div className="spinner-border text-primary">
                      <span className="visually-hidden">Loading...</span>
                    </div>
                  </td>
                </tr>
              ) : filteredHolidays.length === 0 ? (
                <tr>
                  <td colSpan="10" className="text-center py-4 text-muted">
                    {search ? "No holidays found" : "No holidays available"}
                  </td>
                </tr>
              ) : (
                holidays.map((item, index) => (
                  <tr key={item._id || index}>
                    <td>
                      <span className="fw-medium text-muted">{index + 1}</span>
                    </td>
                    <td>{item.occasion || "Unnamed Holiday"}</td>
                    <td>
                      <span className="fw-medium">
                        {formatDate(item.occasion_date)}
                      </span>
                    </td>
                    <td>
                      <span className="badge bg-light text-dark">
                        {getDayOfWeek(item.occasion_date)}
                      </span>
                    </td>

                    <td>{item.department_name}</td>
                    <td>{item.designation_name}</td>
                    <td>{item.employment_type}</td>
                    <td>
                      <span
                        className={`badge ${item.status === "active" ? "bg-success-subtle text-success" : "bg-secondary-subtle text-secondary"}`}
                      >
                        {item.status === "active" ? "Active" : "Inactive"}
                      </span>
                    </td>

                    {/* ACTION BUTTONS */}
                    <td>
                      <div className="d-flex justify-content-end gap-2">
                        <button
                          className="btn btn-sm btn-outline-primary"
                          onClick={() => handleOpenEdit(item)}
                          disabled={
                            actionLoading.type && actionLoading.id === item._id
                          }
                          title="Edit"
                        >
                          {actionLoading.type === "update" &&
                          actionLoading.id === item._id ? (
                            <span className="spinner-border spinner-border-sm"></span>
                          ) : (
                            <FiEdit2 size={16} />
                          )}
                        </button>

                        <button
                          className="btn btn-sm btn-outline-danger"
                          onClick={() => handleOpenDelete(item)}
                          disabled={
                            actionLoading.type && actionLoading.id === item._id
                          }
                          title="Delete"
                        >
                          {actionLoading.type === "delete" &&
                          actionLoading.id === item._id ? (
                            <span className="spinner-border spinner-border-sm"></span>
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
        </div>
      </div>

      {/* MODALS */}
      {showAddModal && (
        <AddHolidayForm
          onClose={() => setShowAddModal(false)}
          onSave={handleAdd}
          loading={actionLoading.type === "add"}
          departments={departments}
          designations={designations}
        />
      )}

      {showEditModal && selectedItem && (
        <EditHolidayForm
          show={showEditModal}
          onHide={() => {
            setShowEditModal(false);
            setSelectedItem(null);
          }}
          onSubmit={handleUpdate}
          holiday={selectedItem}
          departments={departments}
          designations={designations}
          loading={
            actionLoading.type === "update" &&
            actionLoading.id === selectedItem._id
          }
        />
      )}

      {showDeleteModal && selectedItem && <DeleteConfirmationModal />}
    </div>
  );
}
