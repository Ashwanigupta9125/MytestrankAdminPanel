import React, { useState } from 'react'
import { Container, Row, Col, Form, Button, Alert } from 'react-bootstrap'
import axios from 'axios'

const testTypes = ['NORMAL', 'DEMO', 'LIVE']
const testLanguages = ['ENGLISH', 'HINDI']

export default function ModifyTest() {
  const [testId, setTestId] = useState('')
  const [test, setTest] = useState(null)
  const [form, setForm] = useState(null)
  const [image, setImage] = useState(null)
  const [message, setMessage] = useState('')
  const [variant, setVariant] = useState('success')

  const handleCheckTest = async () => {
    setMessage('')
    setVariant('success')
    setTest(null)
    setForm(null)
    if (!testId) {
      setMessage('Please enter a Test ID.')
      setVariant('danger')
      return
    }
    try {
      const response = await axios.get(`http://localhost:8080/tests/gettestbyid/${testId}`)
      if (response.status === 200 && response.data && response.data.id) {
        setTest(response.data)
        setForm({
          title: response.data.title,
          description: response.data.description,
          type: response.data.type,
          language: response.data.language,
          price: response.data.price,
          discountPercentage: response.data.discountPercentage,
          durationInMinutes: response.data.durationInMinutes,
          contain: response.data.contain || '',
          scheduledStart: response.data.scheduledStart ? response.data.scheduledStart.slice(0, 16) : '',
          scheduledEnd: response.data.scheduledEnd ? response.data.scheduledEnd.slice(0, 16) : '',
          courseId: response.data.course?.id || ''
        })
        setMessage('✅ Test found. You can now modify and confirm.')
        setVariant('success')
      } else {
        setMessage('❌ Test not found or invalid ID.')
        setVariant('danger')
      }
    } catch (error) {
      setMessage('❌ Error fetching test.')
      setVariant('danger')
    }
  }

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value })
  }

  const handleImageChange = (e) => {
    setImage(e.target.files[0])
  }

  const handleUpdateTest = async () => {
    if (
      !form.title ||
      !form.description ||
      !form.type ||
      !form.language ||
      !form.price ||
      !form.discountPercentage ||
      !form.durationInMinutes ||
      !form.contain ||
      !form.scheduledStart ||
      !form.scheduledEnd ||
      !form.courseId
    ) {
      setMessage('Please fill all fields.')
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
      contain: form.contain,
      scheduledStart: form.scheduledStart,
      scheduledEnd: form.scheduledEnd,
      course: {
        id: parseInt(form.courseId)
      }
    }
    const formData = new FormData()
    formData.append('test', new Blob([JSON.stringify(testData)], { type: 'application/json' }))
    if (image) formData.append('image', image)

    try {
      const response = await axios.put(`http://localhost:8080/tests/updatetest/${testId}`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      })
      if (response.status === 200) {
        setMessage('✅ Test updated successfully.')
        setVariant('success')
        setTestId('')
        setTest(null)
        setForm(null)
        setImage(null)
      } else {
        setMessage('❌ Failed to update test.')
        setVariant('danger')
      }
    } catch (error) {
      setMessage('❌ Error updating test.')
      setVariant('danger')
    }
  }

  return (
    <Container className="mt-4">
      <Row className="justify-content-md-center">
        <Col md={8}>
          <h2 className="mb-4 text-center">Modify Test</h2>
          {message && <Alert variant={variant}>{message}</Alert>}

          <Form className="mb-4" onSubmit={e => { e.preventDefault(); handleCheckTest(); }}>
            <Form.Group className="mb-3">
              <Form.Label>Enter Test ID</Form.Label>
              <Form.Control
                type="text"
                placeholder="Enter test ID"
                value={testId}
                onChange={(e) => setTestId(e.target.value)}
              />
            </Form.Group>
            <Button variant="primary" type="submit">
              Fetch Test
            </Button>
          </Form>

          {form && (
            <Form className="mb-4">
              <Form.Group className="mb-3">
                <Form.Label>Title</Form.Label>
                <Form.Control name="title" value={form.title} onChange={handleChange} required />
              </Form.Group>
              <Form.Group className="mb-3">
                <Form.Label>Description</Form.Label>
                <Form.Control as="textarea" name="description" value={form.description} onChange={handleChange} required />
              </Form.Group>
              <Form.Group className="mb-3">
                <Form.Label>Type</Form.Label>
                <Form.Select name="type" value={form.type} onChange={handleChange} required>
                  <option value="">Select type</option>
                  {testTypes.map(type => (
                    <option key={type} value={type}>{type}</option>
                  ))}
                </Form.Select>
              </Form.Group>
              <Form.Group className="mb-3">
                <Form.Label>Language</Form.Label>
                <Form.Select name="language" value={form.language} onChange={handleChange} required>
                  <option value="">Select language</option>
                  {testLanguages.map(lang => (
                    <option key={lang} value={lang}>{lang}</option>
                  ))}
                </Form.Select>
              </Form.Group>
              <Form.Group className="mb-3">
                <Form.Label>Price</Form.Label>
                <Form.Control type="number" name="price" value={form.price} onChange={handleChange} required />
              </Form.Group>
              <Form.Group className="mb-3">
                <Form.Label>Discount Percentage</Form.Label>
                <Form.Control type="number" name="discountPercentage" value={form.discountPercentage} onChange={handleChange} required />
              </Form.Group>
              <Form.Group className="mb-3">
                <Form.Label>Duration (minutes)</Form.Label>
                <Form.Control type="number" name="durationInMinutes" value={form.durationInMinutes} onChange={handleChange} required />
              </Form.Group>
              <Form.Group className="mb-3">
                <Form.Label>Contain</Form.Label>
                <Form.Control as="textarea" name="contain" value={form.contain} onChange={handleChange} required />
              </Form.Group>
              <Form.Group className="mb-3">
                <Form.Label>Scheduled Start</Form.Label>
                <Form.Control type="datetime-local" name="scheduledStart" value={form.scheduledStart} onChange={handleChange} required />
              </Form.Group>
              <Form.Group className="mb-3">
                <Form.Label>Scheduled End</Form.Label>
                <Form.Control type="datetime-local" name="scheduledEnd" value={form.scheduledEnd} onChange={handleChange} required />
              </Form.Group>
              <Form.Group className="mb-3">
                <Form.Label>Course ID</Form.Label>
                <Form.Control type="number" name="courseId" value={form.courseId} onChange={handleChange} required />
              </Form.Group>
              <Form.Group className="mb-3">
                <Form.Label>Test Image (optional)</Form.Label>
                <Form.Control type="file" accept="image/*" onChange={handleImageChange} />
              </Form.Group>
              <Button variant="warning" onClick={handleUpdateTest}>
                Confirm & Update Test
              </Button>
            </Form>
          )}
        </Col>
      </Row>
    </Container>
  )
}