import AppLogo from '@/components/AppLogo'
import { appName } from '@/helpers'
import { Link } from 'react-router'
import { useState } from 'react'
import axios from 'axios'
import { Card, Col, Form, FormControl, FormLabel, Row, Button } from 'react-bootstrap'
import { LuCircleUser, LuMail, LuBuilding2 } from 'react-icons/lu'

const Index = () => {
  const [formData, setFormData] = useState({
    company_name: '',
    full_name: '',
    username: '',
    phone: '',
    email: '',
    password: '',
    confirm_password: '',
  })

  const [errors, setErrors] = useState({})
  const [loading, setLoading] = useState(false)
  const [apiError, setApiError] = useState('')

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    })
  }

  const validate = () => {
    let err = {}

    if (!formData.company_name.trim()) err.company_name = 'Company name is required'
    if (!formData.full_name.trim()) err.full_name = 'Full name is required'
    if (!formData.email.trim()) err.email = 'Email is required'
    if (!formData.password.trim()) err.password = 'Password is required'
    if (!formData.confirm_password.trim()) err.confirm_password = 'Confirm password is required'

    if (formData.password !== formData.confirm_password) {
      err.confirm_password = 'Passwords do not match'
    }

    return err
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setApiError('')
    const v = validate()
    setErrors(v)

    if (Object.keys(v).length !== 0) return

    try {
      setLoading(true)

      const response = await axios.post('http://10.85.81.77:5000/api/auth/register', formData)

      console.log('API Response:', response.data)
      alert('Account created successfully!')

      setFormData({
        company_name: '',
        full_name: '',
        username: '',
        phone: '',
        email: '',
        password: '',
        confirm_password: '',
      })

    } catch (err) {
      console.error('API Error:', err)
      if (err.response?.data?.message) {
        setApiError(err.response.data.message)
      } else {
        setApiError('Something went wrong. Please try again.')
      }
    } finally {
      setLoading(false)
    }
  }

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

            <Form onSubmit={handleSubmit}>

              {/* COMPANY NAME */}
              <FormLabel>Company Name</FormLabel>
              <div className="position-relative mb-3">
                <LuBuilding2 size={20} className="position-absolute top-50 translate-middle-y ms-2 text-muted" />
                <FormControl
                  type="text"
                  name="company_name"
                  className="ps-5"
                  placeholder="Enter company name"
                  value={formData.company_name}
                  onChange={handleChange}
                />
                {errors.company_name && <small className="text-danger">{errors.company_name}</small>}
              </div>

              {/* FULL NAME */}
              <FormLabel>Your Full Name</FormLabel>
              <div className="position-relative mb-3">
                <LuCircleUser size={20} className="position-absolute top-50 translate-middle-y ms-2 text-muted" />
                <FormControl
                  type="text"
                  name="full_name"
                  className="ps-5"
                  placeholder="Enter your full name"
                  value={formData.full_name}
                  onChange={handleChange}
                />
                {errors.full_name && <small className="text-danger">{errors.full_name}</small>}
              </div>

              {/* USERNAME */}
              <FormLabel>Username</FormLabel>
              <div className="mb-3">
                <FormControl
                  type="text"
                  name="username"
                  placeholder="Enter username"
                  value={formData.username}
                  onChange={handleChange}
                />
              </div>

              {/* PHONE */}
              <FormLabel>Phone</FormLabel>
              <div className="mb-3">
                <FormControl
                  type="text"
                  name="phone"
                  placeholder="Enter phone number"
                  value={formData.phone}
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
                  className="ps-5"
                  placeholder="Enter email"
                  value={formData.email}
                  onChange={handleChange}
                />
                {errors.email && <small className="text-danger">{errors.email}</small>}
              </div>

              {/* PASSWORD */}
              <FormLabel>Password</FormLabel>
              <div className="mb-3">
                <FormControl
                  type="password"
                  name="password"
                  placeholder="Enter password"
                  value={formData.password}
                  onChange={handleChange}
                />
                {errors.password && <small className="text-danger">{errors.password}</small>}
              </div>

              {/* CONFIRM PASSWORD */}
              <FormLabel>Confirm Password</FormLabel>
              <div className="mb-3">
                <FormControl
                  type="password"
                  name="confirm_password"
                  placeholder="Confirm password"
                  value={formData.confirm_password}
                  onChange={handleChange}
                />
                {errors.confirm_password && <small className="text-danger">{errors.confirm_password}</small>}
              </div>

              <Button type="submit" disabled={loading} className="w-100 btn-primary">
                {loading ? 'Creating account...' : 'Create Account'}
              </Button>
            </Form>

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
  )
}

export default Index
