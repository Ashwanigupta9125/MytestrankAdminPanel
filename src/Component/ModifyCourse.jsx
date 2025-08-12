import React, { useState } from 'react'
import { Container, Row, Col, Form, Button, Alert } from 'react-bootstrap'
import axios from 'axios'

export default function ModifyCourse() {
  const [courseId, setCourseId] = useState('')
  const [form, setForm] = useState(null)
  const [image, setImage] = useState(null)
  const [message, setMessage] = useState('')
  const [variant, setVariant] = useState('success')

  const handleCheckCourse = async () => {
    setMessage('')
    setVariant('success')
    setForm(null)
    if (!courseId) {
      setMessage('Please enter a Course ID.')
      setVariant('danger')
      return
    }
    try {
      const response = await axios.get(`https://www.srv620732.hstgr.cloud/courses/getcoursebyid/${courseId}`)
      if (response.status === 200 && response.data && response.data.id) {
        setForm({
          name: response.data.name,
          description: response.data.description,
          price: response.data.price,
          discountPercentage: response.data.discountPercentage,
          tags: response.data.tags ? response.data.tags.join(', ') : ''
        })
        setMessage('✅ Course found. You can now modify and confirm.')
        setVariant('success')
      } else {
        setMessage('❌ Course not found or invalid ID.')
        setVariant('danger')
      }
    } catch (error) {
      setMessage('❌ Error fetching course.')
      setVariant('danger')
    }
  }

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value })
  }

  const handleImageChange = (e) => {
    setImage(e.target.files[0])
  }

  const handleUpdateCourse = async () => {
    if (!form.name || !form.description || !form.price || !form.discountPercentage || !form.tags) {
      setMessage('Please fill all fields.')
      setVariant('danger')
      return
    }
    if (parseFloat(form.price) <= 0) {
      setMessage('Price must be a positive number.')
      setVariant('danger')
      return
    }
    if (
      parseInt(form.discountPercentage) < 1 ||
      parseInt(form.discountPercentage) > 100
    ) {
      setMessage('Discount Percentage must be between 1 and 100.')
      setVariant('danger')
      return
    }
    const tagsArray = form.tags.split(',').map(tag => tag.trim())
    const courseData = {
      name: form.name,
      description: form.description,
      price: parseFloat(form.price),
      discountPercentage: parseFloat(form.discountPercentage),
      tags: tagsArray
    }

    const formData = new FormData()
    formData.append(
      'course',
      new Blob([JSON.stringify(courseData)], { type: 'application/json' })
    )
    if (image) formData.append('image', image)

    try {
      const response = await axios.put(
        `https://www.srv620732.hstgr.cloud/courses/updatecourse/${courseId}`,
        formData,
        { headers: { 'Content-Type': 'multipart/form-data' } }
      )
      if (response.status === 200) {
        setMessage('✅ Course updated successfully.')
        setVariant('success')
        setCourseId('')
        setForm(null)
        setImage(null)
      } else {
        setMessage('❌ Failed to update course.')
        setVariant('danger')
      }
    } catch (error) {
      setMessage('❌ Error updating course.')
      setVariant('danger')
    }
  }

  return (
    <Container className="mt-4">
      <Row className="justify-content-md-center">
        <Col md={8}>
          <h2 className="mb-4 text-center">Modify Course</h2>
          {message && <Alert variant={variant}>{message}</Alert>}

          <Form className="mb-4" onSubmit={e => { e.preventDefault(); handleCheckCourse(); }}>
            <Form.Group className="mb-3">
              <Form.Label>Enter Course ID</Form.Label>
              <Form.Control
                type="text"
                placeholder="Enter course ID"
                value={courseId}
                onChange={(e) => setCourseId(e.target.value)}
              />
            </Form.Group>
            <Button variant="primary" type="submit">
              Fetch Course
            </Button>
          </Form>

          {form && (
            <Form className="mb-4">
              <Form.Group className="mb-3">
                <Form.Label>Name</Form.Label>
                <Form.Control name="name" value={form.name} onChange={handleChange} required />
              </Form.Group>
              <Form.Group className="mb-3">
                <Form.Label>Description</Form.Label>
                <Form.Control as="textarea" name="description" value={form.description} onChange={handleChange} required />
              </Form.Group>
              <Form.Group className="mb-3">
                <Form.Label>Price</Form.Label>
                <Form.Control
                  type="number"
                  name="price"
                  value={form.price}
                  onChange={handleChange}
                  required
                  min="0.01"
                  step="0.01"
                />
              </Form.Group>
              <Form.Group className="mb-3">
                <Form.Label>Discount Percentage</Form.Label>
                <Form.Control
                  type="number"
                  name="discountPercentage"
                  value={form.discountPercentage}
                  onChange={handleChange}
                  required
                  min="1"
                  max="100"
                  step="1"
                />
              </Form.Group>
              <Form.Group className="mb-3">
                <Form.Label>Tags (comma separated)</Form.Label>
                <Form.Control name="tags" value={form.tags} onChange={handleChange} required />
              </Form.Group>
              <Form.Group className="mb-3">
                <Form.Label>Course Image (optional)</Form.Label>
                <Form.Control type="file" accept="image/*" onChange={handleImageChange} />
              </Form.Group>
              <Button variant="warning" onClick={handleUpdateCourse}>
                Confirm & Update Course
              </Button>
            </Form>
          )}
        </Col>
      </Row>
    </Container>
  )
}