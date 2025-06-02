import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Container, Card, Form, Button, Alert, Row, Col } from 'react-bootstrap';
import { useAuth } from '../../contexts/AuthContext';
import { Formik } from 'formik';
import * as Yup from 'yup';

const validationSchema = Yup.object().shape({
  first_name: Yup.string()
    .required('First name is required'),
  last_name: Yup.string()
    .required('Last name is required'),
  email: Yup.string()
    .email('Invalid email address')
    .required('Email is required'),
  password: Yup.string()
    .required('Password is required')
    .min(8, 'Password must be at least 8 characters'),
  password_confirmation: Yup.string()
    .oneOf([Yup.ref('password'), null], 'Passwords must match')
    .required('Password confirmation is required'),
  gender: Yup.string(),
  country: Yup.string(),
  phone: Yup.string(),
});

const Register = () => {
  const { register } = useAuth();
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (values, { setSubmitting }) => {
    try {
      setError('');
      setLoading(true);
      await register(values);
      navigate('/');
    } catch (error) {
      if (error.response?.data?.errors) {
        // Format validation errors
        const validationErrors = Object.entries(error.response.data.errors)
          .map(([field, errors]) => `${field}: ${errors.join(', ')}`)
          .join('. ');
        setError(validationErrors);
      } else {
        setError(
          error.response?.data?.message || 
          'Failed to create account.'
        );
      }
    } finally {
      setLoading(false);
      setSubmitting(false);
    }
  };

  return (
    <div className="auth-form-container">
      <Container className="auth-form" style={{ maxWidth: '600px' }}>
        <Card className="shadow-sm">
          <Card.Body className="p-4">
            <div className="text-center mb-4">
              <h2>Social Analytics</h2>
              <p className="text-muted">Create Your Account</p>
            </div>

            {error && <Alert variant="danger">{error}</Alert>}

            <Formik
              initialValues={{ 
                first_name: '', 
                last_name: '', 
                email: '', 
                password: '', 
                password_confirmation: '',
                gender: '',
                country: '',
                phone: ''
              }}
              validationSchema={validationSchema}
              onSubmit={handleSubmit}
            >
              {({
                values,
                errors,
                touched,
                handleChange,
                handleBlur,
                handleSubmit,
                isSubmitting,
              }) => (
                <Form onSubmit={handleSubmit}>
                  <Row>
                    <Col md={6}>
                      <Form.Group className="mb-3">
                        <Form.Label>First Name</Form.Label>
                        <Form.Control
                          type="text"
                          name="first_name"
                          placeholder="First Name"
                          value={values.first_name}
                          onChange={handleChange}
                          onBlur={handleBlur}
                          isInvalid={touched.first_name && errors.first_name}
                        />
                        <Form.Control.Feedback type="invalid">
                          {errors.first_name}
                        </Form.Control.Feedback>
                      </Form.Group>
                    </Col>
                    <Col md={6}>
                      <Form.Group className="mb-3">
                        <Form.Label>Last Name</Form.Label>
                        <Form.Control
                          type="text"
                          name="last_name"
                          placeholder="Last Name"
                          value={values.last_name}
                          onChange={handleChange}
                          onBlur={handleBlur}
                          isInvalid={touched.last_name && errors.last_name}
                        />
                        <Form.Control.Feedback type="invalid">
                          {errors.last_name}
                        </Form.Control.Feedback>
                      </Form.Group>
                    </Col>
                  </Row>

                  <Form.Group className="mb-3">
                    <Form.Label>Email Address</Form.Label>
                    <Form.Control
                      type="email"
                      name="email"
                      placeholder="Email"
                      value={values.email}
                      onChange={handleChange}
                      onBlur={handleBlur}
                      isInvalid={touched.email && errors.email}
                    />
                    <Form.Control.Feedback type="invalid">
                      {errors.email}
                    </Form.Control.Feedback>
                  </Form.Group>

                  <Row>
                    <Col md={6}>
                      <Form.Group className="mb-3">
                        <Form.Label>Password</Form.Label>
                        <Form.Control
                          type="password"
                          name="password"
                          placeholder="Password"
                          value={values.password}
                          onChange={handleChange}
                          onBlur={handleBlur}
                          isInvalid={touched.password && errors.password}
                        />
                        <Form.Control.Feedback type="invalid">
                          {errors.password}
                        </Form.Control.Feedback>
                      </Form.Group>
                    </Col>
                    <Col md={6}>
                      <Form.Group className="mb-3">
                        <Form.Label>Confirm Password</Form.Label>
                        <Form.Control
                          type="password"
                          name="password_confirmation"
                          placeholder="Confirm Password"
                          value={values.password_confirmation}
                          onChange={handleChange}
                          onBlur={handleBlur}
                          isInvalid={touched.password_confirmation && errors.password_confirmation}
                        />
                        <Form.Control.Feedback type="invalid">
                          {errors.password_confirmation}
                        </Form.Control.Feedback>
                      </Form.Group>
                    </Col>
                  </Row>
                  
                  <Row>
                    <Col md={6}>
                      <Form.Group className="mb-3">
                        <Form.Label>Gender</Form.Label>
                        <Form.Select
                          name="gender"
                          value={values.gender}
                          onChange={handleChange}
                          onBlur={handleBlur}
                        >
                          <option value="">Select Gender</option>
                          <option value="male">Male</option>
                          <option value="female">Female</option>
                          <option value="other">Other</option>
                        </Form.Select>
                      </Form.Group>
                    </Col>
                    <Col md={6}>
                      <Form.Group className="mb-3">
                        <Form.Label>Country</Form.Label>
                        <Form.Control
                          type="text"
                          name="country"
                          placeholder="Country"
                          value={values.country}
                          onChange={handleChange}
                          onBlur={handleBlur}
                        />
                      </Form.Group>
                    </Col>
                  </Row>

                  <Form.Group className="mb-3">
                    <Form.Label>Phone Number</Form.Label>
                    <Form.Control
                      type="text"
                      name="phone"
                      placeholder="Phone Number"
                      value={values.phone}
                      onChange={handleChange}
                      onBlur={handleBlur}
                    />
                  </Form.Group>

                  <Button
                    variant="primary"
                    type="submit"
                    className="w-100 mt-3"
                    disabled={isSubmitting || loading}
                  >
                    {loading ? 'Creating Account...' : 'Create Account'}
                  </Button>
                </Form>
              )}
            </Formik>
            
            <div className="text-center mt-3">
              <p>
                Already have an account?{' '}
                <Link to="/login">Sign In</Link>
              </p>
            </div>
          </Card.Body>
        </Card>
      </Container>
    </div>
  );
};

export default Register;