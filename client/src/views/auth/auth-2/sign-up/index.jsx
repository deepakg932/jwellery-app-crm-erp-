// SignUp.jsx
import AppLogo from '@/components/AppLogo';
import { appName } from '@/helpers';
import { Link } from 'react-router';
import { Card, Col, FormControl, FormLabel, Row, Button } from 'react-bootstrap';
import { LuCircleUser, LuMail, LuBuilding2, LuKeyRound, LuUser, LuPhone } from 'react-icons/lu';
import { useAuthForm } from '@/hooks/useAuthForm';
import { registerApi } from '@/api/authApi';

const SignUp = () => {
  const initialValues = {
    company_name: '',
    full_name: '',
    username: '',
    phone: '',
    email: '',
    password: '',
    confirm_password: '',
  };

  const {
    values,
    errors,
    loading,
    apiError,
    handleChange,
    handleSubmit
  } = useAuthForm(initialValues, registerApi, 'register');

  return (
    <div className="auth-box p-0 w-100">
      <Row className="w-100 g-0">
        <Col md="auto">
          <Card className="auth-box-form border-0 mb-0 p-4">
            <div className="text-center mb-4">
              <AppLogo height={120} />
              <h3 className="mt-3 fw-bold">{appName} – Register</h3>
              <p className="text-muted">Create your business account</p>
            </div>

            {apiError && <div className="alert alert-danger">{apiError}</div>}

            <form onSubmit={handleSubmit}>
              {/* COMPANY NAME */}
              <FormLabel>Company Name</FormLabel>
              <div className="position-relative mb-3">
                <LuBuilding2 size={20} className="position-absolute top-50 translate-middle-y ms-2 text-muted" />
                <FormControl
                  type="text"
                  name="company_name"
                  className={`ps-5 ${errors.company_name ? 'is-invalid' : ''}`}
                  placeholder="Enter company name"
                  value={values.company_name}
                  onChange={handleChange}
                />
                {errors.company_name && <div className="invalid-feedback d-block">{errors.company_name}</div>}
              </div>

              {/* FULL NAME */}
              <FormLabel>Your Full Name</FormLabel>
              <div className="position-relative mb-3">
                <LuCircleUser size={20} className="position-absolute top-50 translate-middle-y ms-2 text-muted" />
                <FormControl
                  type="text"
                  name="full_name"
                  className={`ps-5 ${errors.full_name ? 'is-invalid' : ''}`}
                  placeholder="Enter your full name"
                  value={values.full_name}
                  onChange={handleChange}
                />
                {errors.full_name && <div className="invalid-feedback d-block">{errors.full_name}</div>}
              </div>

              {/* USERNAME */}
              <FormLabel>Username</FormLabel>
              <div className="position-relative mb-3">
                <LuUser size={20} className="position-absolute top-50 translate-middle-y ms-2 text-muted" />
                <FormControl
                  type="text"
                  name="username"
                  className="ps-5"
                  placeholder="Enter username"
                  value={values.username}
                  onChange={handleChange}
                />
              </div>

              {/* PHONE */}
              <FormLabel>Phone</FormLabel>
              <div className="position-relative mb-3">
                <LuPhone size={20} className="position-absolute top-50 translate-middle-y ms-2 text-muted" />
                <FormControl
                  type="text"
                  name="phone"
                  className="ps-5"
                  placeholder="Enter phone number"
                  value={values.phone}
                  onChange={handleChange}
                />
              </div>

              {/* EMAIL */}
              <FormLabel>Email Address</FormLabel>
              <div className="position-relative mb-3">
                <LuMail size={20} className="position-absolute top-50 translate-middle-y ms-2 text-muted" />
                <FormControl
                  type="email"
                  name="email"
                  className={`ps-5 ${errors.email ? 'is-invalid' : ''}`}
                  placeholder="Enter email"
                  value={values.email}
                  onChange={handleChange}
                />
                {errors.email && <div className="invalid-feedback d-block">{errors.email}</div>}
              </div>

              {/* PASSWORD */}
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
                {errors.password && <div className="invalid-feedback d-block">{errors.password}</div>}
              </div>

              {/* CONFIRM PASSWORD */}
              <FormLabel>Confirm Password</FormLabel>
              <div className="position-relative mb-3">
                <LuKeyRound size={20} className="position-absolute top-50 translate-middle-y ms-2 text-muted" />
                <FormControl
                  type="password"
                  name="confirm_password"
                  className={`ps-5 ${errors.confirm_password ? 'is-invalid' : ''}`}
                  placeholder="Confirm password"
                  value={values.confirm_password}
                  onChange={handleChange}
                />
                {errors.confirm_password && <div className="invalid-feedback d-block">{errors.confirm_password}</div>}
              </div>

              <Button type="submit" disabled={loading} className="w-100 btn-primary">
                {loading ? 'Creating account...' : 'Create Account'}
              </Button>
            </form>

            <div className="text-center mt-3">
              <span className="text-muted">
                Already have an account? <Link to="/auth-2/sign-in">Login</Link>
              </span>
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

export default SignUp;