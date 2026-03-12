import React, { useState, useEffect } from "react";
import { FiUpload, FiUser, FiCamera, FiCalendar } from "react-icons/fi";
import { Country, State, City } from "country-state-city";
import { toast } from "react-toastify";

const EditEmployeeForm = ({
  onClose,
  onSave,
  employee,
  loading = false,
  roles = [],
  employees = [],
  departments = [],
  designations = [],
}) => {
  const [formData, setFormData] = useState({
    salutation: "",
    name: "",
    email: "",
    profile_picture: null,
    date_of_birth: "",
    designation_id: "",
    department_id: "",
    country: "India",
    mobile: "",
    gender: "",
    joining_date: "",
    reporting_to: "",
    language: "English",
    user_role: "",
    address: "",
    about: "",
    status: true,
  });

  const [errors, setErrors] = useState({});
  const [countries, setCountries] = useState([]);
  const [states, setStates] = useState([]);
  const [cities, setCities] = useState([]);
  const [imagePreview, setImagePreview] = useState(null);
  const [selectedState, setSelectedState] = useState("");
  const [selectedCity, setSelectedCity] = useState("");
  const [isInitialLoad, setIsInitialLoad] = useState(true);

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
  useEffect(() => {
    if (employee) {
      // Get values directly from employee object
      const country = employee.country || "India";
      const state = employee.state || "";
      const city = employee.city || "";

      // Get address without city, state, country
      let streetAddress = employee.address || "";
      if (streetAddress && (city || state || country)) {
        // Remove city, state, country from address if they're at the end
        const addressParts = streetAddress
          .split(",")
          .map((part) => part.trim());
        if (addressParts.length > 0) {
          // If the last part matches country, remove it
          if (country && addressParts[addressParts.length - 1] === country) {
            addressParts.pop();
          }
          // If the new last part matches state, remove it
          if (
            state &&
            addressParts.length > 0 &&
            addressParts[addressParts.length - 1] === state
          ) {
            addressParts.pop();
          }
          // If the new last part matches city, remove it
          if (
            city &&
            addressParts.length > 0 &&
            addressParts[addressParts.length - 1] === city
          ) {
            addressParts.pop();
          }
        }
        streetAddress = addressParts.join(", ");
      }

      setFormData({
        salutation: employee.salutation || "",
        name: employee.name || "",
        email: employee.email || "",
        profile_picture: null,
        date_of_birth: employee.date_of_birth
          ? employee.date_of_birth.split("T")[0]
          : "",
        designation_id:
          employee.designation_id?._id || employee.designation_id || "",
        department_id:
          employee.department_id?._id || employee.department_id || "",
        country: country,
        mobile: employee.mobile || employee.phone || "",
        gender: employee.gender || "",
        joining_date: employee.joining_date
          ? employee.joining_date.split("T")[0]
          : "",
        reporting_to: employee.reporting_to?._id || employee.reporting_to || "",
        language: employee.language || "English",
        user_role: employee.user_role?._id || employee.user_role || "",
        address: streetAddress,
        about: employee.about || "",
        status: employee.status === "active" || employee.status === true,
      });

      // Set selected state and city
      setSelectedState(state);
      setSelectedCity(city);

      // Set image preview if employee has image
      if (employee.fullImageUrl || employee.profile_picture || employee.image) {
        setImagePreview(
          employee.fullImageUrl || employee.profile_picture || employee.image,
        );
      }

      // Load states for the employee's country
      if (country) {
        const countryObj = Country.getAllCountries().find(
          (c) => c.name === country,
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
      if (country && state) {
        const countryObj = Country.getAllCountries().find(
          (c) => c.name === country,
        );
        const stateObj = State.getStatesOfCountry(countryObj?.isoCode).find(
          (s) => s.name === state,
        );

        if (countryObj && stateObj) {
          const stateCities = City.getCitiesOfState(
            countryObj.isoCode,
            stateObj.isoCode,
          );
          const formattedCities = stateCities.map((city) => ({
            value: city.name,
            label: city.name,
          }));
          setCities(formattedCities);
        }
      }

      setIsInitialLoad(false);
      setErrors({});
    }
  }, [employee]);

  // Update states when country changes (but not on initial load)
  useEffect(() => {
    if (!isInitialLoad && formData.country) {
      const countryObj = Country.getAllCountries().find(
        (c) => c.name === formData.country,
      );
      if (countryObj) {
        const countryStates = State.getStatesOfCountry(countryObj.isoCode);
        const formattedStates = countryStates.map((state) => ({
          value: state.name,
          label: state.name,
        }));
        setStates(formattedStates);

        // Only reset state and city if they're not valid for the new country
        if (selectedState) {
          const stateExists = formattedStates.some(
            (s) => s.value === selectedState,
          );
          if (!stateExists) {
            setSelectedState("");
            setCities([]);
            setSelectedCity("");
          }
        } else {
          setCities([]);
          setSelectedCity("");
        }
      }
    }
  }, [formData.country, isInitialLoad]);

  // Update cities when state changes (but not on initial load)
  useEffect(() => {
    if (!isInitialLoad && formData.country && selectedState) {
      const countryObj = Country.getAllCountries().find(
        (c) => c.name === formData.country,
      );
      const stateObj = State.getStatesOfCountry(countryObj?.isoCode).find(
        (s) => s.name === selectedState,
      );

      if (countryObj && stateObj) {
        const stateCities = City.getCitiesOfState(
          countryObj.isoCode,
          stateObj.isoCode,
        );
        const formattedCities = stateCities.map((city) => ({
          value: city.name,
          label: city.name,
        }));
        setCities(formattedCities);

        // Only reset city if it's not valid for the new state
        if (selectedCity) {
          const cityExists = formattedCities.some(
            (c) => c.value === selectedCity,
          );
          if (!cityExists) {
            setSelectedCity("");
          }
        }
      }
    }
  }, [formData.country, selectedState, isInitialLoad]);

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

    if (!formData.designation_id) {
      newErrors.designation_id = "Designation is required";
    }

    if (!formData.department_id) {
      newErrors.department_id = "Department is required";
    }

    if (!formData.mobile.trim()) {
      newErrors.mobile = "Mobile number is required";
    } else if (!/^\d{10}$/.test(formData.mobile.trim())) {
      newErrors.mobile = "Mobile number must be 10 digits";
    }

    if (!formData.gender) {
      newErrors.gender = "Gender is required";
    }

    if (!formData.joining_date) {
      newErrors.joining_date = "Joining date is required";
    }

    if (!formData.country) {
      newErrors.country = "Country is required";
    }

    setErrors(newErrors);
    if (Object.keys(newErrors).length > 0) {
      toast.error(Object.values(newErrors)[0]);
    }
    return Object.keys(newErrors).length === 0;
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        setErrors((prev) => ({
          ...prev,
          profile_picture: "Image size should be less than 5MB",
        }));
        return;
      }

      if (!file.type.startsWith("image/")) {
        setErrors((prev) => ({
          ...prev,
          profile_picture: "Please upload an image file",
        }));
        return;
      }

      setFormData((prev) => ({ ...prev, profile_picture: file }));
      setImagePreview(URL.createObjectURL(file));

      if (errors.profile_picture) {
        setErrors((prev) => ({ ...prev, profile_picture: "" }));
      }
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    const toastId = toast.loading("Updating employee...");

    try {
      // Combine address fields
      const addressParts = [];
      if (formData.address) addressParts.push(formData.address);
      if (selectedCity) addressParts.push(selectedCity);
      if (selectedState) addressParts.push(selectedState);
      if (formData.country) addressParts.push(formData.country);

      const fullAddress = addressParts.join(", ");

      const payload = {
        id: employee?._id,
        salutation: formData.salutation,
        name: formData.name.trim(),
        email: formData.email.trim(),
        profile_picture: formData.profile_picture,
        date_of_birth: formData.date_of_birth,
        designation_id: formData.designation_id,
        department_id: formData.department_id,
        country: formData.country,
        mobile: formData.mobile.trim(),
        gender: formData.gender,
        joining_date: formData.joining_date,
        reporting_to: formData.reporting_to,
        language: formData.language,
        user_role: formData.user_role,
        address: fullAddress,
        city: selectedCity,
        state: selectedState,
        about: formData.about,
        status: formData.status ? "active" : "inactive",
      };

      console.log("Updating employee data:", payload);
      await onSave(payload);

      toast.update(toastId, {
        render: "Employee updated successfully!",
        type: "success",
        isLoading: false,
        autoClose: 3000,
      });
    } catch (error) {
      console.error("Error updating employee:", error);
      toast.update(toastId, {
        render:
          error.response?.data?.message ||
          "Failed to update employee. Please try again.",
        type: "error",
        isLoading: false,
        autoClose: 4000,
      });

      // Highlight field if duplicate error
      if (error.response?.data?.message?.includes("email already exists")) {
        setErrors((prev) => ({
          ...prev,
          email: "This email is already registered",
        }));
      } else if (
        error.response?.data?.message?.includes("mobile already exists")
      ) {
        setErrors((prev) => ({
          ...prev,
          mobile: "This mobile number is already registered",
        }));
      }
    }
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
      (c) => c.name === formData.country,
    );
    return countryObj ? `+${countryObj.phonecode}` : "+91";
  };

  // Format date for input
  const formatDateForInput = (date) => {
    if (!date) return "";
    const d = new Date(date);
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, "0");
    const day = String(d.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
  };

  return (
    <div
      className="modal fade show d-block"
      style={{ backgroundColor: "rgba(0,0,0,0.5)" }}
      tabIndex="-1"
    >
      <div className="modal-dialog modal-dialog-centered modal-xl">
        <div
          className="modal-content rounded-3"
          style={{ maxHeight: "90vh", overflowY: "auto" }}
        >
          <div className="modal-header border-bottom pb-3 sticky-top bg-white">
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
                        style={{
                          width: "40px",
                          height: "40px",
                          cursor: "pointer",
                        }}
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
                      {employee?.fullImageUrl ||
                      employee?.profile_picture ||
                      employee?.image
                        ? "Current photo"
                        : "Upload employee photo (Max 5MB)"}
                    </p>
                    {errors.profile_picture && (
                      <div className="text-danger small mt-1">
                        {errors.profile_picture}
                      </div>
                    )}
                  </div>
                </div>

                {/* Salutation */}
                <div className="col-md-6 mb-3">
                  <label className="form-label fw-medium">Salutation</label>
                  <select
                    name="salutation"
                    className="form-control form-control-lg"
                    value={formData.salutation}
                    onChange={handleChange}
                    disabled={loading}
                  >
                    <option value="">Select Salutation</option>
                    <option value="Mr.">Mr.</option>
                    <option value="Ms.">Ms.</option>
                    <option value="Mrs.">Mrs.</option>
                    <option value="Dr.">Dr.</option>
                    <option value="Prof.">Prof.</option>
                  </select>
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
                    placeholder="e.g. John Doe"
                    value={formData.name}
                    onChange={handleChange}
                    disabled={loading}
                  />
                  {errors.name && (
                    <div className="invalid-feedback">{errors.name}</div>
                  )}
                </div>

                {/* Employee Email */}
                <div className="col-md-6 mb-3">
                  <label className="form-label fw-medium">
                    Employee Email <span className="text-danger">*</span>
                  </label>
                  <input
                    type="email"
                    name="email"
                    className={`form-control form-control-lg ${
                      errors.email ? "is-invalid" : ""
                    }`}
                    placeholder="e.g. johndoe@example.com"
                    value={formData.email}
                    onChange={handleChange}
                    disabled={loading}
                  />
                  {errors.email && (
                    <div className="invalid-feedback">{errors.email}</div>
                  )}
                </div>

                {/* Date of Birth */}
                <div className="col-md-6 mb-3">
                  <label className="form-label fw-medium">Date of Birth</label>
                  <div className="input-group">
                    <span className="input-group-text">
                      <FiCalendar />
                    </span>
                    <input
                      type="date"
                      name="date_of_birth"
                      className="form-control form-control-lg"
                      value={formData.date_of_birth}
                      onChange={handleChange}
                      disabled={loading}
                      max={formatDateForInput(new Date())}
                    />
                  </div>
                </div>

                {/* Designation */}
                <div className="col-md-6 mb-3">
                  <label className="form-label fw-medium">
                    Designation <span className="text-danger">*</span>
                  </label>
                  <select
                    name="designation_id"
                    className={`form-control form-control-lg ${
                      errors.designation_id ? "is-invalid" : ""
                    }`}
                    value={formData.designation_id}
                    onChange={handleChange}
                    disabled={loading || designations.length === 0}
                  >
                    <option value="">Select Designation</option>
                    {designations.map((des) => (
                      <option key={des._id} value={des._id}>
                        {des.designation_name}
                      </option>
                    ))}
                  </select>
                  {errors.designation_id && (
                    <div className="invalid-feedback">
                      {errors.designation_id}
                    </div>
                  )}
                </div>

                {/* Department */}
                <div className="col-md-6 mb-3">
                  <label className="form-label fw-medium">
                    Department <span className="text-danger">*</span>
                  </label>
                  <select
                    name="department_id"
                    className={`form-control form-control-lg ${
                      errors.department_id ? "is-invalid" : ""
                    }`}
                    value={formData.department_id}
                    onChange={handleChange}
                    disabled={loading || departments.length === 0}
                  >
                    <option value="">Select Department</option>
                    {departments.map((dept) => (
                      <option key={dept._id} value={dept._id}>
                        {dept.department_name}
                      </option>
                    ))}
                  </select>
                  {errors.department_id && (
                    <div className="invalid-feedback">
                      {errors.department_id}
                    </div>
                  )}
                </div>

                {/* Mobile */}
                <div className="col-md-6 mb-3">
                  <label className="form-label fw-medium">
                    Mobile <span className="text-danger">*</span>
                  </label>
                  <div className="input-group">
                    <span className="input-group-text">{getPhoneCode()}</span>
                    <input
                      type="tel"
                      name="mobile"
                      className={`form-control form-control-lg ${
                        errors.mobile ? "is-invalid" : ""
                      }`}
                      placeholder="e.g. 1234567890"
                      value={formData.mobile}
                      onChange={handleChange}
                      disabled={loading}
                      maxLength="10"
                    />
                  </div>
                  {errors.mobile && (
                    <div className="invalid-feedback d-block">
                      {errors.mobile}
                    </div>
                  )}
                </div>

                {/* Gender */}
                <div className="col-md-6 mb-3">
                  <label className="form-label fw-medium">
                    Gender <span className="text-danger">*</span>
                  </label>
                  <select
                    name="gender"
                    className={`form-control form-control-lg ${
                      errors.gender ? "is-invalid" : ""
                    }`}
                    value={formData.gender}
                    onChange={handleChange}
                    disabled={loading}
                  >
                    <option value="">Select Gender</option>
                    <option value="Male">Male</option>
                    <option value="Female">Female</option>
                    <option value="Other">Other</option>
                  </select>
                  {errors.gender && (
                    <div className="invalid-feedback">{errors.gender}</div>
                  )}
                </div>

                {/* Joining Date */}
                <div className="col-md-6 mb-3">
                  <label className="form-label fw-medium">
                    Joining Date <span className="text-danger">*</span>
                  </label>
                  <div className="input-group">
                    <span className="input-group-text">
                      <FiCalendar />
                    </span>
                    <input
                      type="date"
                      name="joining_date"
                      className={`form-control form-control-lg ${
                        errors.joining_date ? "is-invalid" : ""
                      }`}
                      value={formData.joining_date}
                      onChange={handleChange}
                      disabled={loading}
                    />
                  </div>
                  {errors.joining_date && (
                    <div className="invalid-feedback">
                      {errors.joining_date}
                    </div>
                  )}
                </div>

                {/* Reporting To */}
                <div className="col-md-6 mb-3">
                  <label className="form-label fw-medium">Reporting To</label>
                  <select
                    name="reporting_to"
                    className="form-control form-control-lg"
                    value={formData.reporting_to}
                    onChange={handleChange}
                    disabled={loading}
                  >
                    <option value="">Select Reporting To</option>
                    {employees.map((emp) => (
                      <option key={emp._id} value={emp._id}>
                        {emp.name}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Language */}
                <div className="col-md-6 mb-3">
                  <label className="form-label fw-medium">Language</label>
                  <select
                    name="language"
                    className="form-control form-control-lg"
                    value={formData.language}
                    onChange={handleChange}
                    disabled={loading}
                  >
                    <option value="English">English</option>
                    <option value="Hindi">Hindi</option>
                    <option value="Spanish">Spanish</option>
                    <option value="French">French</option>
                    <option value="German">German</option>
                    <option value="Other">Other</option>
                  </select>
                </div>

                {/* User Role */}
                <div className="col-md-6 mb-3">
                  <label className="form-label fw-medium">User Role</label>
                  <select
                    name="user_role"
                    className="form-control form-control-lg"
                    value={formData.user_role}
                    onChange={handleChange}
                    disabled={loading}
                  >
                    <option value="">Select Role</option>
                    {roles.map((role) => (
                      <option key={role._id} value={role._id}>
                        {role.role_name}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Country */}
                <div className="col-md-6 mb-3">
                  <label className="form-label fw-medium">Country</label>
                  <select
                    name="country"
                    className="form-control form-control-lg"
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
                </div>

                {/* State */}
                <div className="col-md-6 mb-3">
                  <label className="form-label fw-medium">State</label>
                  <select
                    className="form-control form-control-lg"
                    value={selectedState}
                    onChange={(e) => setSelectedState(e.target.value)}
                    disabled={loading || !formData.country}
                  >
                    <option value="">Select State</option>
                    {states.map((state) => (
                      <option key={state.value} value={state.value}>
                        {state.label}
                      </option>
                    ))}
                  </select>
                </div>

                {/* City */}
                <div className="col-md-6 mb-3">
                  <label className="form-label fw-medium">City</label>
                  <select
                    className="form-control form-control-lg"
                    value={selectedCity}
                    onChange={(e) => setSelectedCity(e.target.value)}
                    disabled={loading || !selectedState}
                  >
                    <option value="">Select City</option>
                    {cities.map((city) => (
                      <option key={city.value} value={city.value}>
                        {city.label}
                      </option>
                    ))}
                  </select>
                </div>
                {/* Address */}
                <div className="col-md-6 mb-3">
                  <label className="form-label fw-medium">Address</label>
                  <input
                    type="text"
                    name="address"
                    className="form-control form-control-lg"
                    placeholder="e.g. 132, My Street"
                    value={formData.address}
                    onChange={handleChange}
                    disabled={loading}
                  />
                </div>
                {/* About */}
                <div className="col-12 mb-3">
                  <label className="form-label fw-medium">About</label>
                  <textarea
                    name="about"
                    className="form-control form-control-lg"
                    rows="3"
                    placeholder="Enter additional information about the employee..."
                    value={formData.about}
                    onChange={handleChange}
                    disabled={loading}
                  ></textarea>
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

            <div className="modal-footer border-top pt-3 sticky-bottom bg-white">
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
