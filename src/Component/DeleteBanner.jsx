import React, { useState } from 'react';
import { Container, Row, Col, Form, Button, Alert, Card } from 'react-bootstrap';
import axios from 'axios';

export default function DeleteBanner() {
  const [bannerId, setBannerId] = useState('');
  const [banner, setBanner] = useState(null);
  const [message, setMessage] = useState('');
  const [variant, setVariant] = useState('info');
  const [showConfirm, setShowConfirm] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleCheckBanner = async () => {
    if (!bannerId.trim()) {
      setMessage('❌ Please enter a Banner ID.');
      setVariant('warning');
      return;
    }

    setIsLoading(true);
    setMessage('');
    setBanner(null);
    setShowConfirm(false);

    try {
      const response = await axios.get(`http://88.222.214.204:8085/banner/${bannerId}`);
      const data = response.data;

      // Handle null, empty object, or missing expected fields
      if (
        !data || 
        Object.keys(data).length === 0 || 
        !data.title || 
        !data.title_detail
      ) {
        setBanner(null);
        setShowConfirm(false);
        setMessage(`❌ Banner not found for ID: ${bannerId}`);
        setVariant('danger');
        return;
      }

      // Valid banner
      setBanner(data);
      setMessage(`✅ Banner found for ID: ${bannerId}`);
      setVariant('success');
      setShowConfirm(true);
    } catch (error) {
      setBanner(null);
      setShowConfirm(false);
      
      if (error.response && error.response.status === 404) {
        setMessage(`❌ Banner not found for ID: ${bannerId}`);
      } else {
        setMessage(`❌ Error while checking banner: ${error.message}`);
      }
      setVariant('danger');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteBanner = async () => {
    if (!bannerId.trim()) {
      setMessage('❌ Please enter a Banner ID.');
      setVariant('warning');
      return;
    }

    setIsLoading(true);
    
    try {
      await axios.delete(`http://88.222.214.204:8085/banner/removeBanner/${bannerId}`);
      setMessage(`✅ Banner deleted successfully for ID: ${bannerId}`);
      setVariant('success');
      setBanner(null);
      setShowConfirm(false);
      setBannerId('');
    } catch (error) {
      if (error.response && error.response.status === 404) {
        setMessage(`❌ Banner not found for ID: ${bannerId}`);
      } else {
        setMessage(`❌ Failed to delete banner: ${error.message}`);
      }
      setVariant('danger');
    } finally {
      setIsLoading(false);
    }
  };

  const handleClear = () => {
    setBannerId('');
    setBanner(null);
    setMessage('');
    setShowConfirm(false);
  };

  return (
    <Container className="mt-4">
      <Row className="justify-content-md-center">
        <Col md={6}>
          <h2 className="mb-4">Delete Banner</h2>

          {message && <Alert variant={variant}>{message}</Alert>}

          <Form.Group className="mb-3">
            <Form.Label>Enter Banner ID</Form.Label>
            <Form.Control
              type="text"
              placeholder="Enter Banner ID (e.g., 1, 2, 3...)"
              value={bannerId}
              onChange={(e) => setBannerId(e.target.value)}
              disabled={isLoading}
            />
          </Form.Group>

          <div className="mb-3">
            <Button 
              variant="primary" 
              onClick={handleCheckBanner} 
              disabled={isLoading || !bannerId.trim()}
              className="me-2"
            >
              {isLoading ? 'Checking...' : 'Check Banner'}
            </Button>
            
            <Button 
              variant="outline-secondary" 
              onClick={handleClear}
              disabled={isLoading}
            >
              Clear
            </Button>
          </div>

          {banner && (
            <Card className="mb-3">
              <Card.Body>
                <Card.Title>{banner.title}</Card.Title>
                <Card.Text>
                  <strong>Detail:</strong> {banner.title_detail}<br />
                  <strong>Redirect URL:</strong> {banner.urlToDirect}<br />
                  <strong>Banner ID:</strong> {bannerId}
                </Card.Text>
                {banner.imageUrl && (
                  <img src={banner.imageUrl} alt="Banner" style={{ width: '100%', maxHeight: '200px', objectFit: 'contain' }} />
                )}
              </Card.Body>
            </Card>
          )}

          {showConfirm && (
            <Card className="mb-3 border-warning">
              <Card.Body>
                <Card.Title className="text-warning">⚠️ Confirmation Required</Card.Title>
                <Card.Text>
                  Are you sure you want to delete this banner? This action cannot be undone.
                </Card.Text>
                <div>
                  <Button 
                    variant="danger" 
                    onClick={handleDeleteBanner} 
                    disabled={isLoading}
                    className="me-2"
                  >
                    {isLoading ? 'Deleting...' : 'Yes, Delete Banner'}
                  </Button>
                  <Button 
                    variant="secondary" 
                    onClick={() => setShowConfirm(false)}
                    disabled={isLoading}
                  >
                    Cancel
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
