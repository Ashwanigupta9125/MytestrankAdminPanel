import React, { useState } from 'react'
import { Container, Row, Col, Form, Button, Alert, Card, Badge } from 'react-bootstrap'
import axios from 'axios'

export default function DeleteCourse() {
  const [courseId, setCourseId] = useState('')
  const [course, setCourse] = useState(null)
  const [message, setMessage] = useState('')
  const [variant, setVariant] = useState('success')
  const [showConfirm, setShowConfirm] = useState(false)

  const handleCheckCourse = async () => {
    try {
      const response = await axios.get(`http://www.srv620732.hstgr.cloud/courses/getcoursebyid/${courseId}`)

      if (response.status === 200 && response.data && response.data.id) {
        setCourse(response.data)
        setMessage('✅ Course found.')
        setVariant('success')
        setShowConfirm(true)
      } else {
        setCourse(null)
        setShowConfirm(false)
        setMessage('❌ Course not found or invalid ID.')
        setVariant('danger')
      }
    } catch (error) {
      setCourse(null)
      setShowConfirm(false)
      if (error.response) {
        setMessage(`❌ Error ${error.response.status}: ${error.response.statusText}`)
      } else {
        setMessage('❌ Network or unexpected error.')
      }
      setVariant('danger')
    }
  }

  const handleDeleteCourse = async () => {
    try {
      const response = await axios.delete(`http://www.srv620732.hstgr.cloud/courses/removecourse/${courseId}`)
      if (response.status === 200) {
        setMessage('✅ Course deleted successfully.')
        setVariant('success')
        setCourse(null)
        setShowConfirm(false)
        setCourseId('')
      } else {
        setMessage('❌ Failed to delete course.')
        setVariant('danger')
      }
    } catch (error) {
      if (error.response) {
        setMessage(`❌ Error ${error.response.status}: ${error.response.statusText}`)
      } else {
        setMessage('❌ Failed to delete course due to network or server issue.')
      }
      setVariant('danger')
    }
  }

  return (
    <Container className="mt-4">
      <Row className="justify-content-md-center">
        <Col md={8}>
          <h2 className="mb-4">Delete Course</h2>

          {message && <Alert variant={variant}>{message}</Alert>}

          <Form.Group className="mb-3">
            <Form.Label>Enter Course ID</Form.Label>
            <Form.Control
              type="text"
              placeholder="Enter course ID"
              value={courseId}
              onChange={(e) => setCourseId(e.target.value)}
            />
          </Form.Group>

          <Button variant="primary" onClick={handleCheckCourse} className="mb-4">
            Check Course
          </Button>

          {course && (
            <Card className="mb-3 shadow">
              {course.imageUrl && (
                <Card.Img
                  variant="top"
                  src={course.imageUrl}
                  style={{ maxHeight: '300px', objectFit: 'cover' }}
                />
              )}
              <Card.Body>
                <Card.Title>{course.name}</Card.Title>
                <Card.Text>
                  <strong>ID:</strong> {course.id}<br />
                  <strong>Description:</strong> {course.description}<br />
                  <strong>Price:</strong> ₹{course.price}<br />
                  <strong>Discount:</strong> {course.discountPercentage}%<br />
                  <strong>Date:</strong> {course.date}<br />
                  <strong>Tags:</strong><br />
                  {course.tags && course.tags.map((tag, idx) => (
                    <Badge key={idx} bg="secondary" className="me-2">{tag}</Badge>
                  ))}
                </Card.Text>
              </Card.Body>
            </Card>
          )}

          {showConfirm && (
            <Button variant="danger" onClick={handleDeleteCourse}>
              Confirm Delete Course
            </Button>
          )}
        </Col>
      </Row>
    </Container>
  )
}
