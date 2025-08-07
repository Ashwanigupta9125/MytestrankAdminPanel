import React, { useState } from 'react'
import { Form, Button, Container, Row, Col, Alert } from 'react-bootstrap'
import axios from 'axios'

const testTypes = ['NORMAL', 'DEMO', 'LIVE']
const testLanguages = ['ENGLISH', 'HINDI']

export default function AddTest() {
  const [form, setForm] = useState({
    title: '',
    description: '',
    type: '',
    language: '',
    price: '',
    discountPercentage: '',
    durationInMinutes: '',
    contain: '', // <-- lowercase
    scheduledStart: '',
    scheduledEnd: '',
    courseId: ''
  })
  const [image, setImage] = useState(null)
  const [message, setMessage] = useState('')
  const [variant, setVariant] = useState('success')

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value })
  }

  const handleImageChange = (e) => {
    setImage(e.target.files[0])
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    // Validation for scheduled dates
    if (form.scheduledStart && form.scheduledEnd) {
      const start = new Date(form.scheduledStart)
      const end = new Date(form.scheduledEnd)
      if (end <= start) {
        setMessage('Scheduled End must be after Scheduled Start.')
        setVariant('danger')
        return
      }
      const now = new Date()
      if (start < now.setHours(0,0,0,0)) {
        setMessage('Scheduled Start must be today or in the future.')
        setVariant('danger')
        return
      }
    }

    if (
      !form.title ||
      !form.description ||
      !form.type ||
      !form.language ||
      !form.price ||
      !form.discountPercentage ||
      !form.durationInMinutes ||
      !form.contain || // <-- lowercase
      !form.scheduledStart ||
      !form.scheduledEnd ||
      !form.courseId ||
      !image
    ) {
      setMessage('Please fill all fields and select an image.')
      setVariant('danger')
      return
    }

    const testData = {
      title: form.title,
      description: form.description,
      type: form.type,
      language: form.language,
      price: parseFloat(form.price),
      discountPercentage: parseFloat(form.discountPercentage),
      durationInMinutes: parseInt(form.durationInMinutes),
      contain: form.contain, // <-- lowercase
      scheduledStart: form.scheduledStart,
      scheduledEnd: form.scheduledEnd,
      course: {
        id: parseInt(form.courseId)
      }
    }

    const formData = new FormData()
    formData.append('test', new Blob([JSON.stringify(testData)], { type: 'application/json' }))
    formData.append('image', image)

    try {
      const response = await axios.post('http://localhost:8080/tests/addtest', formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      })
      if (response.status === 201 || response.status === 200) {
        setMessage('Test added successfully!')
        setVariant('success')
        setForm({
          title: '',
          description: '',
          type: '',
          language: '',
          price: '',
          discountPercentage: '',
          durationInMinutes: '',
          contain: '', // <-- lowercase
          scheduledStart: '',
          scheduledEnd: '',
          courseId: ''
        })
        setImage(null)
      } else {
        setMessage('Failed to add test.')
        setVariant('danger')
      }
    } catch (error) {
      setMessage('Error: ' + (error.response?.data?.message || error.message))
      setVariant('danger')
    }
  }

  // For scheduledStart, set min to today
  const today = new Date().toISOString().slice(0, 16)

  return (
    <Container className="mt-4">
      <Row className="justify-content-md-center">
        <Col md={8}>
          <h2 className="mb-4">Add Test</h2>
          {message && <Alert variant={variant}>{message}</Alert>}
          <Form onSubmit={handleSubmit}>
            <Form.Group className="mb-3" controlId="formTitle">
              <Form.Label>Title</Form.Label>
              <Form.Control
                type="text"
                name="title"
                value={form.title}
                onChange={handleChange}
                placeholder="Enter test title"
                required
              />
            </Form.Group>
            <Form.Group className="mb-3" controlId="formDescription">
              <Form.Label>Description</Form.Label>
              <Form.Control
                as="textarea"
                name="description"
                value={form.description}
                onChange={handleChange}
                placeholder="Enter test description"
                required
              />
            </Form.Group>
            <Form.Group className="mb-3" controlId="formType">
              <Form.Label>Type</Form.Label>
              <Form.Select
                name="type"
                value={form.type}
                onChange={handleChange}
                required
              >
                <option value="">Select type</option>
                {testTypes.map((type) => (
                  <option key={type} value={type}>{type}</option>
                ))}
              </Form.Select>
            </Form.Group>
            <Form.Group className="mb-3" controlId="formLanguage">
              <Form.Label>Language</Form.Label>
              <Form.Select
                name="language"
                value={form.language}
                onChange={handleChange}
                required
              >
                <option value="">Select language</option>
                {testLanguages.map((lang) => (
                  <option key={lang} value={lang}>{lang}</option>
                ))}
              </Form.Select>
            </Form.Group>
            <Form.Group className="mb-3" controlId="formPrice">
              <Form.Label>Price</Form.Label>
              <Form.Control
                type="number"
                name="price"
                value={form.price}
                onChange={handleChange}
                placeholder="Enter price"
                required
                min="0"
                step="0.01"
              />
            </Form.Group>
            <Form.Group className="mb-3" controlId="formDiscount">
              <Form.Label>Discount Percentage</Form.Label>
              <Form.Control
                type="number"
                name="discountPercentage"
                value={form.discountPercentage}
                onChange={handleChange}
                placeholder="Enter discount percentage"
                required
                min="0"
                max="100"
                step="0.01"
              />
            </Form.Group>
            <Form.Group className="mb-3" controlId="formDuration">
              <Form.Label>Duration (minutes)</Form.Label>
              <Form.Control
                type="number"
                name="durationInMinutes"
                value={form.durationInMinutes}
                onChange={handleChange}
                placeholder="Enter duration in minutes"
                required
                min="1"
              />
            </Form.Group>
            <Form.Group className="mb-3" controlId="formContain">
              <Form.Label>Contain</Form.Label>
              <Form.Control
                as="textarea"
                name="contain" // <-- lowercase
                value={form.contain}
                onChange={handleChange}
                placeholder="Enter test content"
                required
              />
            </Form.Group>
            <Form.Group className="mb-3" controlId="formScheduledStart">
              <Form.Label>Scheduled Start</Form.Label>
              <Form.Control
                type="datetime-local"
                name="scheduledStart"
                value={form.scheduledStart}
                onChange={handleChange}
                required
                min={today}
              />
            </Form.Group>
            <Form.Group className="mb-3" controlId="formScheduledEnd">
              <Form.Label>Scheduled End</Form.Label>
              <Form.Control
                type="datetime-local"
                name="scheduledEnd"
                value={form.scheduledEnd}
                onChange={handleChange}
                required
                min={form.scheduledStart || today}
              />
            </Form.Group>
            <Form.Group className="mb-3" controlId="formCourseId">
              <Form.Label>Course ID</Form.Label>
              <Form.Control
                type="number"
                name="courseId"
                value={form.courseId}
                onChange={handleChange}
                placeholder="Enter course ID"
                required
                min="1"
              />
            </Form.Group>
            <Form.Group className="mb-3" controlId="formImage">
              <Form.Label>Test Image</Form.Label>
              <Form.Control
                type="file"
                accept="image/*"
                onChange={handleImageChange}
                required
              />
            </Form.Group>
            <Button variant="primary" type="submit" className="w-100">
              Add Test
            </Button>
          </Form>
        </Col>
      </Row>
    </Container>
  )
}
