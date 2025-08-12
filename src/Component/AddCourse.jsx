import React, { useState } from 'react'
import { Form, Button, Container, Row, Col, Alert } from 'react-bootstrap'
import axios from 'axios'

export default function AddCourse() {
  const [form, setForm] = useState({
    name: '',
    description: '',
    price: '',
    discountPercentage: '',
    tags: ''
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
    if (!form.name || !form.description || !form.price || !form.discountPercentage || !form.tags || !image) {
      setMessage('Please fill all fields and select an image.')
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
    formData.append('course', new Blob([JSON.stringify(courseData)], { type: 'application/json' }))
    formData.append('image', image)

    try {
      const response = await axios.post('https://www.srv620732.hstgr.cloud/courses/addcourse', formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      })
      if (response.status === 200) {
        setMessage('Course added successfully!')
        setVariant('success')
        setForm({
          name: '',
          description: '',
          price: '',
          discountPercentage: '',
          tags: ''
        })
        setImage(null)
      } else {
        setMessage('Failed to add course.')
        setVariant('danger')
      }
    } catch (error) {
      setMessage('Error: ' + (error.response?.data?.message || error.message))
      setVariant('danger')
    }
  }

  return (
    <Container className="mt-4">
      <Row className="justify-content-md-center">
        <Col md={6}>
          <h2 className="mb-4">Add Course</h2>
          {message && <Alert variant={variant}>{message}</Alert>}
          <Form onSubmit={handleSubmit}>
            <Form.Group className="mb-3" controlId="formName">
              <Form.Label>Course Name</Form.Label>
              <Form.Control
                type="text"
                name="name"
                value={form.name}
                onChange={handleChange}
                placeholder="Enter course name"
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
                placeholder="Enter course description"
                required
              />
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
            <Form.Group className="mb-3" controlId="formTags">
              <Form.Label>Tags (comma separated)</Form.Label>
              <Form.Control
                type="text"
                name="tags"
                value={form.tags}
                onChange={handleChange}
                placeholder="e.g. java, programming, backend, spring"
                required
              />
            </Form.Group>
            <Form.Group className="mb-3" controlId="formImage">
              <Form.Label>Course Image</Form.Label>
              <Form.Control
                type="file"
                accept="image/*"
                onChange={handleImageChange}
                required
              />
            </Form.Group>
            <Button variant="primary" type="submit" className="w-100">
              Add Course
            </Button>
          </Form>
        </Col>
      </Row>
    </Container>
  )
}