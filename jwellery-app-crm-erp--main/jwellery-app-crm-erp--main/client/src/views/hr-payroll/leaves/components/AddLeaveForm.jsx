// components/hr/AddLeaveForm.jsx
import React, { useState, useEffect } from "react";
import { FiUpload, FiCalendar, FiFile, FiX } from "react-icons/fi";
import { toast } from "react-toastify";

const AddLeaveForm = ({
  onClose,
  onSave,
  loading = false,
  employees = [],
  leaveTypes = [],
}) => {
  const [formData, setFormData] = useState({
    employee_id: "",
    leave_type_id: "",
    duration_type: "full_day", // full_day, multiple, first_half, second_half
    from_date: "",
    to_date: "",
    reason: "",
    attachment: null,
    status: "pending",
  });

  console.log(leaveTypes);

  const [errors, setErrors] = useState({});
  const [selectedEmployee, setSelectedEmployee] = useState(null);
  const [leaveBalance, setLeaveBalance] = useState(null);
  const [attachmentPreview, setAttachmentPreview] = useState(null);
  const [showMultipleDate, setShowMultipleDate] = useState(false);

  // Set default employee if provided
  // useEffect(() => {
  //   if (employees.length > 0 && !formData.employee_id) {
  //     const defaultEmployee = employees[0];
  //     setFormData(prev => ({
  //       ...prev,
  //       employee_id: defaultEmployee._id
  //     }));
  //     setSelectedEmployee(defaultEmployee);
  //   }
  // }, [employees]);

  // Update selected employee when employee_id changes
  // useEffect(() => {
  //   if (formData.employee_id) {
  //     const employee = employees.find(emp => emp._id === formData.employee_id);
  //     setSelectedEmployee(employee);

  //     // Fetch leave balance for this employee
  //     if (formData.leave_type_id) {
  //       fetchLeaveBalance(employee._id, formData.leave_type_id);
  //     }
  //   } else {
  //     setSelectedEmployee(null);
  //     setLeaveBalance(null);
  //   }
  // }, [formData.employee_id, employees]);

  // Update leave balance when leave type changes
  // useEffect(() => {
  //   if (formData.employee_id && formData.leave_type_id) {
  //     fetchLeaveBalance(formData.employee_id, formData.leave_type_id);
  //   } else {
  //     setLeaveBalance(null);
  //   }
  // }, [formData.leave_type_id]);

  // Handle duration type change
  useEffect(() => {
    setShowMultipleDate(formData.duration_type === "multiple");
    if (formData.duration_type !== "multiple") {
      setFormData((prev) => ({ ...prev, to_date: "" }));
    }
  }, [formData.duration_type]);

  // const fetchLeaveBalance = async (employeeId, leaveTypeId) => {
  //   // This would be replaced with actual API call
  //   const balance = {
  //     total: 12,
  //     used: 5,
  //     remaining: 7,
  //   };
  //   setLeaveBalance(balance);
  // };

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

      if (errors.attachment) {
        setErrors((prev) => ({ ...prev, attachment: "" }));
      }
    }
  };

  const removeAttachment = () => {
    setFormData((prev) => ({ ...prev, attachment: null }));
    setAttachmentPreview(null);
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

      console.log("Submitting leave data:", payload);
      await onSave(payload);

      // resetForm();
    } catch (error) {
      console.error("Error applying leave:", error);
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
      employee_id: employees.length > 0 ? employees[0]._id : "",
      leave_type_id: "",
      duration_type: "full_day",
      from_date: "",
      to_date: "",
      reason: "",
      attachment: null,
    });
    setAttachmentPreview(null);
    setErrors({});
  };

  const handleClose = () => {
    resetForm();
    onClose();
  };

  // Get leave type by ID
  const getLeaveTypeById = (id) => {
    return leaveTypes.find((type) => type._id === id);
  };

  // Format date for display
  const formatDate = (date) => {
    if (!date) return "";
    const d = new Date(date);
    const day = String(d.getDate()).padStart(2, "0");
    const month = String(d.getMonth() + 1).padStart(2, "0");
    const year = d.getFullYear();
    return `${day}-${month}-${year}`;
  };

  return (
    <div
      className="modal fade show d-block"
      style={{ backgroundColor: "rgba(0,0,0,0.5)" }}
      tabIndex="-1"
    >
      <div className="modal-dialog modal-dialog-centered modal-lg">
        <div className="modal-content rounded-3">
          <div className="modal-header border-bottom pb-3">
            <h5 className="modal-title fw-bold fs-5"># New Leave</h5>
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
                <h6 className="fw-semibold text-primary mb-3">Assign Leave</h6>
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

                    {/* Show API data when available */}
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
                        id="fullDay"
                        value="full_day"
                        checked={formData.duration_type === "full_day"}
                        onChange={handleChange}
                        disabled={loading}
                      />
                      <label className="form-check-label" htmlFor="fullDay">
                        Full Day
                      </label>
                    </div>
                    <div className="form-check">
                      <input
                        className="form-check-input"
                        type="radio"
                        name="duration_type"
                        id="multiple"
                        value="multiple"
                        checked={formData.duration_type === "multiple"}
                        onChange={handleChange}
                        disabled={loading}
                      />
                      <label className="form-check-label" htmlFor="multiple">
                        Multiple
                      </label>
                    </div>
                    <div className="form-check">
                      <input
                        className="form-check-input"
                        type="radio"
                        name="duration_type"
                        id="firstHalf"
                        value="first_half"
                        checked={formData.duration_type === "first_half"}
                        onChange={handleChange}
                        disabled={loading}
                      />
                      <label className="form-check-label" htmlFor="firstHalf">
                        First Half
                      </label>
                    </div>
                    <div className="form-check">
                      <input
                        className="form-check-input"
                        type="radio"
                        name="duration_type"
                        id="secondHalf"
                        value="second_half"
                        checked={formData.duration_type === "second_half"}
                        onChange={handleChange}
                        disabled={loading}
                      />
                      <label className="form-check-label" htmlFor="secondHalf">
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
                      min={new Date().toISOString().split("T")[0]}
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
                        min={
                          formData.from_date ||
                          new Date().toISOString().split("T")[0]
                        }
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

                  {!attachmentPreview ? (
                    <div className="border rounded-3 p-4 text-center bg-light">
                      <input
                        type="file"
                        id="fileUpload"
                        className="d-none"
                        onChange={handleFileChange}
                        disabled={loading}
                      />
                      <label
                        htmlFor="fileUpload"
                        className="d-flex flex-column align-items-center cursor-pointer"
                        style={{ cursor: "pointer" }}
                      >
                        <FiFile size={32} className="text-primary mb-2" />
                        <span className="text-primary fw-medium">
                          Choose a file
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

                {/* {Status} */}
                <div className="col-12 mb-4">
                  <label className="form-label fw-medium mb-2">Status</label>

                  <select
                    name="status"
                    id="status"
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
                    Applying...
                  </>
                ) : (
                  <>
                    <FiUpload size={16} />
                    Save
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

export default AddLeaveForm;
