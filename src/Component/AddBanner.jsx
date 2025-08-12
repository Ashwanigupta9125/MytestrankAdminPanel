import React, { useState } from 'react';
import { Form, Button, Container, Row, Col, Alert } from 'react-bootstrap';
import axios from 'axios';

export default function AddBanner() {
  const [form, setForm] = useState({
    title: '',
    title_detail: '',
    urlToDirect: ''
  });
  const [image, setImage] = useState(null);
  const [message, setMessage] = useState('');
  const [variant, setVariant] = useState('success');

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleImageChange = (e) => {
    setImage(e.target.files[0]);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!form.title || !form.title_detail || !form.urlToDirect || !image) {
      setMessage('Please fill all fields and select an image.');
      setVariant('danger');
      return;
    }

    const formData = new FormData();

    // Convert form object to JSON and add it as "banner"
    const bannerBlob = new Blob([JSON.stringify(form)], {
      type: 'application/json',
    });
    formData.append('banner', bannerBlob);
    formData.append('image', image);

    try {
      const response = await axios.post(
        'http://www.srv620732.hstgr.cloud/banner/addbanner',
        formData,
        {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        }
      );

      if (response.status === 201) {
        setMessage('✅ Banner added successfully!');
        setVariant('success');
        setForm({ title: '', title_detail: '', urlToDirect: '' });
        setImage(null);
      } else {
        setMessage('❌ Failed to add banner.');
        setVariant('danger');
      }
    } catch (error) {
      setMessage('Error: ' + (error.response?.data || error.message));
      setVariant('danger');
    }
  };

  return (
    <Container className="mt-4">
      <Row className="justify-content-md-center">
        <Col md={6}>
          <h2 className="mb-4">Add Banner</h2>
          {message && <Alert variant={variant}>{message}</Alert>}
          <Form onSubmit={handleSubmit}>
            <Form.Group className="mb-3" controlId="formTitle">
              <Form.Label>Title</Form.Label>
              <Form.Control
                type="text"
                name="title"
                value={form.title}
                onChange={handleChange}
                placeholder="Enter banner title"
                required
              />
            </Form.Group>

            <Form.Group className="mb-3" controlId="formTitleDetail">
              <Form.Label>Title Detail</Form.Label>
              <Form.Control
                type="text"
                name="title_detail"
                value={form.title_detail}
                onChange={handleChange}
                placeholder="Enter banner detail"
                required
              />
            </Form.Group>

            <Form.Group className="mb-3" controlId="formUrlToDirect">
              <Form.Label>URL to Direct</Form.Label>
              <Form.Control
                type="url"
                name="urlToDirect"
                value={form.urlToDirect}
                onChange={handleChange}
                placeholder="Enter redirect URL"
                required
              />
            </Form.Group>

            <Form.Group className="mb-3" controlId="formImage">
              <Form.Label>Banner Image</Form.Label>
              <Form.Control
                type="file"
                accept="image/*"
                onChange={handleImageChange}
                required
              />
            </Form.Group>

            <Button variant="primary" type="submit" className="w-100">
              Add Banner
            </Button>
          </Form>
        </Col>
      </Row>
    </Container>
  );
}
