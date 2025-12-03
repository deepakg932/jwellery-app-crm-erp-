import AppLogo from '@/components/AppLogo';
import { appName, author, currentYear } from '@/helpers';
import { Link } from "react-router";
import { useState } from "react";
import axios from "axios";
import { Card, CardBody, Col, FormControl, Row, Button, FormLabel } from 'react-bootstrap';
import { LuCircleUser, LuKeyRound } from 'react-icons/lu';

const Index = () => {

  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });

  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [apiError, setApiError] = useState("");

  // Input change handler
  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  // Validation
  const validate = () => {
    let err = {};

    if (!formData.email.trim()) err.email = "Email is required";
    if (!formData.password.trim()) err.password = "Password is required";

    return err;
  };

  // Submit handler with Axios API
  const handleSubmit = async (e) => {
    e.preventDefault();
    setApiError("");

    const v = validate();
    setErrors(v);
    if (Object.keys(v).length !== 0) return;

    try {
      setLoading(true);

      const response = await axios.post(
        "http://10.85.81.77:5000/api/auth/login",
        formData
      );
        
      console.log("Login Success:", response.data);
      alert("Login successful!");

    } catch (err) {
      console.error("Login Error:", err);

      if (err.response?.data?.message) {
        setApiError(err.response.data.message);
      } else {
        setApiError("Something went wrong.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-box p-0 w-100">
      <Row className="w-100 g-0">
        <Col md={'auto'}>
          <Card className="auth-box-form border-0 mb-0 p-4">

            <div className="text-center mb-4">
              <AppLogo height={80} />
              <h3 className="mt-3 fw-bold"> Login</h3>
              <p className="text-muted">Access your account</p>
            </div>

            {apiError && <div className="alert alert-danger">{apiError}</div>}

            <form onSubmit={handleSubmit}>
              
              {/* Email */}
              <FormLabel>Email Address</FormLabel>
              <div className="position-relative mb-3">
                <LuCircleUser size={20} className="position-absolute top-50 translate-middle-y ms-2 text-muted" />
                <FormControl
                  type="email"
                  name="email"
                  className="ps-5"
                  placeholder="Enter email"
                  value={formData.email}
                  onChange={handleChange}
                />
                {errors.email && (
                  <small className="text-danger">{errors.email}</small>
                )}
              </div>

              {/* Password */}
              <FormLabel>Password</FormLabel>
              <div className="position-relative mb-3">
                <LuKeyRound size={20} className="position-absolute top-50 translate-middle-y ms-2 text-muted" />
                <FormControl
                  type="password"
                  name="password"
                  className="ps-5"
                  placeholder="Enter password"
                  value={formData.password}
                  onChange={handleChange}
                />
                {errors.password && (
                  <small className="text-danger">{errors.password}</small>
                )}
              </div>

              <Button
                type="submit"
                className="btn-primary w-100"
                disabled={loading}
              >
                {loading ? "Please wait..." : "Login"}
              </Button>

            </form>

            <div className="text-center mt-3">
              <small className="text-muted">
                © {currentYear} {author}. All Rights Reserved.
              </small>
            </div>

          </Card>
        </Col>
         <Col>
          <div className="h-100 position-relative card-side-img rounded-0 overflow-hidden">
            <div className="p-4 card-img-overlay auth-overlay d-flex align-items-end justify-content-center"></div>
          </div>
        </Col>
      </Row>
    </div>
  );
};

export default Index;
