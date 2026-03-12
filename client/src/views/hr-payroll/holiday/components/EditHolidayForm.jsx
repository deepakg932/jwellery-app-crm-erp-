// components/hr/EditHolidayForm.jsx
import React, { useState, useEffect } from "react";
import { FiCalendar, FiSave, FiX } from "react-icons/fi";
import { toast } from "react-toastify";
import Select from "react-select";

const EditHolidayForm = ({
  show,
  onHide,
  onSubmit,
  holiday,
  departments = [],
  designations = [],
  loading = false,
}) => {
  const [formData, setFormData] = useState({
    occasion: "",
    occasion_date: "",
    department_ids: [], // Changed to array
    designation_ids: [], // Changed to array for multi-select
    employment_types: [], // Changed to array
    description: "",
  });

  const [errors, setErrors] = useState({});
  const [selectedDepartments, setSelectedDepartments] = useState([]);
  const [selectedDesignations, setSelectedDesignations] = useState([]);
  const [selectedEmploymentTypes, setSelectedEmploymentTypes] = useState([]);

  // Transform departments for react-select
  const departmentOptions = departments.map((dept) => ({
    value: dept._id,
    label: dept.department_name,
  }));

  // Transform designations for react-select
  const designationOptions = designations.map((des) => ({
    value: des._id,
    label: des.designation_name,
  }));

  // Employment type options for react-select
  const employmentTypeOptions = [
    { value: "Full Time", label: "Full Time" },
    { value: "Part Time", label: "Part Time" },
    { value: "Internship", label: "Internship" },
    { value: "Contract", label: "Contract" },
  ];

  // Initialize form when holiday data changes
  useEffect(() => {
    if (holiday) {
      // Helper function to extract department IDs
      const getDepartmentIds = () => {
        if (!holiday.department_id) return [];

        // If it's an array of objects with _id
        if (Array.isArray(holiday.department_id)) {
          return holiday.department_id.map((d) => d._id || d);
        }
        // If it's a single object with _id
        if (
          typeof holiday.department_id === "object" &&
          holiday.department_id !== null
        ) {
          return [holiday.department_id._id || holiday.department_id];
        }
        // If it's an array of strings/ids
        return Array.isArray(holiday.department_id)
          ? holiday.department_id
          : [];
      };

      // Helper function to extract designation IDs
      const getDesignationIds = () => {
        if (!holiday.designation_id) return [];

        // If it's an array of objects with _id
        if (Array.isArray(holiday.designation_id)) {
          return holiday.designation_id.map((d) => d._id || d);
        }
        // If it's a single object with _id
        if (
          typeof holiday.designation_id === "object" &&
          holiday.designation_id !== null
        ) {
          return [holiday.designation_id._id || holiday.designation_id];
        }
        // If it's a single string/id
        return holiday.designation_id ? [holiday.designation_id] : [];
      };

      const deptIds = getDepartmentIds();
      const desIds = getDesignationIds();

      // Map selected departments to react-select format
      const selectedDeptOptions = departmentOptions.filter((option) =>
        deptIds.includes(option.value),
      );

      // Map selected designations to react-select format
      const selectedDesOptions = designationOptions.filter((option) =>
        desIds.includes(option.value),
      );

      // Map employment types to react-select format
      const selectedEmpOptions = employmentTypeOptions.filter((option) =>
        holiday.employment_type?.includes(option.value),
      );

      setFormData({
        occasion: holiday.occasion || "",
        occasion_date: holiday.occasion_date
          ? holiday.occasion_date.split("T")[0]
          : "",
        department_ids: deptIds,
        designation_ids: desIds,
        employment_types: holiday.employment_type || [],
        description: holiday.description || "",
      });

      setSelectedDepartments(selectedDeptOptions);
      setSelectedDesignations(selectedDesOptions);
      setSelectedEmploymentTypes(selectedEmpOptions);
      setErrors({});
    }
  }, [holiday, departments, designations]);

  const validateForm = () => {
    const newErrors = {};

    if (!formData.occasion || !formData.occasion.trim()) {
      newErrors.occasion = "Holiday name is required";
    }

    if (!formData.occasion_date) {
      newErrors.occasion_date = "Date is required";
    }

    if (selectedDesignations.length === 0) {
      newErrors.designation_ids = "At least one designation is required";
    }

    if (selectedDepartments.length === 0) {
      newErrors.department_ids = "At least one department is required";
    }

    if (selectedEmploymentTypes.length === 0) {
      newErrors.employment_types = "At least one employment type is required";
    }

    setErrors(newErrors);

    if (Object.keys(newErrors).length > 0) {
      toast.error(Object.values(newErrors)[0]);
    }

    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    try {
      const payload = {
        occasion: formData.occasion.trim(),
        occasion_date: formData.occasion_date,
        // Send as arrays of objects with value and label
        departments: selectedDepartments.map((dept) => ({
          value: dept.value,
          label: dept.label,
        })),
        designations: selectedDesignations.map((des) => ({
          value: des.value,
          label: des.label,
        })),
        employment_types: selectedEmploymentTypes.map((type) => ({
          value: type.value,
        //   label: type.label,
        })),
        description: formData.description.trim(),
      };

      console.log("Updating holiday data:", payload);
      await onSubmit(payload);

      handleClose();
    } catch (error) {
      console.error("Error updating holiday:", error);
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

  // Handle department change with react-select
  const handleDepartmentChange = (selectedOptions) => {
    setSelectedDepartments(selectedOptions || []);
    setFormData((prev) => ({
      ...prev,
      department_ids: selectedOptions
        ? selectedOptions.map((opt) => opt.value)
        : [],
    }));

    if (errors.department_ids) {
      setErrors((prev) => ({ ...prev, department_ids: "" }));
    }
  };

  // Handle designation change with react-select
  const handleDesignationChange = (selectedOptions) => {
    setSelectedDesignations(selectedOptions || []);
    setFormData((prev) => ({
      ...prev,
      designation_ids: selectedOptions
        ? selectedOptions.map((opt) => opt.value)
        : [],
    }));

    if (errors.designation_ids) {
      setErrors((prev) => ({ ...prev, designation_ids: "" }));
    }
  };

  // Handle employment type change with react-select
  const handleEmploymentTypeChange = (selectedOptions) => {
    setSelectedEmploymentTypes(selectedOptions || []);
    setFormData((prev) => ({
      ...prev,
      employment_types: selectedOptions
        ? selectedOptions.map((opt) => opt.value)
        : [],
    }));

    if (errors.employment_types) {
      setErrors((prev) => ({ ...prev, employment_types: "" }));
    }
  };

  const handleClose = () => {
    setFormData({
      occasion: "",
      occasion_date: "",
      department_ids: [],
      designation_ids: [],
      employment_types: [],
      description: "",
    });
    setSelectedDepartments([]);
    setSelectedDesignations([]);
    setSelectedEmploymentTypes([]);
    setErrors({});
    onHide();
  };

  // Format date for input min attribute
  const formatDateForInput = (date) => {
    if (!date) return "";
    const d = new Date(date);
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, "0");
    const day = String(d.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
  };

  // Custom styles for react-select
  const selectStyles = {
    control: (base, state) => ({
      ...base,
      borderColor: state.selectProps.error
        ? "#dc3545"
        : state.isFocused
          ? "#86b7fe"
          : "#dee2e6",
      boxShadow: state.selectProps.error
        ? "0 0 0 0.25rem rgba(220, 53, 69, 0.25)"
        : state.isFocused
          ? "0 0 0 0.25rem rgba(13, 110, 253, 0.25)"
          : "none",
      "&:hover": {
        borderColor: state.selectProps.error ? "#dc3545" : "#86b7fe",
      },
      minHeight: "38px",
    }),
    menu: (base) => ({
      ...base,
      zIndex: 1050,
    }),
    option: (base, state) => ({
      ...base,
      backgroundColor: state.isSelected
        ? "#0d6efd"
        : state.isFocused
          ? "#e9ecef"
          : "white",
      color: state.isSelected ? "white" : "#212529",
      cursor: "pointer",
      "&:active": {
        backgroundColor: state.isSelected ? "#0d6efd" : "#dee2e6",
      },
    }),
    multiValue: (base) => ({
      ...base,
      backgroundColor: "#e9ecef",
    }),
    multiValueLabel: (base) => ({
      ...base,
      color: "#495057",
    }),
    multiValueRemove: (base) => ({
      ...base,
      color: "#6c757d",
      "&:hover": {
        backgroundColor: "#dc3545",
        color: "white",
      },
    }),
    placeholder: (base) => ({
      ...base,
      color: "#6c757d",
    }),
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
          {/* Header */}
          <div className="modal-header border-bottom pb-3">
            <h5 className="modal-title fw-bold fs-5">
              <span className="text-primary">#</span> Edit Holiday
            </h5>
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
              <div className="row">
                {/* Holiday Name */}
                <div className="col-md-6 mb-3">
                  <label className="form-label fw-medium">
                    Occasion <span className="text-danger">*</span>
                  </label>
                  <input
                    type="text"
                    name="occasion"
                    className={`form-control ${
                      errors.occasion ? "is-invalid" : ""
                    }`}
                    placeholder="e.g., New Year's Day"
                    value={formData.occasion}
                    onChange={handleChange}
                    disabled={loading}
                  />
                  {errors.occasion && (
                    <div className="invalid-feedback">{errors.occasion}</div>
                  )}
                </div>

                {/* Date */}
                <div className="col-md-6 mb-3">
                  <label className="form-label fw-medium">
                    Date <span className="text-danger">*</span>
                  </label>
                  <div className="input-group">
                    <span className="input-group-text">
                      <FiCalendar />
                    </span>
                    <input
                      type="date"
                      name="occasion_date"
                      className={`form-control ${
                        errors.occasion_date ? "is-invalid" : ""
                      }`}
                      value={formData.occasion_date}
                      onChange={handleChange}
                      disabled={loading}
                      min={formatDateForInput(new Date())}
                    />
                  </div>
                  {errors.occasion_date && (
                    <div className="invalid-feedback d-block">
                      {errors.occasion_date}
                    </div>
                  )}
                </div>

                {/* Department Selection - Multi Select with react-select */}
                <div className="col-md-6 mb-3">
                  <label className="form-label fw-medium">
                    Departments <span className="text-danger">*</span>
                  </label>
                  <Select
                    isMulti
                    name="department_ids"
                    options={departmentOptions}
                    value={selectedDepartments}
                    onChange={handleDepartmentChange}
                    isDisabled={loading}
                    placeholder="Select departments..."
                    styles={selectStyles}
                    error={errors.department_ids}
                    className={errors.department_ids ? "is-invalid" : ""}
                    classNamePrefix="select"
                  />
                  {errors.department_ids && (
                    <div className="text-danger small mt-1">
                      {errors.department_ids}
                    </div>
                  )}
                </div>

                {/* Designation Selection - Multi Select with react-select */}
                <div className="col-md-6 mb-3">
                  <label className="form-label fw-medium">
                    Designations <span className="text-danger">*</span>
                  </label>
                  <Select
                    isMulti
                    name="designation_ids"
                    options={designationOptions}
                    value={selectedDesignations}
                    onChange={handleDesignationChange}
                    isDisabled={loading}
                    placeholder="Select designations..."
                    styles={selectStyles}
                    error={errors.designation_ids}
                    className={errors.designation_ids ? "is-invalid" : ""}
                    classNamePrefix="select"
                  />
                  {errors.designation_ids && (
                    <div className="text-danger small mt-1">
                      {errors.designation_ids}
                    </div>
                  )}
                </div>

                {/* Employment Type Selection with react-select */}
                <div className="col-md-6 mb-3">
                  <label className="form-label fw-medium">
                    Employment Types <span className="text-danger">*</span>
                  </label>
                  <Select
                    isMulti
                    name="employment_types"
                    options={employmentTypeOptions}
                    value={selectedEmploymentTypes}
                    onChange={handleEmploymentTypeChange}
                    isDisabled={loading}
                    placeholder="Select employment types..."
                    styles={selectStyles}
                    error={errors.employment_types}
                    className={errors.employment_types ? "is-invalid" : ""}
                    classNamePrefix="select"
                  />
                  {errors.employment_types && (
                    <div className="text-danger small mt-1">
                      {errors.employment_types}
                    </div>
                  )}
                </div>

                {/* Description (Optional) */}
                <div className="col-md-6 mb-3">
                  <label className="form-label fw-medium">
                    Description (Optional)
                  </label>
                  <textarea
                    name="description"
                    className="form-control"
                    rows="3"
                    placeholder="Enter additional details about the holiday..."
                    value={formData.description}
                    onChange={handleChange}
                    disabled={loading}
                  ></textarea>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="modal-footer border-top pt-3">
              <button
                type="button"
                className="btn btn-outline-secondary"
                onClick={handleClose}
                disabled={loading}
              >
                <FiX className="me-2" />
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
                    ></span>
                    Updating...
                  </>
                ) : (
                  <>
                    <FiSave size={16} />
                    Update Holiday
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>

      <style jsx>{`
        @media (max-width: 768px) {
          .modal-dialog {
            margin: 0.5rem;
          }
        }

        .border-top {
          border-top: 2px solid #dee2e6 !important;
        }

        /* Fix for react-select focus styles */
        .is-invalid .select__control {
          border-color: #dc3545;
        }
      `}</style>
    </div>
  );
};

export default EditHolidayForm;
