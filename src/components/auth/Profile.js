import React, { useState } from 'react';
import { Container, Row, Col, Card, Form, Button, Alert } from 'react-bootstrap';
import { useAuth } from '../../contexts/AuthContext';
import api from '../../services/api';
import { Formik } from 'formik';
import * as Yup from 'yup';

const validationSchema = Yup.object().shape({
  first_name: Yup.string().required('First name is required'),
  last_name: Yup.string().required('Last name is required'),
  gender: Yup.string(),
  country: Yup.string(),
  phone: Yup.string()
});

const Profile = () => {
  const { currentUser, refreshToken } = useAuth();
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (values, { setSubmitting }) => {
    try {
      setError('');
      setSuccess('');
      setLoading(true);
      
      await api.put('/api/auth/profile', {
        first_name: values.first_name,
        last_name: values.last_name,
        gender: values.gender,
        country: values.country,
        phone: values.phone
      });
      
      setSuccess('Profile updated successfully!');
      
      // Refresh user data
      await refreshToken();
      
    } catch (error) {
      setError(
        error.response?.data?.message || 
        'Failed to update profile.'
      );
    } finally {
      setLoading(false);
      setSubmitting(false);
    }
  };

  if (!currentUser) {
    return <div className="text-center p-5">Loading profile...</div>;
  }

  return (
    <Container>
      <h2 className="mb-4">Your Profile</h2>
      
      <Row>
        <Col md={8}>
          <Card className="shadow-sm mb-4">
            <Card.Header>
              <h5 className="mb-0">Profile Information</h5>
            </Card.Header>
            <Card.Body>
              {error && <Alert variant="danger">{error}</Alert>}
              {success && <Alert variant="success">{success}</Alert>}
              
              <Formik
                initialValues={{
                  first_name: currentUser.first_name || '',
                  last_name: currentUser.last_name || '',
                  email: currentUser.email || '',
                  gender: currentUser.gender || '',
                  country: currentUser.country || '',
                  phone: currentUser.phone || '',
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
                        value={values.email}
                        disabled
                        readOnly
                      />
                      <Form.Text className="text-muted">
                        Email address cannot be changed
                      </Form.Text>
                    </Form.Group>

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
                        value={values.phone}
                        onChange={handleChange}
                        onBlur={handleBlur}
                      />
                    </Form.Group>

                    <Button
                      variant="primary"
                      type="submit"
                      disabled={isSubmitting || loading}
                    >
                      {loading ? 'Saving...' : 'Save Changes'}
                    </Button>
                  </Form>
                )}
              </Formik>
            </Card.Body>
          </Card>
        </Col>

        <Col md={4}>
          <Card className="shadow-sm mb-4">
            <Card.Header>
              <h5 className="mb-0">Account Details</h5>
            </Card.Header>
            <Card.Body>
              <p><strong>Member Since:</strong> {new Date(currentUser.created_at).toLocaleDateString()}</p>
              <p><strong>Last Updated:</strong> {new Date(currentUser.updated_at).toLocaleDateString()}</p>
            </Card.Body>
          </Card>

          <Card className="shadow-sm">
            <Card.Header>
              <h5 className="mb-0">Security</h5>
            </Card.Header>
            <Card.Body>
              <Button variant="secondary" className="w-100 mb-3">
                Change Password
              </Button>
              <Button variant="outline-danger" className="w-100">
                Delete Account
              </Button>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  );
};

export default Profile;