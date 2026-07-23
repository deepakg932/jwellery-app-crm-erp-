// components/hr/AddHolidayForm.jsx
import React, { useState, useEffect } from "react";
import { FiCalendar, FiSave, FiX, FiPlus, FiTrash2 } from "react-icons/fi";
import { toast } from "react-toastify";
import Select from "react-select";

const AddHolidayForm = ({
  onClose,
  onSave,
  loading = false,
  departments = [],
  designations = [],
  defaultDate = null, // ISO string or Date object to prefill
}) => {
  const [holidays, setHolidays] = useState([
    {
      id: Date.now(),
      occasion: "",
      occasion_date: "",
    },
  ]);

  const [formData, setFormData] = useState({
    department_ids: [], // Changed to array
    designation_ids: [], // Changed to array
    employment_types: [], // Changed to array
    description: "",
  });

  const [errors, setErrors] = useState({});
  const [selectedDepartments, setSelectedDepartments] = useState([]); // Changed to array
  const [selectedDesignations, setSelectedDesignations] = useState([]); // Changed to array
  const [selectedEmploymentTypes, setSelectedEmploymentTypes] = useState([]); // Changed to array

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

  const addNewHoliday = () => {
    setHolidays([
      ...holidays,
      {
        id: Date.now() + Math.random(),
        occasion: "",
        occasion_date: "",
      },
    ]);
  };

  const removeHoliday = (id) => {
    if (holidays.length > 1) {
      setHolidays(holidays.filter((holiday) => holiday.id !== id));
    } else {
      toast.warning("At least one holiday is required");
    }
  };

  const updateHoliday = (id, field, value) => {
    setHolidays(
      holidays.map((holiday) =>
        holiday.id === id ? { ...holiday, [field]: value } : holiday
      )
    );

    // Clear error for this field if it exists
    if (errors[`holiday_${id}_${field}`]) {
      setErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors[`holiday_${id}_${field}`];
        return newErrors;
      });
    }
  };

  const validateForm = () => {
    const newErrors = {};

    // Validate each holiday
    holidays.forEach((holiday, index) => {
      if (!holiday.occasion || !holiday.occasion.trim()) {
        newErrors[`holiday_${holiday.id}_occasion`] =
          `Holiday ${index + 1} name is required`;
      }

      if (!holiday.occasion_date) {
        newErrors[`holiday_${holiday.id}_date`] =
          `Holiday ${index + 1} date is required`;
      }
    });

    // Validate other required fields
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
      // Create payload with holidays array inside a single object
      const payload = {
        holidays: holidays.map((holiday) => ({
          occasion: holiday.occasion.trim(),
          occasion_date: holiday.occasion_date,
        })),
        // Common fields applied to all holidays - Now as array of objects with value and label
        departments: selectedDepartments.map((dept) => ({
          value: dept.value,
          label: dept.label
        })),
        designations: selectedDesignations.map((des) => ({
          value: des.value,
          label: des.label
        })),
        employment_types: selectedEmploymentTypes.map((type) => ({
          value: type.value,
        //   label: type.label
        })),
        description: formData.description.trim(),
      };

      console.log("Submitting multiple holidays:", payload);

      // Send single payload with holidays array
      await onSave(payload);
    //   onClose(); 
    } catch (error) {
      console.error("Error saving holidays:", error);
    }
  };

  const handleClose = () => {
    resetForm();
    onClose();
  };

  const resetForm = () => {
    setHolidays([
      {
        id: Date.now(),
        occasion: "",
        occasion_date: "",
      },
    ]);
    setFormData({
      department_ids: [], // Changed to array
      designation_ids: [], // Changed to array
      employment_types: [], // Changed to array
      description: "",
    });
    setSelectedDepartments([]); // Changed to array
    setSelectedDesignations([]); // Changed to array
    setSelectedEmploymentTypes([]); // Changed to array
    setErrors({});
  };

  const formatDateForInput = (date) => {
    if (!date) return "";
    const d = new Date(date);
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, "0");
    const day = String(d.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
  };

  // when defaultDate prop is provided, prefill the first holiday's date
  useEffect(() => {
    if (defaultDate) {
      const dateStr = formatDateForInput(defaultDate);
      setHolidays([
        {
          id: Date.now(),
          occasion: "",
          occasion_date: dateStr,
        },
      ]);
    }
  }, [defaultDate]);

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

  return (
    <div
      className="modal fade show d-block"
      style={{ backgroundColor: "rgba(0,0,0,0.5)" }}
      tabIndex="-1"
    >
      <div className="modal-dialog modal-dialog-centered modal-xl">
        <div className="modal-content rounded-3">
          {/* Header */}
          <div className="modal-header border-bottom pb-3">
            <h5 className="modal-title fw-bold fs-5">
              <span className="text-primary">#</span> Add Multiple Holidays
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
              {/* Multiple Holidays Section */}
              <div className="row mb-4">
                <div className="col-12">
                  <label className="form-label fw-bold mb-3">
                    Holidays <span className="text-danger">*</span>
                  </label>
                  <div className="text-end col-12">
                    <button
                      type="button"
                      className="btn btn-outline-primary mb-3"
                      onClick={addNewHoliday}
                      disabled={loading}
                    >
                      <FiPlus className="me-2" />
                      Add Holiday
                    </button>
                  </div>

                  {holidays.map((holiday, index) => (
                    <div key={holiday.id} className="card mb-3 border">
                      <div className="card-body">
                        <div className="d-flex justify-content-between align-items-center mb-3">
                          <h6 className="card-subtitle text-muted">
                            Holiday #{index + 1}
                          </h6>
                          {holidays.length > 1 && (
                            <button
                              type="button"
                              className="btn btn-outline-danger btn-sm"
                              onClick={() => removeHoliday(holiday.id)}
                              disabled={loading}
                            >
                              <FiTrash2 size={14} />
                            </button>
                          )}
                        </div>

                        <div className="row">
                          {/* Occasion Name */}
                          <div className="col-md-6 mb-3">
                            <label className="form-label fw-medium">
                              Occasion <span className="text-danger">*</span>
                            </label>
                            <input
                              type="text"
                              className={`form-control ${
                                errors[`holiday_${holiday.id}_occasion`]
                                  ? "is-invalid"
                                  : ""
                              }`}
                              placeholder="e.g., New Year's Day"
                              value={holiday.occasion}
                              onChange={(e) =>
                                updateHoliday(
                                  holiday.id,
                                  "occasion",
                                  e.target.value
                                )
                              }
                              disabled={loading}
                            />
                            {errors[`holiday_${holiday.id}_occasion`] && (
                              <div className="invalid-feedback">
                                {errors[`holiday_${holiday.id}_occasion`]}
                              </div>
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
                                className={`form-control ${
                                  errors[`holiday_${holiday.id}_date`]
                                    ? "is-invalid"
                                    : ""
                                }`}
                                value={holiday.occasion_date}
                                onChange={(e) =>
                                  updateHoliday(
                                    holiday.id,
                                    "occasion_date",
                                    e.target.value
                                  )
                                }
                                disabled={loading}
                                min={formatDateForInput(new Date())}
                              />
                            </div>
                            {errors[`holiday_${holiday.id}_date`] && (
                              <div className="invalid-feedback d-block">
                                {errors[`holiday_${holiday.id}_date`]}
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Common Fields Section */}
              <div className="row pt-2">
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
                <div className="col-md-6 mb-4">
                  <label className="form-label fw-medium mb-2">
                    Description (Optional)
                  </label>
                  <textarea
                    name="description"
                    className="form-control"
                    rows="4"
                    placeholder="Enter additional details about the holidays..."
                    value={formData.description}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        description: e.target.value,
                      }))
                    }
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
                    Saving...
                  </>
                ) : (
                  <>
                    <FiSave size={16} />
                    Save Holidays
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

          .btn-outline-primary.w-100 {
            margin-bottom: 1rem;
          }
        }

        .card {
          transition: all 0.3s ease;
        }

        .card:hover {
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
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

export default AddHolidayForm;