// SignIn.jsx
import AppLogo from '@/components/AppLogo';
import { appName, author, currentYear } from '@/helpers';
import { Link } from "react-router";
import { Card, CardBody, Col, FormControl, Row, Button, FormLabel } from 'react-bootstrap';
import { LuCircleUser, LuKeyRound } from 'react-icons/lu';
import { useAuthForm } from '@/hooks/useAuthForm';
import { loginApi } from '@/api/authApi';

const SignIn = () => {
  const initialValues = {
    email: "",
    password: "",
  };

  const {
    values,
    errors,
    loading,
    apiError,
    handleChange,
    handleSubmit
  } = useAuthForm(initialValues, loginApi, 'login');

  return (
    <div className="auth-box p-0 w-100">
      <Row className="w-100 g-0">
        <Col md={'auto'} >
          <Card className="auth-box-form border-0 mb-0 p-4">
            <div className="text-center mb-4">
              <AppLogo height={80} />
              <h3 className="mt-3 fw-bold">Login</h3>
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
                  className={`ps-5 ${errors.email ? 'is-invalid' : ''}`}
                  placeholder="Enter email"
                  value={values.email}
                  onChange={handleChange}
                />
                {errors.email && (
                  <div className="invalid-feedback d-block">{errors.email}</div>
                )}
              </div>

              {/* Password */}
              <FormLabel>Password</FormLabel>
              <div className="position-relative mb-3">
                <LuKeyRound size={20} className="position-absolute top-50 translate-middle-y ms-2 text-muted" />
                <FormControl
                  type="password"
                  name="password"
                  className={`ps-5 ${errors.password ? 'is-invalid' : ''}`}
                  placeholder="Enter password"
                  value={values.password}
                  onChange={handleChange}
                />
                {errors.password && (
                  <div className="invalid-feedback d-block">{errors.password}</div>
                )}
              </div>

              <Button
                type="submit"
                className="btn-primary w-100"
                disabled={loading}
              >
                {loading ? "Logging in..." : "Login"}
              </Button>

              <div className="text-center mt-3">
                <span className="text-muted">
                  Don't have an account? <Link to="/auth-2/sign-up">Sign up</Link>
                </span>
              </div>
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

export default SignIn;