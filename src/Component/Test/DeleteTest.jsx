import React, { useState } from 'react'
import { Container, Row, Col, Form, Button, Alert, Card } from 'react-bootstrap'
import axios from 'axios'

export default function DeleteTest() {
  const [testId, setTestId] = useState('')
  const [testType, setTestType] = useState('') // 'NORMAL' or 'LIVE'
  const [test, setTest] = useState(null)
  const [message, setMessage] = useState('')
  const [variant, setVariant] = useState('success')
  const [showConfirm, setShowConfirm] = useState(false)

  const handleCheckTest = async () => {
    if (!testType) {
      setMessage('Please select test type.')
      setVariant('danger')
      return
    }
    if (!testId) {
      setMessage('Please enter test ID.')
      setVariant('danger')
      return
    }

    try {
      const endpoint = testType === 'NORMAL'
        ? `http://localhost:8080/test/normal/fetch/${testId}`
        : `http://localhost:8080/test/live/fetch/${testId}`
      const response = await axios.get(endpoint)

      if (response.status === 200 && response.data && response.data.id) {
        setTest(response.data)
        setMessage(`✅ ${testType} test found.`)
        setVariant('success')
        setShowConfirm(true)
      } else {
        setTest(null)
        setShowConfirm(false)
        setMessage('❌ Test not found or invalid ID.')
        setVariant('danger')
      }
    } catch (error) {
      setTest(null)
      setShowConfirm(false)
      if (error.response) {
        setMessage(`❌ Error ${error.response.status}: ${error.response.statusText}`)
      } else {
        setMessage('❌ Network or unexpected error.')
      }
      setVariant('danger')
    }
  }

  const handleDeleteTest = async () => {
    if (!testType) {
      setMessage('Please select test type.')
      setVariant('danger')
      return
    }

    try {
      const endpoint = testType === 'NORMAL'
        ? `http://localhost:8080/test/normal/${testId}`
        : `http://localhost:8080/test/live/${testId}`
      const response = await axios.delete(endpoint)
      if (response.status === 200) {
        setMessage(`✅ ${testType} test deleted successfully.`)
        setVariant('success')
        setTest(null)
        setShowConfirm(false)
        setTestId('')
      } else {
        setMessage('❌ Failed to delete test.')
        setVariant('danger')
      }
    } catch (error) {
      if (error.response) {
        setMessage(`❌ Error ${error.response.status}: ${error.response.statusText}`)
      } else {
        setMessage('❌ Failed to delete test due to network or server issue.')
      }
      setVariant('danger')
    }
  }

  return (
    <Container className="mt-4">
      <Row className="justify-content-md-center">
        <Col md={8}>
          <h2 className="mb-4">Delete Test</h2>
          {message && <Alert variant={variant}>{message}</Alert>}
          <Form.Group className="mb-3">
            <Form.Label>Select Test Type</Form.Label>
            <Form.Select value={testType} onChange={(e) => setTestType(e.target.value)}>
              <option value="">Select test type</option>
              <option value="NORMAL">Normal Test</option>
              <option value="LIVE">Live Test</option>
            </Form.Select>
          </Form.Group>
          <Form.Group className="mb-3">
            <Form.Label>Enter Test ID</Form.Label>
            <Form.Control
              type="text"
              placeholder="Enter test ID"
              value={testId}
              onChange={(e) => setTestId(e.target.value)}
            />
          </Form.Group>
          <Button variant="primary" onClick={handleCheckTest} className="mb-4">
            Check Test
          </Button>

          {test && (
            <Card className="mb-3">
              {test.imageUrl && <Card.Img variant="top" src={test.imageUrl} style={{ maxHeight: '250px', objectFit: 'cover' }} />}
              <Card.Body>
                <Card.Title>{test.title || 'Untitled Test'}</Card.Title>
                <Card.Text>
                  <strong>ID:</strong> {test.id}<br />
                  <strong>Content:</strong> {test.contain || test.description || '—'}<br />
                  <strong>Language:</strong> {test.language || '—'}<br />
                  {test.durationInMinutes != null && (<><strong>Duration:</strong> {test.durationInMinutes} minutes<br /></>)}
                  {test.startingDate && (<><strong>Starting:</strong> {new Date(test.startingDate).toLocaleString()}<br /></>)}
                  {test.endingDate && (<><strong>Ending:</strong> {new Date(test.endingDate).toLocaleString()}<br /></>)}
                  {test.difficulty && (<><strong>Difficulty:</strong> {test.difficulty}<br /></>)}
                  {test.course && (<><strong>Course:</strong> {test.course.id} - {test.course.title || test.course.name}<br /></>)}
                  {test.date && (<><strong>Date:</strong> {test.date}<br /></>)}
                </Card.Text>
              </Card.Body>
            </Card>
          )}

          {showConfirm && (
            <Button variant="danger" onClick={handleDeleteTest}>
              Confirm Delete Test
            </Button>
          )}
        </Col>
      </Row>
    </Container>
  )
}
