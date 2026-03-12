// components/hr/EditLeaveForm.jsx
import React, { useState, useEffect } from "react";
import { FiUpload, FiCalendar, FiFile, FiX } from "react-icons/fi";
import { toast } from "react-toastify";

const EditLeaveForm = ({
  show,
  onHide,
  onSubmit,
  leaveRequest,
  employees = [],
  leaveTypes = [],
  loading = false,
}) => {
  const [formData, setFormData] = useState({
    employee_id: "",
    leave_type_id: "",
    duration_type: "full_day",
    from_date: "",
    to_date: "",
    reason: "",
    attachment: null,
    status: "pending",
  });

  const [errors, setErrors] = useState({});
  const [selectedEmployee, setSelectedEmployee] = useState(null);
  const [attachmentPreview, setAttachmentPreview] = useState(null);
  const [showMultipleDate, setShowMultipleDate] = useState(false);
  const [existingAttachment, setExistingAttachment] = useState(null);

  console.log(leaveRequest);

  // Initialize form when leaveRequest changes
  useEffect(() => {
    if (leaveRequest) {
      setFormData({
        employee_id:
          leaveRequest.employee_id?._id || leaveRequest.employee_id || "",
        leave_type_id:
          leaveRequest.leave_type_id?._id || leaveRequest.leave_type_id || "",
        duration_type: leaveRequest.duration_type || "full_day",
        from_date: leaveRequest.from_date
          ? leaveRequest.from_date.split("T")[0]
          : "",
        to_date: leaveRequest.to_date ? leaveRequest.to_date.split("T")[0] : "",
        reason: leaveRequest.reason || "",
        attachment: null,
        status: leaveRequest.status,
      });

      // Set selected employee
      if (leaveRequest.employee_id) {
        const employee = employees.find(
          (emp) =>
            emp._id ===
            (leaveRequest.employee_id._id || leaveRequest.employee_id),
        );
        setSelectedEmployee(employee || leaveRequest.employee_id);
      }

      // Set existing attachment info
      if (leaveRequest.attachment) {
        setExistingAttachment(leaveRequest.attachment);
      }

      setErrors({});
    }
  }, [leaveRequest, employees]);

  // Handle duration type change
  useEffect(() => {
    setShowMultipleDate(formData.duration_type === "multiple");
    if (formData.duration_type !== "multiple") {
      setFormData((prev) => ({ ...prev, to_date: "" }));
    }
  }, [formData.duration_type]);

  // Update selected employee when employee_id changes
  useEffect(() => {
    if (formData.employee_id) {
      const employee = employees.find(
        (emp) => emp._id === formData.employee_id,
      );
      setSelectedEmployee(employee);
    } else {
      setSelectedEmployee(null);
    }
  }, [formData.employee_id, employees]);

  const validateForm = () => {
    const newErrors = {};

    if (!formData.employee_id) {
      newErrors.employee_id = "Please select an employee";
    }

    if (!formData.leave_type_id) {
      newErrors.leave_type_id = "Please select leave type";
    }

    if (!formData.from_date) {
      newErrors.from_date = "Please select date";
    }

    if (formData.duration_type === "multiple" && !formData.to_date) {
      newErrors.to_date = "Please select end date";
    }

    if (
      formData.duration_type === "multiple" &&
      formData.from_date &&
      formData.to_date &&
      new Date(formData.to_date) < new Date(formData.from_date)
    ) {
      newErrors.to_date = "End date cannot be before start date";
    }

    if (!formData.reason.trim()) {
      newErrors.reason = "Please provide a reason for absence";
    }

    setErrors(newErrors);
    if (Object.keys(newErrors).length > 0) {
      toast.error(Object.values(newErrors)[0]);
    }
    return Object.keys(newErrors).length === 0;
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        setErrors((prev) => ({
          ...prev,
          attachment: "File size should be less than 5MB",
        }));
        return;
      }

      setFormData((prev) => ({ ...prev, attachment: file }));
      setAttachmentPreview(file.name);
      setExistingAttachment(null); // Remove existing attachment reference

      if (errors.attachment) {
        setErrors((prev) => ({ ...prev, attachment: "" }));
      }
    }
  };

  const removeAttachment = () => {
    setFormData((prev) => ({ ...prev, attachment: null }));
    setAttachmentPreview(null);
    setExistingAttachment(null);
  };

  const removeExistingAttachment = () => {
    setExistingAttachment(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    try {
      const payload = {
        employee_id: formData.employee_id,
        leave_type_id: formData.leave_type_id,
        duration_type: formData.duration_type,
        from_date: formData.from_date,
        to_date: formData.to_date || formData.from_date,
        reason: formData.reason.trim(),
        attachment: formData.attachment,
        status: formData.status,
      };

      // Only include attachment if it's a new file
      if (!formData.attachment && existingAttachment) {
        payload.attachment = existingAttachment;
      }

      console.log("Updating leave data:", payload);
      await onSubmit(leaveRequest._id, payload);

      //   resetForm();
    } catch (error) {
      console.error("Error updating leave:", error);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));

    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: "" }));
    }
  };

  const resetForm = () => {
    setFormData({
      employee_id: "",
      leave_type_id: "",
      duration_type: "full_day",
      from_date: "",
      to_date: "",
      reason: "",
      attachment: null,
      status: "Pending",
    });
    setAttachmentPreview(null);
    setExistingAttachment(null);
    setErrors({});
  };

  const handleClose = () => {
    resetForm();
    onHide();
  };

  // Get leave type by ID
  const getLeaveTypeById = (id) => {
    return leaveTypes.find((type) => type._id === id);
  };

  // Get attachment file name from path
  const getAttachmentFileName = (attachmentPath) => {
    if (!attachmentPath) return "";
    return attachmentPath.split("/").pop() || attachmentPath;
  };

  // Don't render if not shown
  if (!show) return null;

  return (
    <div
      className="modal fade show d-block"
      style={{ backgroundColor: "rgba(0,0,0,0.5)" }}
      tabIndex="-1"
    >
      <div className="modal-dialog modal-dialog-centered modal-lg">
        <div className="modal-content rounded-3">
          <div className="modal-header border-bottom pb-3">
            <h5 className="modal-title fw-bold fs-5"># Edit Leave Request</h5>
            <button
              type="button"
              className="btn-close"
              onClick={handleClose}
              disabled={loading}
              aria-label="Close"
            ></button>
          </div>

          <form onSubmit={handleSubmit}>
            <div className="modal-body">
              {/* Assign Leave Header */}
              <div className="mb-4">
                <h6 className="fw-semibold text-primary mb-3">
                  Edit Leave Details
                </h6>
              </div>

              <div className="row">
                {/* Name - Employee Selection */}
                <div className="col-6 mb-4">
                  <label className="form-label fw-medium mb-2">Name</label>
                  <select
                    name="employee_id"
                    className={`form-control form-control-lg ${
                      errors.employee_id ? "is-invalid" : ""
                    }`}
                    value={formData.employee_id}
                    onChange={handleChange}
                    disabled={loading || employees.length === 0}
                  >
                    <option value="">Select Employee</option>
                    {employees.map((emp) => (
                      <option key={emp._id} value={emp._id}>
                        {emp.name}
                      </option>
                    ))}
                  </select>
                  {errors.employee_id && (
                    <div className="invalid-feedback">{errors.employee_id}</div>
                  )}
                  {selectedEmployee && (
                    <div className="mt-2 text-muted small">
                      Employee ID:{" "}
                      {selectedEmployee.employee_id || selectedEmployee._id}
                    </div>
                  )}
                </div>

                {/* Leave Type */}
                <div className="col-6 mb-4">
                  <label className="form-label fw-medium mb-2">
                    Leave Type
                  </label>
                  <select
                    name="leave_type_id"
                    className={`form-control form-control-lg ${
                      errors.leave_type_id ? "is-invalid" : ""
                    }`}
                    value={formData.leave_type_id}
                    onChange={handleChange}
                    disabled={loading}
                  >
                    <option value="">Select Leave Type</option>
                    {leaveTypes.length > 0 &&
                      leaveTypes.map((type) => {
                        const balance = type.no_of_leaves || 0;
                        return (
                          <option key={type._id} value={type._id}>
                            {type.leave_type_name}{" "}
                            {balance > 0 && `(${balance})`}
                          </option>
                        );
                      })}
                  </select>
                  {errors.leave_type_id && (
                    <div className="invalid-feedback">
                      {errors.leave_type_id}
                    </div>
                  )}
                </div>

                {/* Select Duration */}
                <div className="col-12 mb-4">
                  <label className="form-label fw-medium mb-2">
                    Select Duration
                  </label>
                  <div className="d-flex flex-wrap gap-3">
                    <div className="form-check">
                      <input
                        className="form-check-input"
                        type="radio"
                        name="duration_type"
                        id="editFullDay"
                        value="full_day"
                        checked={formData.duration_type === "full_day"}
                        onChange={handleChange}
                        disabled={loading}
                      />
                      <label className="form-check-label" htmlFor="editFullDay">
                        Full Day
                      </label>
                    </div>
                    <div className="form-check">
                      <input
                        className="form-check-input"
                        type="radio"
                        name="duration_type"
                        id="editMultiple"
                        value="multiple"
                        checked={formData.duration_type === "multiple"}
                        onChange={handleChange}
                        disabled={loading}
                      />
                      <label
                        className="form-check-label"
                        htmlFor="editMultiple"
                      >
                        Multiple
                      </label>
                    </div>
                    <div className="form-check">
                      <input
                        className="form-check-input"
                        type="radio"
                        name="duration_type"
                        id="editFirstHalf"
                        value="first_half"
                        checked={formData.duration_type === "first_half"}
                        onChange={handleChange}
                        disabled={loading}
                      />
                      <label
                        className="form-check-label"
                        htmlFor="editFirstHalf"
                      >
                        First Half
                      </label>
                    </div>
                    <div className="form-check">
                      <input
                        className="form-check-input"
                        type="radio"
                        name="duration_type"
                        id="editSecondHalf"
                        value="second_half"
                        checked={formData.duration_type === "second_half"}
                        onChange={handleChange}
                        disabled={loading}
                      />
                      <label
                        className="form-check-label"
                        htmlFor="editSecondHalf"
                      >
                        Second Half
                      </label>
                    </div>
                  </div>
                </div>

                {/* Date Selection */}
                <div className="col-md-6 mb-4">
                  <label className="form-label fw-medium mb-2">
                    {showMultipleDate ? "From Date" : "Date"}{" "}
                    <span className="text-danger">*</span>
                  </label>
                  <div className="input-group">
                    <span className="input-group-text">
                      <FiCalendar />
                    </span>
                    <input
                      type="date"
                      name="from_date"
                      className={`form-control form-control-lg ${
                        errors.from_date ? "is-invalid" : ""
                      }`}
                      value={formData.from_date}
                      onChange={handleChange}
                      disabled={loading}
                    />
                  </div>
                  {errors.from_date && (
                    <div className="invalid-feedback d-block">
                      {errors.from_date}
                    </div>
                  )}
                </div>

                {/* To Date - Only for Multiple */}
                {showMultipleDate && (
                  <div className="col-md-6 mb-4">
                    <label className="form-label fw-medium mb-2">
                      To Date <span className="text-danger">*</span>
                    </label>
                    <div className="input-group">
                      <span className="input-group-text">
                        <FiCalendar />
                      </span>
                      <input
                        type="date"
                        name="to_date"
                        className={`form-control form-control-lg ${
                          errors.to_date ? "is-invalid" : ""
                        }`}
                        value={formData.to_date}
                        onChange={handleChange}
                        disabled={loading}
                        min={formData.from_date}
                      />
                    </div>
                    {errors.to_date && (
                      <div className="invalid-feedback d-block">
                        {errors.to_date}
                      </div>
                    )}
                  </div>
                )}

                {/* Reason for absence */}
                <div className="col-12 mb-4">
                  <label className="form-label fw-medium mb-2">
                    Reason for absence <span className="text-danger">*</span>
                  </label>
                  <textarea
                    name="reason"
                    className={`form-control form-control-lg ${
                      errors.reason ? "is-invalid" : ""
                    }`}
                    rows="3"
                    placeholder="e.g. Feeling not well"
                    value={formData.reason}
                    onChange={handleChange}
                    disabled={loading}
                  ></textarea>
                  {errors.reason && (
                    <div className="invalid-feedback d-block">
                      {errors.reason}
                    </div>
                  )}
                </div>

                {/* Add File Section */}
                <div className="col-12 mb-4">
                  <label className="form-label fw-medium mb-2">Add File</label>

                  {/* Show existing attachment */}
                  {existingAttachment && !attachmentPreview && (
                    <div className="border rounded-3 p-3 d-flex align-items-center justify-content-between bg-light mb-2">
                      <div className="d-flex align-items-center gap-2">
                        <FiFile className="text-primary" size={20} />
                        <span
                          className="text-truncate"
                          style={{ maxWidth: "300px" }}
                        >
                          {getAttachmentFileName(existingAttachment)}
                        </span>
                        <span className="badge bg-info text-white ms-2">
                          Existing
                        </span>
                      </div>
                      <button
                        type="button"
                        className="btn btn-sm btn-outline-danger"
                        onClick={removeExistingAttachment}
                        disabled={loading}
                      >
                        <FiX size={16} />
                      </button>
                    </div>
                  )}

                  {/* New attachment upload */}
                  {!attachmentPreview ? (
                    <div className="border rounded-3 p-4 text-center bg-light">
                      <input
                        type="file"
                        id="editFileUpload"
                        className="d-none"
                        onChange={handleFileChange}
                        disabled={loading}
                      />
                      <label
                        htmlFor="editFileUpload"
                        className="d-flex flex-column align-items-center cursor-pointer"
                        style={{ cursor: "pointer" }}
                      >
                        <FiFile size={32} className="text-primary mb-2" />
                        <span className="text-primary fw-medium">
                          {existingAttachment
                            ? "Replace file"
                            : "Choose a file"}
                        </span>
                        <span className="text-muted small mt-1">
                          Upload supporting documents (PDF, images, max 5MB)
                        </span>
                      </label>
                    </div>
                  ) : (
                    <div className="border rounded-3 p-3 d-flex align-items-center justify-content-between bg-light">
                      <div className="d-flex align-items-center gap-2">
                        <FiFile className="text-primary" size={20} />
                        <span
                          className="text-truncate"
                          style={{ maxWidth: "300px" }}
                        >
                          {attachmentPreview}
                        </span>
                        <span className="badge bg-warning text-dark ms-2">
                          New
                        </span>
                      </div>
                      <button
                        type="button"
                        className="btn btn-sm btn-outline-danger"
                        onClick={removeAttachment}
                        disabled={loading}
                      >
                        <FiX size={16} />
                      </button>
                    </div>
                  )}
                  {errors.attachment && (
                    <div className="text-danger small mt-2">
                      {errors.attachment}
                    </div>
                  )}
                </div>

                {/* Status */}
                <div className="col-12 mb-4">
                  <label className="form-label fw-medium mb-2">Status</label>
                  <select
                    name="status"
                    className="form-control form-control-lg"
                    value={formData.status}
                    onChange={handleChange}
                    disabled={loading}
                  >
                    <option value="pending">Pending</option>
                    <option value="approved">Approved</option>
                    <option value="rejected">Rejected</option>
                  </select>
                </div>
              </div>
            </div>

            <div className="modal-footer border-top pt-3">
              <button
                type="button"
                className="btn btn-outline-secondary"
                onClick={handleClose}
                disabled={loading}
              >
                Cancel
              </button>
              <button
                type="submit"
                className="btn btn-primary d-flex align-items-center gap-2"
                disabled={loading}
              >
                {loading ? (
                  <>
                    <span
                      className="spinner-border spinner-border-sm"
                      role="status"
                      aria-hidden="true"
                    ></span>
                    Updating...
                  </>
                ) : (
                  <>
                    <FiUpload size={16} />
                    Update Leave
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default EditLeaveForm;
