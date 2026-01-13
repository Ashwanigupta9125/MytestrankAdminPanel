import React, { useState } from 'react';
import { Container, Row, Col, Form, Button, Alert, Card, Image } from 'react-bootstrap';
import axios from 'axios';

// --- CONFIGURATION ---
const API_BASE_URL = 'http://localhost:8080/banner';

export default function ModifyBanner() {
  const [bannerId, setBannerId] = useState('');
  const [banner, setBanner] = useState(null); // Current data from server
  const [form, setForm] = useState(null);     // Editable data
  const [image, setImage] = useState(null);   // New image file
  const [message, setMessage] = useState('');
  const [variant, setVariant] = useState('success');
  const [isLoading, setIsLoading] = useState(false);

  // 1. Fetch Banner Details
  const handleCheckBanner = async (e) => {
    if (e) e.preventDefault();
    setMessage('');
    setBanner(null);
    setForm(null);
    setIsLoading(true);

    if (!bannerId.trim()) {
      setMessage('Please enter a Banner ID.');
      setVariant('warning');
      setIsLoading(false);
      return;
    }

    try {
      const response = await axios.get(`${API_BASE_URL}/${bannerId}`);
      if (response.data && response.data.id) {
        setBanner(response.data);
        // Initialize form with existing data
        setForm({
          title: response.data.title || '',
          urlToDirect: response.data.urlToDirect || ''
        });
        setMessage('✅ Banner found. You can now modify the details.');
        setVariant('success');
      }
    } catch (error) {
      setMessage(error.response?.status === 404 ? '❌ Banner not found.' : '❌ Error fetching banner.');
      setVariant('danger');
    } finally {
      setIsLoading(false);
    }
  };

  // 2. Handle Inputs
  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleImageChange = (e) => {
    setImage(e.target.files[0]);
  };

  // 3. Update Banner
  const handleUpdateBanner = async () => {
    if (!form.title || !form.urlToDirect) {
      setMessage('Please fill in all required fields.');
      setVariant('danger');
      return;
    }

    setIsLoading(true);
    const formData = new FormData();
    
    // Constructing the payload based on your API structure
    const bannerBlob = new Blob([JSON.stringify(form)], { type: 'application/json' });
    formData.append('banner', bannerBlob);
    
    if (image) {
      formData.append('image', image);
    }

    try {
      // Endpoint updated to /update/{id} as requested
      await axios.put(`${API_BASE_URL}/update/${bannerId}`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });

      setMessage('✨ Banner updated successfully!');
      setVariant('success');
      // Reset after success
      setBanner(null);
      setForm(null);
      setBannerId('');
      setImage(null);
    } catch (error) {
      setMessage('❌ Failed to update banner: ' + (error.response?.data?.message || error.message));
      setVariant('danger');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Container className="mt-5 mb-5">
      <Row className="justify-content-center">
        <Col md={8} lg={7}>
          <Card className="shadow-sm border-0">
            <Card.Body className="p-4">
              <h2 className="mb-4 text-center fw-bold text-primary">Modify Banner</h2>
              
              {message && <Alert variant={variant} className="text-center">{message}</Alert>}

              {/* SEARCH SECTION */}
              <Form onSubmit={handleCheckBanner} className="mb-4">
                <Form.Group className="mb-3">
                  <Form.Label className="fw-semibold">Banner ID</Form.Label>
                  <div className="d-flex gap-2">
                    <Form.Control
                      type="number"
                      placeholder="Enter ID (e.g., 52)"
                      value={bannerId}
                      onChange={(e) => setBannerId(e.target.value)}
                      disabled={isLoading}
                    />
                    <Button variant="primary" type="submit" disabled={isLoading}>
                      {isLoading && !form ? 'Searching...' : 'Fetch'}
                    </Button>
                  </div>
                </Form.Group>
              </Form>

              {/* EDIT SECTION */}
              {form && (
                <div className="animate__animated animate__fadeIn">
                  <hr className="my-4" />
                  <Row className="mb-4 align-items-center">
                    <Col xs={12} md={5} className="text-center">
                      <p className="text-muted small mb-1">Current Banner Image</p>
                      <Image 
                        src={banner?.imageUrl} 
                        thumbnail 
                        className="shadow-sm" 
                        style={{ maxHeight: '150px' }} 
                      />
                      <div className="mt-2 small text-muted">Created: {banner?.date}</div>
                    </Col>
                    <Col xs={12} md={7}>
                      <Form.Group className="mb-3">
                        <Form.Label className="fw-semibold">Banner Title</Form.Label>
                        <Form.Control 
                          name="title" 
                          value={form.title} 
                          onChange={handleChange} 
                          required 
                        />
                      </Form.Group>

                      <Form.Group className="mb-3">
                        <Form.Label className="fw-semibold">Redirect URL</Form.Label>
                        <Form.Control 
                          name="urlToDirect" 
                          value={form.urlToDirect} 
                          onChange={handleChange} 
                          required 
                        />
                      </Form.Group>
                    </Col>
                  </Row>

                  <Form.Group className="mb-4">
                    <Form.Label className="fw-semibold">Change Image (Optional)</Form.Label>
                    <Form.Control 
                      type="file" 
                      accept="image/*" 
                      onChange={handleImageChange} 
                    />
                    <Form.Text className="text-muted">
                      Keep empty if you don't want to change the image.
                    </Form.Text>
                  </Form.Group>

                  <div className="d-grid gap-2">
                    <Button 
                      variant="warning" 
                      size="lg" 
                      onClick={handleUpdateBanner}
                      disabled={isLoading}
                      className="fw-bold"
                    >
                      {isLoading ? 'Updating...' : 'Confirm & Save Changes'}
                    </Button>
                    <Button 
                      variant="link" 
                      className="text-muted" 
                      onClick={() => {setForm(null); setBanner(null);}}
                    >
                      Cancel
                    </Button>
                  </div>
                </div>
              )}
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  );
}