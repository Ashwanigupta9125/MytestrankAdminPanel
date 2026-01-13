import React, { useState } from 'react';
import { Container, Row, Col, Card, Button, Alert, Spinner, Form, Table, Badge } from 'react-bootstrap';
import axios from 'axios';

// --- CONFIGURATION ---
const API_BASE_URL = 'http://localhost:8080/banner';

export default function ArrangeBannerOrder() {
  const [bannerId, setBannerId] = useState('');
  const [orderNumber, setOrderNumber] = useState('');
  const [entries, setEntries] = useState([]); // Array of { BannerId: Long, Order: Integer }
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState({ text: '', variant: 'info' });

  const notify = (text, variant = 'info') => setMessage({ text, variant });

  // Handle adding a new entry
  const handleAddEntry = () => {
    // Validate inputs
    if (!bannerId.trim() || !orderNumber.trim()) {
      notify('Please enter both Banner ID and Order Number.', 'warning');
      return;
    }

    const bannerIdNum = parseInt(bannerId);
    const orderNum = parseInt(orderNumber);

    if (isNaN(bannerIdNum) || bannerIdNum <= 0) {
      notify('Banner ID must be a valid positive number.', 'warning');
      return;
    }

    if (isNaN(orderNum) || orderNum <= 0) {
      notify('Order Number must be a valid positive number.', 'warning');
      return;
    }

    // Check for duplicate Banner ID
    if (entries.some(entry => entry.BannerId === bannerIdNum)) {
      notify(`Banner ID ${bannerIdNum} is already in the list.`, 'warning');
      return;
    }

    // Add entry to the list
    const newEntry = {
      BannerId: bannerIdNum,
      Order: orderNum
    };

    setEntries([...entries, newEntry]);
    
    // Clear input fields
    setBannerId('');
    setOrderNumber('');
    
    notify('Entry added successfully.', 'success');
  };

  // Handle removing an entry
  const handleRemoveEntry = (index) => {
    const updatedEntries = entries.filter((_, i) => i !== index);
    setEntries(updatedEntries);
    notify('Entry removed.', 'info');
  };

  // Handle clear all entries
  const handleClearAll = () => {
    setEntries([]);
    notify('All entries cleared.', 'info');
  };

  // Validate entries before submission
  const validateEntries = () => {
    if (entries.length === 0) {
      notify('Please add at least one entry before submitting.', 'warning');
      return false;
    }

    // Check for duplicate order numbers
    const orderNumbers = entries.map(e => e.Order);
    const orderSet = new Set(orderNumbers);
    if (orderSet.size !== orderNumbers.length) {
      notify('Order numbers must be unique. Please check for duplicates.', 'warning');
      return false;
    }

    // Check for duplicate banner IDs (shouldn't happen, but just in case)
    const bannerIds = entries.map(e => e.BannerId);
    const bannerIdSet = new Set(bannerIds);
    if (bannerIdSet.size !== bannerIds.length) {
      notify('Banner IDs must be unique. Please check for duplicates.', 'warning');
      return false;
    }

    return true;
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    if (e) e.preventDefault();
    
    if (!validateEntries()) {
      return;
    }

    setIsLoading(true);
    notify('Submitting banner arrangement...', 'info');

    try {
      // Prepare payload matching Java DTO structure
      // Jackson expects lowercase/camelCase: order and bannerId (not Order and BannerId)
      const payload = entries.map(entry => ({
        order: entry.Order,
        bannerId: entry.BannerId
      }));

      console.log('Sending payload:', payload); // Debug log

      const response = await axios.post(`${API_BASE_URL}/arrangeInOrder`, payload, {
        headers: {
          'Content-Type': 'application/json'
        }
      });

      if (response.status === 200) {
        notify('✅ Banner order arranged successfully!', 'success');
        // Optionally clear entries after successful submission
        setEntries([]);
        setBannerId('');
        setOrderNumber('');
      }
    } catch (error) {
      const errorMsg = error.response?.data?.message || error.response?.data || error.message;
      notify(`❌ Error: ${errorMsg}`, 'danger');
    } finally {
      setIsLoading(false);
    }
  };

  // Handle Enter key press in input fields
  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleAddEntry();
    }
  };

  return (
    <Container className="py-5">
      <Row className="justify-content-center">
        <Col lg={10}>
          <Card className="shadow-sm">
            <Card.Header className="bg-dark text-white p-3">
              <h4 className="mb-0">Arrange Banner Display Order</h4>
            </Card.Header>
            <Card.Body className="p-4">
              <p className="text-muted mb-4">
                Enter Banner ID and Order Number to set the display sequence. 
                Add multiple entries as needed. Lower order numbers will appear first.
              </p>

              {message.text && (
                <Alert variant={message.variant} onClose={() => setMessage({ text: '' })} dismissible>
                  {message.text}
                </Alert>
              )}

              {/* Input Form */}
              <Card className="mb-4 border-primary">
                <Card.Header className="bg-primary text-white">
                  <h6 className="mb-0">Add Banner Entry</h6>
                </Card.Header>
                <Card.Body>
                  <Row>
                    <Col md={5}>
                      <Form.Group className="mb-3">
                        <Form.Label className="fw-semibold">Banner ID</Form.Label>
                        <Form.Control
                          type="number"
                          min="1"
                          placeholder="Enter Banner ID (e.g., 1, 2, 3...)"
                          value={bannerId}
                          onChange={(e) => setBannerId(e.target.value)}
                          onKeyPress={handleKeyPress}
                          disabled={isLoading}
                        />
                      </Form.Group>
                    </Col>
                    <Col md={5}>
                      <Form.Group className="mb-3">
                        <Form.Label className="fw-semibold">Order Number</Form.Label>
                        <Form.Control
                          type="number"
                          min="1"
                          placeholder="Enter Order Number (e.g., 1, 2, 3...)"
                          value={orderNumber}
                          onChange={(e) => setOrderNumber(e.target.value)}
                          onKeyPress={handleKeyPress}
                          disabled={isLoading}
                        />
                      </Form.Group>
                    </Col>
                    <Col md={2} className="d-flex align-items-end">
                      <Button
                        variant="primary"
                        className="w-100 mb-3"
                        onClick={handleAddEntry}
                        disabled={isLoading}
                      >
                        Add
                      </Button>
                    </Col>
                  </Row>
                  <small className="text-muted">
                    💡 Tip: Press Enter after entering both values to quickly add an entry.
                  </small>
                </Card.Body>
              </Card>

              {/* Entries Table */}
              {entries.length > 0 && (
                <Card className="mb-4">
                  <Card.Header className="bg-secondary text-white d-flex justify-content-between align-items-center">
                    <h6 className="mb-0">Banner Entries ({entries.length})</h6>
                    <Button variant="outline-light" size="sm" onClick={handleClearAll}>
                      Clear All
                    </Button>
                  </Card.Header>
                  <Card.Body>
                    <div style={{ maxHeight: '400px', overflowY: 'auto' }}>
                      <Table striped bordered hover responsive>
                        <thead className="table-dark">
                          <tr>
                            <th style={{ width: '60px' }}>#</th>
                            <th>Banner ID</th>
                            <th>Order Number</th>
                            <th style={{ width: '100px' }}>Action</th>
                          </tr>
                        </thead>
                        <tbody>
                          {entries.map((entry, index) => (
                            <tr key={index}>
                              <td className="text-center fw-bold">{index + 1}</td>
                              <td>
                                <Badge bg="info" className="p-2">{entry.BannerId}</Badge>
                              </td>
                              <td>
                                <Badge bg="success" className="p-2">#{entry.Order}</Badge>
                              </td>
                              <td className="text-center">
                                <Button
                                  variant="outline-danger"
                                  size="sm"
                                  onClick={() => handleRemoveEntry(index)}
                                  disabled={isLoading}
                                >
                                  Remove
                                </Button>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </Table>
                    </div>
                  </Card.Body>
                </Card>
              )}

              {/* Submit Button */}
              <div className="d-grid gap-2">
                <Button
                  variant="success"
                  size="lg"
                  onClick={handleSubmit}
                  disabled={isLoading || entries.length === 0}
                >
                  {isLoading ? (
                    <>
                      <Spinner animation="border" size="sm" className="me-2" />
                      Submitting...
                    </>
                  ) : (
                    'Submit Banner Arrangement'
                  )}
                </Button>
                {entries.length === 0 && (
                  <small className="text-muted text-center">
                    Add at least one entry to submit
                  </small>
                )}
              </div>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  );
}
