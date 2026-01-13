import React, { useState, useEffect } from 'react'
import { Form, Button, Container, Row, Col, Alert, Card } from 'react-bootstrap'
import axios from 'axios'

const testLanguages = ['ENGLISH', 'HINDI']
const difficultyLevels = ['EASY', 'MEDIUM', 'HARD']

export default function AddTest() {
  const [testType, setTestType] = useState('') // 'NORMAL' or 'LIVE'
  const [form, setForm] = useState({
    // Common fields
    title: '',
    language: '',
    // Test content (used for both Normal and Live)
    contain: '',
    courseId: '',
    // Live Test fields
    durationInMinutes: '',
    startingDate: '',
    endingDate: '',
    difficulty: ''
  })

  const [message, setMessage] = useState('')
  const [variant, setVariant] = useState('success')

  const [courses, setCourses] = useState([])
  const [loadingCourses, setLoadingCourses] = useState(false)

  useEffect(() => {
    const fetchCourses = async () => {
      setLoadingCourses(true)
      try {
        const res = await axios.get('http://localhost:8080/fetch/allCourseMainPage')
        const data = Array.isArray(res.data) ? res.data : []
        setCourses(data)
      } catch (error) {
        console.error('Error fetching courses:', error)
      } finally {
        setLoadingCourses(false)
      }
    }
    fetchCourses()
  }, [])

  const handleTestTypeChange = (e) => {
    const selectedType = e.target.value
    setTestType(selectedType)
    // Reset form when changing test type
    setForm({
      title: '',
      language: '',
      contain: '',
      courseId: '',
      durationInMinutes: '',
      startingDate: '',
      endingDate: '',
      difficulty: ''
    })
    setMessage('')
  }

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value })
  }

  // Ensure datetime-local matches backend pattern yyyy-MM-dd'T'HH:mm:ss.SSS'Z'
  // Add seconds, milliseconds and trailing Z when missing
  const normalizeDateTime = (dt) => {
    if (!dt) return dt
    // 'YYYY-MM-DDTHH:mm' -> add ':00.000Z'
    if (dt.length === 16) return dt + ':00.000Z'
    // 'YYYY-MM-DDTHH:mm:ss' -> add '.000Z'
    if (dt.length === 19) return dt + '.000Z'
    // if already has seconds and milliseconds but missing Z, add Z
    if (dt.includes('.') && !dt.endsWith('Z')) return dt + 'Z'
    // if already ends with Z and missing millis, inject .000 before Z
    if (dt.endsWith('Z') && !dt.includes('.')) return dt.replace(/Z$/, '.000Z')
    return dt
  }



  const handleSubmit = async (e) => {
    e.preventDefault()

    if (!testType) {
      setMessage('Please select a test type (Normal or Live).')
      setVariant('danger')
      return
    }

    // Validate based on test type
    if (testType === 'NORMAL') {
      if (!form.title || !form.contain || !form.language || !form.courseId) {
        setMessage('Please fill all required fields for Normal Test.')
        setVariant('danger')
        return
      }
    } else if (testType === 'LIVE') {
      if (!form.title || !form.contain || !form.language || !form.durationInMinutes || 
          !form.startingDate || !form.endingDate || !form.difficulty) {
        setMessage('Please fill all required fields for Live Test.')
        setVariant('danger')
        return
      }

      // Validate dates for Live Test
      if (form.startingDate && form.endingDate) {
        const start = new Date(form.startingDate)
        const end = new Date(form.endingDate)
        if (end <= start) {
          setMessage('Ending Date must be after Starting Date.')
          setVariant('danger')
          return
        }
        const now = new Date()
        if (start < now.setHours(0,0,0,0)) {
          setMessage('Starting Date must be today or in the future.')
          setVariant('danger')
          return
        }
      }

      // Validate duration
      if (parseInt(form.durationInMinutes) <= 0) {
        setMessage('Duration must be a positive number.')
        setVariant('danger')
        return
      }
    }


    let testData = {}

    if (testType === 'NORMAL') {
      testData = {
        title: form.title,
        contain: form.contain,
        language: form.language,
        // send both courseId and course object (id only) so backend can use either
        courseId: parseInt(form.courseId),
        course: { id: parseInt(form.courseId) }
      }
    } else if (testType === 'LIVE') {
      testData = {
        title: form.title,
        contain: form.contain,
        language: form.language,
        durationInMinutes: parseInt(form.durationInMinutes),
        startingDate: normalizeDateTime(form.startingDate),
        endingDate: normalizeDateTime(form.endingDate),
        difficulty: form.difficulty
      }
    }

    // Determine the endpoint based on test type
    const endpoint = testType === 'NORMAL' 
      ? 'http://localhost:8080/test/normal'
      : 'http://localhost:8080/test/live'

    try {
      const response = await axios.post(endpoint, testData, {
        headers: {
          'Content-Type': 'application/json'
        }
      })
      if (response.status === 201 || response.status === 200) {
        setMessage(`✅ ${testType} Test added successfully!`)
        setVariant('success')
        setTestType('')
        setForm({
          title: '',
          language: '',
          contain: '',
          courseId: '',
          durationInMinutes: '',
          startingDate: '',
          endingDate: '',
          difficulty: ''
        })
        
      } else {
        setMessage('Failed to add test.')
        setVariant('danger')
      }
    } catch (error) {
      setMessage('Error: ' + (error.response?.data?.message || error.message))
      setVariant('danger')
    }
  }

  const today = new Date().toISOString().slice(0, 16)

  return (
    <Container className="mt-4">
      <Row className="justify-content-md-center">
        <Col md={10}>
          <h2 className="mb-4 text-center">Add Test</h2>
          {message && <Alert variant={variant}>{message}</Alert>}

          <Card className="mb-4">
            <Card.Header className="bg-primary text-white">
              <h5 className="mb-0">Select Test Type</h5>
            </Card.Header>
            <Card.Body>
              <Form.Group className="mb-3">
                <Form.Label><strong>Test Type</strong> <span className="text-danger">*</span></Form.Label>
                <Form.Select
                  value={testType}
                  onChange={handleTestTypeChange}
                  required
                >
                  <option value="">Select test type</option>
                  <option value="NORMAL">Normal Test</option>
                  <option value="LIVE">Live Test</option>
                </Form.Select>
                <Form.Text className="text-muted">
                  Choose between Normal Test or Live Test
                </Form.Text>
              </Form.Group>
            </Card.Body>
          </Card>

          {testType && (
            <Card>
              <Card.Header className={testType === 'NORMAL' ? 'bg-info text-white' : 'bg-success text-white'}>
                <h5 className="mb-0">Add {testType} Test</h5>
              </Card.Header>
              <Card.Body>
                <Form onSubmit={handleSubmit}>
                  {/* Common Fields */}
                  <Form.Group className="mb-3">
                    <Form.Label><strong>Title</strong> <span className="text-danger">*</span></Form.Label>
                    <Form.Control
                      type="text"
                      name="title"
                      value={form.title}
                      onChange={handleChange}
                      placeholder="Enter test title"
                      required
                    />
                  </Form.Group>

                  {/* Normal Test Fields */}
                  {testType === 'NORMAL' && (
                    <>
                      <Form.Group className="mb-3">
                        <Form.Label><strong>Contain</strong> <span className="text-danger">*</span></Form.Label>
                        <Form.Control
                          as="textarea"
                          rows={5}
                          name="contain"
                          value={form.contain}
                          onChange={handleChange}
                          placeholder="Enter test content"
                          required
                        />
                      </Form.Group>
                      <Form.Group className="mb-3">
                        <Form.Label><strong>Language</strong> <span className="text-danger">*</span></Form.Label>
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
                      <Form.Group className="mb-3">
                        <Form.Label><strong>Course</strong> <span className="text-danger">*</span></Form.Label>
                        <Form.Select
                          name="courseId"
                          value={form.courseId}
                          onChange={handleChange}
                          required
                          disabled={loadingCourses}
                        >
                          <option value="">
                            {loadingCourses ? 'Loading courses...' : 'Select a course'}
                          </option>
                          {courses.map(course => (
                            <option key={course.id} value={course.id}>
                              {course.id} - {course.title || course.name || 'Untitled Course'}
                            </option>
                          ))}
                        </Form.Select>
                      </Form.Group>
                    </>
                  )}

                  {/* Live Test Fields */}
                  {testType === 'LIVE' && (
                    <>
                      <Form.Group className="mb-3">
                        <Form.Label><strong>Contain</strong> <span className="text-danger">*</span></Form.Label>
                        <Form.Control
                          as="textarea"
                          rows={5}
                          name="contain"
                          value={form.contain}
                          onChange={handleChange}
                          placeholder="Enter test content"
                          required
                        />
                      </Form.Group>
                      <Form.Group className="mb-3">
                        <Form.Label><strong>Language</strong> <span className="text-danger">*</span></Form.Label>
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
                      <Form.Group className="mb-3">
                        <Form.Label><strong>Duration (minutes)</strong> <span className="text-danger">*</span></Form.Label>
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
                      <Form.Group className="mb-3">
                        <Form.Label><strong>Starting Date</strong> <span className="text-danger">*</span></Form.Label>
                        <Form.Control
                          type="datetime-local"
                          name="startingDate"
                          value={form.startingDate}
                          onChange={handleChange}
                          required
                          min={today}
                        />
                      </Form.Group>
                      <Form.Group className="mb-3">
                        <Form.Label><strong>Ending Date</strong> <span className="text-danger">*</span></Form.Label>
                        <Form.Control
                          type="datetime-local"
                          name="endingDate"
                          value={form.endingDate}
                          onChange={handleChange}
                          required
                          min={form.startingDate || today}
                        />
                      </Form.Group>
                      <Form.Group className="mb-3">
                        <Form.Label><strong>Difficulty Level</strong> <span className="text-danger">*</span></Form.Label>
                        <Form.Select
                          name="difficulty"
                          value={form.difficulty}
                          onChange={handleChange}
                          required
                        >
                          <option value="">Select difficulty level</option>
                          {difficultyLevels.map((level) => (
                            <option key={level} value={level}>{level}</option>
                          ))}
                        </Form.Select>
                      </Form.Group>
                    </>
                  )}

                 
                  <div className="d-grid gap-2">
                    <Button variant="primary" type="submit" size="lg">
                      Add {testType} Test
                    </Button>
                  </div>
                </Form>
              </Card.Body>
            </Card>
          )}
        </Col>
      </Row>
    </Container>
  )
}
