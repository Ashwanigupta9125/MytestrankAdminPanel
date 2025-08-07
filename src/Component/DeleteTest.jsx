import React, { useState } from 'react'
import { Container, Row, Col, Form, Button, Alert, Card } from 'react-bootstrap'
import axios from 'axios'

export default function DeleteTest() {
  const [testId, setTestId] = useState('')
  const [test, setTest] = useState(null)
  const [message, setMessage] = useState('')
  const [variant, setVariant] = useState('success')
  const [showConfirm, setShowConfirm] = useState(false)

  const handleCheckTest = async () => {
    try {
      const response = await axios.get(`http://localhost:8080/fetch/testbyId/${testId}`)

      if (response.status === 200 && response.data && response.data.id) {
        setTest(response.data)
        setMessage('✅ Test found.')
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
    try {
      const response = await axios.delete(`http://localhost:8080/tests/deletetest/${testId}`)
      if (response.status === 200) {
        setMessage('✅ Test deleted successfully.')
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
              <Card.Img variant="top" src={test.imageUrl} style={{ maxHeight: '250px', objectFit: 'cover' }} />
              <Card.Body>
                <Card.Title>{test.title}</Card.Title>
                <Card.Text>
                  <strong>ID:</strong> {test.id}<br />
                  <strong>Description:</strong> {test.description}<br />
                  <strong>Type:</strong> {test.type}<br />
                  <strong>Language:</strong> {test.language}<br />
                  <strong>Price:</strong> ₹{test.price}<br />
                  <strong>Discount:</strong> {test.discountPercentage}%<br />
                  <strong>Duration:</strong> {test.durationInMinutes} minutes<br />
                  <strong>Scheduled Start:</strong> {new Date(test.scheduledStart).toLocaleString()}<br />
                  <strong>Scheduled End:</strong> {new Date(test.scheduledEnd).toLocaleString()}<br />
                  <strong>Date:</strong> {test.date}
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
