import React, { useState } from 'react';
import { Container, Row, Col, Form, Button, Alert, Card, Spinner } from 'react-bootstrap';
import axios from 'axios';

// 1. Centralized Configuration for easy changes later
const API_CONFIG = {
  BASE_URL: 'http://localhost:8080/banner'
};

export default function DeleteBanner() {
  const [bannerId, setBannerId] = useState('');
  const [banner, setBanner] = useState(null);
  const [message, setMessage] = useState({ text: '', variant: 'info' });
  const [isLoading, setIsLoading] = useState(false);

  // Helper to update messages
  const notify = (text, variant = 'info') => setMessage({ text, variant });

  // STEP 1: Find the banner
  const handleCheckBanner = async () => {
    if (!bannerId.trim()) {
      notify('❌ Please enter a Banner ID.', 'warning');
      return;
    }

    setIsLoading(true);
    notify(''); // Clear previous messages
    setBanner(null);

    try {
      const response = await axios.get(`${API_CONFIG.BASE_URL}/${bannerId}`);
      const data = response.data;

      // Validation logic for existing banner
      if (!data || Object.keys(data).length === 0) {
        notify(`❌ No banner found with ID: ${bannerId}`, 'danger');
      } else {
        setBanner(data);
        notify('✅ Banner found. Please review the details below.', 'success');
      }
    } catch (error) {
      const status = error.response?.status;
      if (status === 404) {
        notify(`❌ Banner ID ${bannerId} does not exist.`, 'danger');
      } else {
        notify(`❌ Server Error: ${error.message}`, 'danger');
      }
    } finally {
      setIsLoading(false);
    }
  };

  // STEP 2: Delete the banner
  const handleDeleteBanner = async () => {
    setIsLoading(true);
    try {
      await axios.delete(`${API_CONFIG.BASE_URL}/removeBanner/${bannerId}`);
      
      // Success Cleanup
      notify(`🗑️ Banner ${bannerId} has been permanently deleted.`, 'success');
      setBanner(null);
      setBannerId('');
    } catch (error) {
      notify(`❌ Failed to delete: ${error.message}`, 'danger');
    } finally {
      setIsLoading(false);
    }
  };

  const handleClear = () => {
    setBannerId('');
    setBanner(null);
    notify('');
  };

  return (
    <Container className="py-5">
      <Row className="justify-content-center">
        <Col md={8} lg={6}>
          <div className="text-center mb-4">
            <h2 className="fw-bold">Banner Management</h2>
            <p className="text-muted">Enter an ID to verify and remove a banner</p>
          </div>

          {/* Search Section */}
          <Card className="shadow-sm mb-4">
            <Card.Body>
              <Form.Group className="mb-3">
                <Form.Label className="fw-semibold">Banner ID</Form.Label>
                <div className="d-flex gap-2">
                  <Form.Control
                    type="text"
                    placeholder="e.g. 101"
                    value={bannerId}
                    onChange={(e) => setBannerId(e.target.value)}
                    disabled={isLoading}
                  />
                  <Button 
                    variant="primary" 
                    onClick={handleCheckBanner} 
                    disabled={isLoading || !bannerId.trim()}
                  >
                    {isLoading ? <Spinner size="sm" /> : 'Find Banner'}
                  </Button>
                </div>
              </Form.Group>
            </Card.Body>
          </Card>

          {/* Global Alerts */}
          {message.text && (
            <Alert variant={message.variant} onClose={() => notify('')} dismissible>
              {message.text}
            </Alert>
          )}

          {/* Result & Delete Section */}
          {banner && (
            <Card className="border-danger shadow-sm animate__animated animate__fadeIn">
              <Card.Header className="bg-danger text-white fw-bold">
                Review Banner Details
              </Card.Header>
              <Card.Body>
                <Row>
                  <Col sm={8}>
                    <h5>{banner.title}</h5>
                    <p className="mb-1 text-muted">{banner.title_detail}</p>
                    <small className="d-block mb-3">
                      <strong>Redirect:</strong> {banner.urlToDirect || 'None'}
                    </small>
                  </Col>
                  {banner.imageUrl && (
                    <Col sm={4}>
                      <img 
                        src={banner.imageUrl} 
                        alt="Preview" 
                        className="img-fluid rounded border" 
                      />
                    </Col>
                  )}
                </Row>

                <hr />
                
                <div className="bg-light p-3 rounded mb-3">
                  <p className="text-danger mb-0 small">
                    <strong>Warning:</strong> Deleting this banner will remove it from all platforms immediately.
                  </p>
                </div>

                <div className="d-flex justify-content-end gap-2">
                  <Button 
                    variant="outline-secondary" 
                    onClick={handleClear}
                    disabled={isLoading}
                  >
                    Cancel
                  </Button>
                  <Button 
                    variant="danger" 
                    onClick={handleDeleteBanner}
                    disabled={isLoading}
                  >
                    {isLoading ? 'Processing...' : 'Yes, Delete Permanently'}
                  </Button>
                </div>
              </Card.Body>
            </Card>
          )}
        </Col>
      </Row>
    </Container>
  );
}