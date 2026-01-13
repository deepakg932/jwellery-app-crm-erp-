import React, { useState, useEffect } from "react";
import { FiUpload, FiUser, FiCamera } from "react-icons/fi";
import { Country, State, City } from "country-state-city";

const EditEmployeeForm = ({
  onClose,
  onSave,
  employee,
  loading = false,
  roles = [],
}) => {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    pan_number: "",
    aadhaar_number: "",
    address: "",
    city: "",
    state: "",
    country: "India",
    pincode: "",
    role_id: "",
    basic_salary: "",
    image: null,
    status: true,
  });

  const [errors, setErrors] = useState({});
  const [countries, setCountries] = useState([]);
  const [states, setStates] = useState([]);
  const [cities, setCities] = useState([]);
  const [imagePreview, setImagePreview] = useState(null);

  // Initialize countries on component mount
  useEffect(() => {
    const allCountries = Country.getAllCountries();
    const formattedCountries = allCountries.map((country) => ({
      value: country.name,
      label: country.name,
      phoneCode: country.phonecode,
    }));

    setCountries(formattedCountries);
  }, []);

  // Load employee data when component mounts or employee changes
  // In the useEffect when loading employee data:
  useEffect(() => {
    if (employee) {
      setFormData({
        name: employee.name || "",
        email: employee.email || "",
        phone: employee.phone || "",
        pan_number: employee.pan_number || "",
        aadhaar_number: employee.aadhaar_number || "",
        address: employee.address || "",
        city: employee.city || "",
        state: employee.state || "",
        country: employee.country || "India",
        pincode: employee.pincode || "",
        role_id: employee.role_id || "",
        basic_salary: employee.basic_salary || "",
        image: null,
        status: employee.status || employee.status === "active",
      });
      // Set image preview if employee has image
      if (employee.image) {
        setImagePreview(employee.image);
      }

      // Load states for the employee's country
      if (employee.country) {
        const countryObj = Country.getAllCountries().find(
          (c) => c.name === employee.country
        );
        if (countryObj) {
          const countryStates = State.getStatesOfCountry(countryObj.isoCode);
          const formattedStates = countryStates.map((state) => ({
            value: state.name,
            label: state.name,
          }));
          setStates(formattedStates);
        }
      }

      // Load cities for the employee's state
      if (employee.country && employee.state) {
        const countryObj = Country.getAllCountries().find(
          (c) => c.name === employee.country
        );
        const stateObj = State.getStatesOfCountry(countryObj?.isoCode).find(
          (s) => s.name === employee.state
        );

        if (countryObj && stateObj) {
          const stateCities = City.getCitiesOfState(
            countryObj.isoCode,
            stateObj.isoCode
          );
          const formattedCities = stateCities.map((city) => ({
            value: city.name,
            label: city.name,
          }));
          setCities(formattedCities);
        }
      }

      setErrors({});
    }
  }, [employee]);

  // Update states when country changes
  useEffect(() => {
    if (formData.country) {
      const countryObj = Country.getAllCountries().find(
        (c) => c.name === formData.country
      );
      if (countryObj) {
        const countryStates = State.getStatesOfCountry(countryObj.isoCode);
        const formattedStates = countryStates.map((state) => ({
          value: state.name,
          label: state.name,
        }));

        setStates(formattedStates);
        // Only reset state if it's not the same as the current one
        if (
          formData.state &&
          !formattedStates.find((s) => s.value === formData.state)
        ) {
          setFormData((prev) => ({ ...prev, state: "", city: "" }));
        }
        setCities([]);
      }
    }
  }, [formData.country]);

  // Update cities when state changes
  useEffect(() => {
    if (formData.country && formData.state) {
      const countryObj = Country.getAllCountries().find(
        (c) => c.name === formData.country
      );
      const stateObj = State.getStatesOfCountry(countryObj?.isoCode).find(
        (s) => s.name === formData.state
      );

      if (countryObj && stateObj) {
        const stateCities = City.getCitiesOfState(
          countryObj.isoCode,
          stateObj.isoCode
        );
        const formattedCities = stateCities.map((city) => ({
          value: city.name,
          label: city.name,
        }));

        setCities(formattedCities);
        // Only reset city if it's not in the new city list
        if (
          formData.city &&
          !formattedCities.find((c) => c.value === formData.city)
        ) {
          setFormData((prev) => ({ ...prev, city: "" }));
        }
      }
    }
  }, [formData.country, formData.state]);

  const validateForm = () => {
    const newErrors = {};

    if (!formData.name.trim()) {
      newErrors.name = "Employee name is required";
    }

    if (!formData.email.trim()) {
      newErrors.email = "Email is required";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email.trim())) {
      newErrors.email = "Please enter a valid email address";
    }

    if (!formData.phone.trim()) {
      newErrors.phone = "Phone number is required";
    } else if (!/^\d{10}$/.test(formData.phone.trim())) {
      newErrors.phone = "Phone number must be 10 digits";
    }

    if (
      formData.pan_number.trim() &&
      !/^[A-Z]{5}[0-9]{4}[A-Z]{1}$/.test(formData.pan_number.trim())
    ) {
      newErrors.pan_number =
        "PAN number must be 10 characters (e.g., ABCDE1234F)";
    }

    if (
      formData.aadhaar_number.trim() &&
      !/^\d{12}$/.test(formData.aadhaar_number.trim())
    ) {
      newErrors.aadhaar_number = "Aadhar number must be 12 digits";
    }

    if (!formData.address.trim()) {
      newErrors.address = "Address is required";
    }

    if (!formData.role_id.trim()) {
      newErrors.role_id = "Role is required";
    }

    if (!formData.basic_salary || parseFloat(formData.basic_salary) <= 0) {
      newErrors.basic_salary = "Valid basic salary is required";
    }

    if (!formData.country.trim()) {
      newErrors.country = "Country is required";
    }

    if (!formData.state.trim()) {
      newErrors.state = "State is required";
    }

    if (!formData.city.trim()) {
      newErrors.city = "City is required";
    }

    if (!formData.pincode.trim()) {
      newErrors.pincode = "Pincode is required";
    } else if (!/^\d{6}$/.test(formData.pincode.trim())) {
      newErrors.pincode = "Pincode must be 6 digits";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        // 5MB limit
        setErrors((prev) => ({
          ...prev,
          image: "Image size should be less than 5MB",
        }));
        return;
      }

      if (!file.type.startsWith("image/")) {
        setErrors((prev) => ({
          ...prev,
          image: "Please upload an image file",
        }));
        return;
      }

      setFormData((prev) => ({ ...prev, image: file }));
      setImagePreview(URL.createObjectURL(file));

      if (errors.image) {
        setErrors((prev) => ({ ...prev, image: "" }));
      }
    }
  };

  // Remove the loading condition check and simplify
  const handleSubmit = (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    const payload = {
      id: employee?._id,
      name: formData.name.trim(),
      email: formData.email.trim(),
      phone: formData.phone.trim(),
      pan_number: formData.pan_number.trim().toUpperCase(),
      aadhaar_number: formData.aadhaar_number.trim(),
      address: formData.address.trim(),
      city: formData.city.trim(),
      state: formData.state.trim(),
      country: formData.country.trim(),
      pincode: formData.pincode.trim(),
      role_id: formData.role_id,
      basic_salary: parseFloat(formData.basic_salary),
      image: formData.image,
      status: formData.status ? "active" : "inactive",
    };

    console.log("Updating employee data:", payload);

    // Directly call onSave - let the parent component handle closing
    onSave(payload);
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));

    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: "" }));
    }
  };

  const handleClose = () => {
    if (!loading) onClose();
  };

  // Get country phone code
  const getPhoneCode = () => {
    const countryObj = Country.getAllCountries().find(
      (c) => c.name === formData.country
    );
    return countryObj ? `+${countryObj.phonecode}` : "+91";
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
            <h5 className="modal-title fw-bold fs-5">Edit Employee</h5>
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
                {/* Image Upload */}
                <div className="col-12 mb-4">
                  <div className="d-flex flex-column align-items-center">
                    <div className="position-relative mb-3">
                      <div
                        className="rounded-circle border border-3 border-primary p-1"
                        style={{ width: "120px", height: "120px" }}
                      >
                        {imagePreview ? (
                          <img
                            src={imagePreview}
                            alt="Profile Preview"
                            className="rounded-circle w-100 h-100 object-fit-cover"
                          />
                        ) : (
                          <div className="w-100 h-100 rounded-circle bg-light d-flex align-items-center justify-content-center">
                            <FiUser size={48} className="text-muted" />
                          </div>
                        )}
                      </div>
                      <label
                        htmlFor="imageUpload"
                        className="position-absolute bottom-0 end-0 bg-primary text-white rounded-circle p-2 cursor-pointer"
                        style={{ width: "40px", height: "40px" }}
                      >
                        <FiCamera size={20} />
                        <input
                          type="file"
                          id="imageUpload"
                          className="d-none"
                          accept="image/*"
                          onChange={handleImageChange}
                          disabled={loading}
                        />
                      </label>
                    </div>
                    <p className="text-muted small mb-0">
                      {employee?.image
                        ? "Current photo"
                        : "Upload employee photo (Max 5MB)"}
                    </p>
                    {errors.image && (
                      <div className="text-danger small mt-1">
                        {errors.image}
                      </div>
                    )}
                  </div>
                </div>

                {/* Employee Name */}
                <div className="col-md-6 mb-3">
                  <label className="form-label fw-medium">
                    Employee Name <span className="text-danger">*</span>
                  </label>
                  <input
                    type="text"
                    name="name"
                    className={`form-control form-control-lg ${
                      errors.name ? "is-invalid" : ""
                    }`}
                    placeholder="Enter employee name"
                    value={formData.name}
                    onChange={handleChange}
                    disabled={loading}
                  />
                  {errors.name && (
                    <div className="invalid-feedback">{errors.name}</div>
                  )}
                </div>

                {/* Email */}
                <div className="col-md-6 mb-3">
                  <label className="form-label fw-medium">
                    Email Address <span className="text-danger">*</span>
                  </label>
                  <input
                    type="email"
                    name="email"
                    className={`form-control form-control-lg ${
                      errors.email ? "is-invalid" : ""
                    }`}
                    placeholder="Enter email address"
                    value={formData.email}
                    onChange={handleChange}
                    disabled={loading}
                  />
                  {errors.email && (
                    <div className="invalid-feedback">{errors.email}</div>
                  )}
                </div>

                {/* Phone */}
                <div className="col-md-6 mb-3">
                  <label className="form-label fw-medium">
                    Phone Number <span className="text-danger">*</span>
                  </label>
                  <div className="input-group">
                    <span className="input-group-text">{getPhoneCode()}</span>
                    <input
                      type="tel"
                      name="phone"
                      className={`form-control form-control-lg ${
                        errors.phone ? "is-invalid" : ""
                      }`}
                      placeholder="Enter phone number"
                      value={formData.phone}
                      onChange={handleChange}
                      disabled={loading}
                    />
                  </div>
                  {errors.phone && (
                    <div className="invalid-feedback d-block">
                      {errors.phone}
                    </div>
                  )}
                </div>
                {/* PAN Number */}
                <div className="col-md-6 mb-3">
                  <label className="form-label fw-medium">PAN Number</label>
                  <input
                    type="text"
                    name="pan_number"
                    className={`form-control form-control-lg ${
                      errors.pan_number ? "is-invalid" : ""
                    }`}
                    placeholder="e.g., ABCDE1234F"
                    value={formData.pan_number}
                    onChange={handleChange}
                    disabled={loading}
                    maxLength="10"
                    style={{ textTransform: "uppercase" }}
                  />
                  {errors.pan_number && (
                    <div className="invalid-feedback">{errors.pan_number}</div>
                  )}
                  <div className="form-text">10-character PAN (Optional)</div>
                </div>

                {/* Aadhar Number */}
                <div className="col-md-6 mb-3">
                  <label className="form-label fw-medium">Aadhar Number</label>
                  <input
                    type="text"
                    name="aadhaar_number"
                    className={`form-control form-control-lg ${
                      errors.aadhaar_number ? "is-invalid" : ""
                    }`}
                    placeholder="e.g., 123456789012"
                    value={formData.aadhaar_number}
                    onChange={handleChange}
                    disabled={loading}
                    maxLength="12"
                  />
                  {errors.aadhaar_number && (
                    <div className="invalid-feedback">
                      {errors.aadhaar_number}
                    </div>
                  )}
                  <div className="form-text">12-digit Aadhar (Optional)</div>
                </div>
                {/* Role */}
                <div className="col-md-6 mb-3">
                  <label className="form-label fw-medium">
                    Role <span className="text-danger">*</span>
                  </label>
                  <select
                    name="role_id"
                    className={`form-control form-control-lg ${
                      errors.role_id ? "is-invalid" : ""
                    }`}
                    value={formData.role_id}
                    onChange={handleChange}
                    disabled={loading || roles.length === 0}
                  >
                    <option value="">Select Role</option>
                    {roles.map((role) => (
                      <option key={role._id} value={role._id}>
                        {role.role_name}
                      </option>
                    ))}
                  </select>
                  {errors.role_id && (
                    <div className="invalid-feedback">{errors.role_id}</div>
                  )}
                  {roles.length === 0 && (
                    <div className="form-text text-warning">
                      No roles available.
                    </div>
                  )}
                </div>

                {/* Basic Salary */}
                <div className="col-md-6 mb-3">
                  <label className="form-label fw-medium">
                    Basic Salary <span className="text-danger">*</span>
                  </label>
                  <div className="input-group">
                    <span className="input-group-text">₹</span>
                    <input
                      type="number"
                      name="basic_salary"
                      className={`form-control form-control-lg ${
                        errors.basic_salary ? "is-invalid" : ""
                      }`}
                      placeholder="Enter basic salary"
                      value={formData.basic_salary}
                      onChange={handleChange}
                      disabled={loading}
                      min="0"
                      step="0.01"
                    />
                  </div>
                  {errors.basic_salary && (
                    <div className="invalid-feedback">
                      {errors.basic_salary}
                    </div>
                  )}
                </div>

                {/* Address */}
                <div className="col-12 mb-3">
                  <label className="form-label fw-medium">
                    Address <span className="text-danger">*</span>
                  </label>
                  <textarea
                    name="address"
                    className={`form-control form-control-lg ${
                      errors.address ? "is-invalid" : ""
                    }`}
                    placeholder="Enter complete address"
                    value={formData.address}
                    onChange={handleChange}
                    disabled={loading}
                    rows="2"
                  />
                  {errors.address && (
                    <div className="invalid-feedback">{errors.address}</div>
                  )}
                </div>

                {/* Country */}
                <div className="col-md-6 mb-3">
                  <label className="form-label fw-medium">
                    Country <span className="text-danger">*</span>
                  </label>
                  <select
                    name="country"
                    className={`form-control form-control-lg ${
                      errors.country ? "is-invalid" : ""
                    }`}
                    value={formData.country}
                    onChange={handleChange}
                    disabled={loading}
                  >
                    <option value="">Select Country</option>
                    {countries.map((country) => (
                      <option key={country.value} value={country.value}>
                        {country.label}
                      </option>
                    ))}
                  </select>
                  {errors.country && (
                    <div className="invalid-feedback">{errors.country}</div>
                  )}
                </div>

                {/* State */}
                <div className="col-md-6 mb-3">
                  <label className="form-label fw-medium">
                    State <span className="text-danger">*</span>
                  </label>
                  <select
                    name="state"
                    className={`form-control form-control-lg ${
                      errors.state ? "is-invalid" : ""
                    }`}
                    value={formData.state}
                    onChange={handleChange}
                    disabled={loading || !formData.country}
                  >
                    <option value="">Select State</option>
                    {states.map((state) => (
                      <option key={state.value} value={state.value}>
                        {state.label}
                      </option>
                    ))}
                  </select>
                  {errors.state && (
                    <div className="invalid-feedback">{errors.state}</div>
                  )}
                </div>

                {/* City */}
                <div className="col-md-6 mb-3">
                  <label className="form-label fw-medium">
                    City <span className="text-danger">*</span>
                  </label>
                  {cities.length > 0 ? (
                    <select
                      name="city"
                      className={`form-control form-control-lg ${
                        errors.city ? "is-invalid" : ""
                      }`}
                      value={formData.city}
                      onChange={handleChange}
                      disabled={loading || !formData.state}
                    >
                      <option value="">Select City</option>
                      {cities.map((city) => (
                        <option key={city.value} value={city.value}>
                          {city.label}
                        </option>
                      ))}
                    </select>
                  ) : (
                    <input
                      type="text"
                      name="city"
                      className={`form-control form-control-lg ${
                        errors.city ? "is-invalid" : ""
                      }`}
                      placeholder="Enter city name"
                      value={formData.city}
                      onChange={handleChange}
                      disabled={loading}
                    />
                  )}
                  {errors.city && (
                    <div className="invalid-feedback">{errors.city}</div>
                  )}
                </div>

                {/* Pincode */}
                <div className="col-md-6 mb-3">
                  <label className="form-label fw-medium">
                    Pincode <span className="text-danger">*</span>
                  </label>
                  <input
                    type="text"
                    name="pincode"
                    className={`form-control form-control-lg ${
                      errors.pincode ? "is-invalid" : ""
                    }`}
                    placeholder="Enter pincode"
                    value={formData.pincode}
                    onChange={handleChange}
                    disabled={loading}
                    maxLength="6"
                  />
                  {errors.pincode && (
                    <div className="invalid-feedback">{errors.pincode}</div>
                  )}
                </div>
              </div>

              {/* Status */}
              <div className="mb-3">
                <div className="form-check form-switch">
                  <input
                    className="form-check-input"
                    type="checkbox"
                    role="switch"
                    name="status"
                    id="employeeStatus"
                    checked={formData.status}
                    onChange={handleChange}
                    disabled={loading}
                  />
                  <label
                    className="form-check-label fw-medium"
                    htmlFor="employeeStatus"
                  >
                    Status (Active/Inactive)
                  </label>
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
                disabled={loading || roles.length === 0}
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
                    Update Employee
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

export default EditEmployeeForm;
