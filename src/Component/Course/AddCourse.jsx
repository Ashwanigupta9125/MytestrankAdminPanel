import React, { useState } from 'react';
import { Form, Button, Container, Row, Col, Alert, Card } from 'react-bootstrap';
import axios from 'axios';

export default function AddCourse() {
  const [form, setForm] = useState({
    name: '',
    description: '',
    TimeMinutes: '',
    tags: '',
    // Initializing all duration fields to ensure they are controlled
    price15Days: '', discount15Days: 0,
    price30Days: '', discount30Days: 0,
    price70Days: '', discount70Days: 0,
    price90Days: '', discount90Days: 0,
    price180Days: '', discount180Days: 0,
    price356Days: '', discount356Days: 0,
  });

  const [imageFile, setImageFile] = useState(null);
  const [message, setMessage] = useState('');
  const [variant, setVariant] = useState('success');

  // List of durations to map through for UI generation
  const durations = [15, 30, 70, 90, 180, 356];

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm({ ...form, [name]: value });
  };

  const handleFileChange = (e) => {
    setImageFile(e.target.files[0]);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
  
    const formData = new FormData();
  
    // 1. Create a plain object with all your course data
    const courseData = {
      name: form.name,
      description: form.description,
      timeMinutes: parseInt(form.TimeMinutes), // Use lowercase 't' here to match Java
      tags: form.tags.split(',').map(tag => tag.trim()).filter(tag => tag !== ""),
      price15Days: parseFloat(form.price15Days),
      discount15Days: parseInt(form.discount15Days),
      price30Days: parseFloat(form.price30Days),
      discount30Days: parseInt(form.discount30Days),
      price70Days: parseFloat(form.price70Days),
      discount70Days: parseInt(form.discount70Days),
      price90Days: parseFloat(form.price90Days),
      discount90Days: parseInt(form.discount90Days),
      price180Days: parseFloat(form.price180Days),
      discount180Days: parseInt(form.discount180Days),
      price356Days: parseFloat(form.price356Days),
      discount356Days: parseInt(form.discount356Days),
    };
  
    // 2. Append the object as a JSON Blob named 'course'
    // This is what @RequestPart("course") looks for
    formData.append('course', new Blob([JSON.stringify(courseData)], {
      type: 'application/json'
    }));
  
    // 3. Append the image file separately
    if (imageFile) {
      formData.append('image', imageFile);
    }
  
    try {
      const response = await axios.post('http://localhost:8080/courses/addcourse', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      
      if (response.status === 200) {
        setMessage('Course added successfully!');
        setVariant('success');
        
        // Reset all form fields
        setForm({
          name: '',
          description: '',
          TimeMinutes: '',
          tags: '',
          price15Days: '', discount15Days: 0,
          price30Days: '', discount30Days: 0,
          price70Days: '', discount70Days: 0,
          price90Days: '', discount90Days: 0,
          price180Days: '', discount180Days: 0,
          price356Days: '', discount356Days: 0,
        });
        
        setImageFile(null);
      } else {
        setMessage('Failed to add course. Please try again.');
        setVariant('danger');
      }
    } catch (error) {
      // handle error
      setMessage('An error occurred. Please try again later.');
      setVariant('danger');
    }
  };

  return (
    <Container className="my-5">
      <Row className="justify-content-center">
        <Col lg={10}>
          <Card className="shadow-sm">
            <Card.Header className="bg-primary text-white">
              <h3 className="mb-0">Create New Course</h3>
            </Card.Header>
            <Card.Body>
              {message && <Alert variant={variant} dismissible onClose={() => setMessage('')}>{message}</Alert>}
              
              <Form onSubmit={handleSubmit}>
                <Row>
                  {/* Left Column: Basic Info */}
                  <Col md={6}>
                    <h5>General Information</h5>
                    <Form.Group className="mb-3">
                      <Form.Label>Course Name*</Form.Label>
                      <Form.Control 
                        name="name" 
                        value={form.name} 
                        onChange={handleChange} 
                        required 
                        placeholder="e.g. Full Stack Java Developer"
                      />
                    </Form.Group>

                    <Form.Group className="mb-3">
                      <Form.Label>Description*</Form.Label>
                      <Form.Control 
                        as="textarea" 
                        rows={5} 
                        name="description" 
                        value={form.description} 
                        onChange={handleChange} 
                        required 
                        maxLength={2000}
                        placeholder="Detailed course description..."
                      />
                    </Form.Group>

                    <Row>
                      <Col>
                        <Form.Group className="mb-3">
                          <Form.Label>Total Time (Minutes)*</Form.Label>
                          <Form.Control 
                            type="number" 
                            name="TimeMinutes" 
                            value={form.TimeMinutes} 
                            onChange={handleChange} 
                            required 
                          />
                        </Form.Group>
                      </Col>
                      <Col>
                        <Form.Group className="mb-3">
                          <Form.Label>Course Banner*</Form.Label>
                          <Form.Control 
                            type="file" 
                            onChange={handleFileChange} 
                            accept="image/*" 
                            required
                          />
                        </Form.Group>
                      </Col>
                    </Row>

                    <Form.Group className="mb-3">
                      <Form.Label>Tags (Comma separated)</Form.Label>
                      <Form.Control 
                        name="tags" 
                        value={form.tags} 
                        placeholder="Java, Spring Boot, React, MySQL" 
                        onChange={handleChange} 
                      />
                    </Form.Group>
                  </Col>

                  {/* Right Column: All Pricing Fields */}
                  <Col md={6} className="border-start">
                    <h5>Pricing & Validity</h5>
                    <p className="text-muted small">Enter prices and percentage discounts for each duration.</p>
                    
                    <div style={{ maxHeight: '500px', overflowY: 'auto', paddingRight: '10px' }}>
                      {durations.map((days) => (
                        <Card key={days} className="mb-3 bg-light border-0">
                          <Card.Body className="py-2">
                            <h6>{days} Days Plan</h6>
                            <Row>
                              <Col>
                                <Form.Label className="small">Price (₹)</Form.Label>
                                <Form.Control 
                                  type="number" 
                                  name={`price${days}Days`} 
                                  placeholder="0.00"
                                  value={form[`price${days}Days`]}
                                  onChange={handleChange}
                                  required
                                />
                              </Col>
                              <Col>
                                <Form.Label className="small">Discount (%)</Form.Label>
                                <Form.Control 
                                  type="number" 
                                  name={`discount${days}Days`} 
                                  placeholder="0"
                                  value={form[`discount${days}Days`]}
                                  onChange={handleChange}
                                />
                              </Col>
                            </Row>
                          </Card.Body>
                        </Card>
                      ))}
                    </div>
                  </Col>
                </Row>

                <div className="text-center mt-4">
                  <Button variant="primary" type="submit" size="lg" className="px-5">
                    Save Course to Database
                  </Button>
                </div>
              </Form>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  );
}