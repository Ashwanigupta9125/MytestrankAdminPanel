import React, { useState } from 'react';
import { Container, Row, Col, Form, Button, Alert, Card } from 'react-bootstrap';
import axios from 'axios';

export default function ModifyCourse() {
  const [courseId, setCourseId] = useState('');
  const [form, setForm] = useState(null);
  const [image, setImage] = useState(null);
  const [message, setMessage] = useState('');
  const [variant, setVariant] = useState('success');

  const durations = [15, 30, 70, 90, 180, 356];

  const handleCheckCourse = async () => {
    setMessage('');
    setVariant('success');
    setForm(null);

    if (!courseId) {
      setMessage('Please enter a Course ID.');
      setVariant('danger');
      return;
    }

    try {
      const response = await axios.get(`http://localhost:8080/courses/getcoursebyid/${courseId}`);
      if (response.status === 200 && response.data) {
        const data = response.data;
        
        // Map the flat JSON response to our form state
        const initialForm = {
          name: data.name || '',
          description: data.description || '',
          timeMinutes: data.timeMinutes || 0,
          tags: data.tags ? data.tags.join(', ') : '',
        };

        // Dynamically add all pricing/discount fields from response
        durations.forEach(d => {
          initialForm[`price${d}Days`] = data[`price${d}Days`] || 0;
          initialForm[`discount${d}Days`] = data[`discount${d}Days`] || 0;
        });

        setForm(initialForm);
        setMessage('✅ Course found. You can now modify the details.');
      }
    } catch (error) {
      setMessage('❌ Course not found or error fetching data.');
      setVariant('danger');
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm({ ...form, [name]: value });
  };

  const handleImageChange = (e) => {
    setImage(e.target.files[0]);
  };

  const handleUpdateCourse = async () => {
    console.log("Update button clicked!"); // Check if button is triggered
    console.log("Current Form State:", form);
  
    // 1. Validation Check (Added logs to see which field fails)
    if (!form.name) { console.error("Name missing"); setMessage("Name is required"); setVariant("danger"); return; }
    if (!form.description) { console.error("Description missing"); setMessage("Description is required"); setVariant("danger"); return; }
    if (!form.timeMinutes) { console.error("Time missing"); setMessage("Time is required"); setVariant("danger"); return; }
  
    try {
      // 2. Prepare Tags
      const tagsArray = typeof form.tags === 'string' 
        ? form.tags.split(',').map(tag => tag.trim()).filter(t => t !== "")
        : form.tags;
  
      // 3. Construct the course object
      const courseData = {
        name: form.name,
        description: form.description,
        timeMinutes: parseInt(form.timeMinutes),
        tags: tagsArray,
      };
  
      // 4. Add pricing fields dynamically
      durations.forEach(d => {
        // Use || 0 to prevent NaN if a field is empty
        courseData[`price${d}Days`] = parseFloat(form[`price${d}Days`] || 0);
        courseData[`discount${d}Days`] = parseInt(form[`discount${d}Days`] || 0);
      });
  
      console.log("Data to be sent:", courseData);
  
      // 5. Build FormData
      const formData = new FormData();
      formData.append(
        'course',
        new Blob([JSON.stringify(courseData)], { type: 'application/json' })
      );
      
      if (image) {
        formData.append('image', image);
      }
  
      // 6. API Call
      console.log("Calling API at:", `http://localhost:8080/courses/updatecourse/${courseId}`);
      const response = await axios.put(
        `http://localhost:8080/courses/updatecourse/${courseId}`,
        formData,
        { headers: { 'Content-Type': 'multipart/form-data' } }
      );
  
      if (response.status === 200) {
        setMessage('✅ Course updated successfully!');
        setVariant('success');
        console.log("Success!");
      }
    } catch (error) {
      console.error("API Error:", error);
      setMessage('❌ Error: ' + (error.response?.data?.message || 'Update failed'));
      setVariant('danger');
    }
  };

  return (
    <Container className="my-5">
      <Row className="justify-content-center">
        <Col lg={10}>
          <h2 className="mb-4 text-center">Modify Course Details</h2>
          {message && <Alert variant={variant} dismissible onClose={() => setMessage('')}>{message}</Alert>}

          <Card className="mb-4 shadow-sm">
            <Card.Body>
              <Form onSubmit={e => { e.preventDefault(); handleCheckCourse(); }}>
                <Row className="align-items-end">
                  <Col md={9}>
                    <Form.Group>
                      <Form.Label>Search by Course ID</Form.Label>
                      <Form.Control
                        type="text"
                        placeholder="e.g. 3"
                        value={courseId}
                        onChange={(e) => setCourseId(e.target.value)}
                      />
                    </Form.Group>
                  </Col>
                  <Col md={3}>
                    <Button variant="primary" type="submit" className="w-100">Fetch Details</Button>
                  </Col>
                </Row>
              </Form>
            </Card.Body>
          </Card>

          {form && (
            <Form className="bg-white p-4 border rounded shadow-sm">
              <Row>
                {/* Left Side: Basic Info */}
                <Col md={6}>
                  <h5>General Details</h5>
                  <Form.Group className="mb-3">
                    <Form.Label>Course Name</Form.Label>
                    <Form.Control name="name" value={form.name} onChange={handleChange} />
                  </Form.Group>

                  <Form.Group className="mb-3">
                    <Form.Label>Description</Form.Label>
                    <Form.Control as="textarea" rows={4} name="description" value={form.description} onChange={handleChange} />
                  </Form.Group>

                  <Row>
                    <Col>
                      <Form.Group className="mb-3">
                        <Form.Label>Time (Minutes)</Form.Label>
                        <Form.Control type="number" name="timeMinutes" value={form.timeMinutes} onChange={handleChange} />
                      </Form.Group>
                    </Col>
                    <Col>
                      <Form.Group className="mb-3">
                        <Form.Label>Update Image (Optional)</Form.Label>
                        <Form.Control type="file" accept="image/*" onChange={handleImageChange} />
                      </Form.Group>
                    </Col>
                  </Row>

                  <Form.Group className="mb-3">
                    <Form.Label>Tags</Form.Label>
                    <Form.Control name="tags" value={form.tags} onChange={handleChange} />
                  </Form.Group>
                </Col>

                {/* Right Side: Pricing Grid */}
                <Col md={6} className="border-start">
                  <h5>Pricing & Discounts</h5>
                  <div style={{ maxHeight: '450px', overflowY: 'auto', paddingRight: '10px' }}>
                    {durations.map(days => (
                      <Row key={days} className="mb-3 p-2 bg-light rounded mx-0">
                        <Col xs={12}><strong className="small">{days} Days Plan</strong></Col>
                        <Col xs={6}>
                          <Form.Label className="small mb-0">Price</Form.Label>
                          <Form.Control 
                            size="sm" 
                            type="number" 
                            name={`price${days}Days`} 
                            value={form[`price${days}Days`]} 
                            onChange={handleChange} 
                          />
                        </Col>
                        <Col xs={6}>
                          <Form.Label className="small mb-0">Discount %</Form.Label>
                          <Form.Control 
                            size="sm" 
                            type="number" 
                            name={`discount${days}Days`} 
                            value={form[`discount${days}Days`]} 
                            onChange={handleChange} 
                          />
                        </Col>
                      </Row>
                    ))}
                  </div>
                </Col>
              </Row>

              <div className="text-center mt-4 border-top pt-3">
                <Button variant="warning" size="lg" className="px-5" onClick={handleUpdateCourse}>
                  Update All Course Fields
                </Button>
              </div>
            </Form>
          )}
        </Col>
      </Row>
    </Container>
  );
}