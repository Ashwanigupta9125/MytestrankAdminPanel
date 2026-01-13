import React, { useState, useEffect } from 'react'
import { Container, Row, Col, Form, Button, Alert, Card } from 'react-bootstrap'
import axios from 'axios'

const testLanguages = ['ENGLISH', 'HINDI']
const difficultyLevels = ['EASY', 'MEDIUM', 'HARD']

export default function ModifyTest() {
  const [testId, setTestId] = useState('')
  const [test, setTest] = useState(null)
  const [testType, setTestType] = useState('') // 'NORMAL' or 'LIVE'
  const [form, setForm] = useState(null)
  const [image, setImage] = useState(null)
  const [message, setMessage] = useState('')
  const [variant, setVariant] = useState('success')
  const [courses, setCourses] = useState([])
  const [loadingCourses, setLoadingCourses] = useState(false)

  useEffect(() => {
    const fetchCourses = async () => {
      setLoadingCourses(true)
      try {
        const res = await axios.get('http://localhost:8080/courses/getallcourse')
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

  const handleCheckTest = async () => {
    setMessage('')
    setVariant('success')
    setTest(null)
    setForm(null)
    setTestType('')
    if (!testId) {
      setMessage('Please enter a Test ID.')
      setVariant('danger')
      return
    }
    try {
      const response = await axios.get(`http://localhost:8080/fetch/testbyId/${testId}`)
      if (response.status === 200 && response.data && response.data.id) {
        setTest(response.data)
        const testData = response.data
        
        // Determine test type based on available fields
        const isLiveTest = testData.difficulty !== undefined || 
                          testData.startingDate !== undefined ||
                          testData.endingDate !== undefined
        
        setTestType(isLiveTest ? 'LIVE' : 'NORMAL')
        
        if (isLiveTest) {
          // Live Test fields
          setForm({
            title: testData.title || '',
            contain: testData.contain || '',
            language: testData.language || '',
            durationInMinutes: testData.durationInMinutes || '',
            startingDate: testData.startingDate ? testData.startingDate.slice(0, 16) : '',
            endingDate: testData.endingDate ? testData.endingDate.slice(0, 16) : '',
            difficulty: testData.difficulty || ''
          })
        } else {
          // Normal Test fields
          setForm({
            title: testData.title || '',
            Contain: testData.Contain || testData.contain || '',
            language: testData.language || '',
            courseId: testData.course?.id || ''
          })
        }
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
    if (!testType) {
      setMessage('Please select test type.')
      setVariant('danger')
      return
    }

    if (testType === 'NORMAL') {
      // Validate Normal Test fields
      if (!form.title || !form.Contain || !form.language || !form.courseId) {
        setMessage('Please fill all required fields for Normal Test.')
        setVariant('danger')
        return
      }
    } else if (testType === 'LIVE') {
      // Validate Live Test fields
      if (!form.title || !form.contain || !form.language || !form.durationInMinutes || 
          !form.startingDate || !form.endingDate || !form.difficulty) {
        setMessage('Please fill all required fields for Live Test.')
        setVariant('danger')
        return
      }
      
      // Validate dates
      if (form.startingDate && form.endingDate) {
        const start = new Date(form.startingDate)
        const end = new Date(form.endingDate)
        if (end <= start) {
          setMessage('Ending Date must be after Starting Date.')
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
        Contain: form.Contain,
        language: form.language,
        course: {
          id: parseInt(form.courseId)
        }
      }
    } else if (testType === 'LIVE') {
      testData = {
        title: form.title,
        contain: form.contain,
        language: form.language,
        durationInMinutes: parseInt(form.durationInMinutes),
        startingDate: form.startingDate,
        endingDate: form.endingDate,
        difficulty: form.difficulty
      }
    }

    const formData = new FormData()
    formData.append('test', new Blob([JSON.stringify(testData)], { type: 'application/json' }))
    if (image) formData.append('image', image)

    try {
      const response = await axios.put(
        `http://localhost:8080/tests/update/${testId}`,
        formData,
        { headers: { 'Content-Type': 'multipart/form-data' } }
      )
      if (response.status === 200) {
        setMessage('✅ Test updated successfully.')
        setVariant('success')
        setTestId('')
        setTest(null)
        setForm(null)
        setTestType('')
        setImage(null)
      } else {
        setMessage('❌ Failed to update test.')
        setVariant('danger')
      }
    } catch (error) {
      setMessage(
        '❌ Error updating test. ' +
          (error.response?.data?.message || error.response?.data || error.message)
      )
      setVariant('danger')
    }
  }

  const today = new Date().toISOString().slice(0, 16)

  return (
    <Container className="mt-4">
      <Row className="justify-content-md-center">
        <Col md={10}>
          <h2 className="mb-4 text-center">Modify Test</h2>
          {message && <Alert variant={variant}>{message}</Alert>}

          <Card className="mb-4">
            <Card.Body>
              <Form onSubmit={e => { e.preventDefault(); handleCheckTest(); }}>
                <Form.Group className="mb-3">
                  <Form.Label><strong>Enter Test ID</strong></Form.Label>
                  <Form.Control
                    type="text"
                    placeholder="Enter test ID"
                    value={testId}
                    onChange={(e) => setTestId(e.target.value)}
                  />
                </Form.Group>
                <Button variant="primary" type="submit" className="w-100">
                  Fetch Test
                </Button>
              </Form>
            </Card.Body>
          </Card>

          {form && testType && (
            <Card>
              <Card.Header className="bg-primary text-white">
                <h5 className="mb-0">Update {testType} Test</h5>
              </Card.Header>
              <Card.Body>
                <Form>
                  {/* Common Fields */}
                  <Form.Group className="mb-3">
                    <Form.Label><strong>Title</strong> <span className="text-danger">*</span></Form.Label>
                    <Form.Control 
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
                          name="Contain" 
                          value={form.Contain} 
                          onChange={handleChange} 
                          placeholder="Enter test content"
                          required 
                        />
                      </Form.Group>
                      <Form.Group className="mb-3">
                        <Form.Label><strong>Language</strong> <span className="text-danger">*</span></Form.Label>
                        <Form.Select name="language" value={form.language} onChange={handleChange} required>
                          <option value="">Select language</option>
                          {testLanguages.map(lang => (
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
                        <Form.Select name="language" value={form.language} onChange={handleChange} required>
                          <option value="">Select language</option>
                          {testLanguages.map(lang => (
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
                        <Form.Select name="difficulty" value={form.difficulty} onChange={handleChange} required>
                          <option value="">Select difficulty level</option>
                          {difficultyLevels.map(level => (
                            <option key={level} value={level}>{level}</option>
                          ))}
                        </Form.Select>
                      </Form.Group>
                    </>
                  )}

                  {/* Image Upload (Optional) */}
                  <Form.Group className="mb-3">
                    <Form.Label><strong>Test Image</strong> <span className="text-muted">(optional)</span></Form.Label>
                    <Form.Control 
                      type="file" 
                      accept="image/*" 
                      onChange={handleImageChange} 
                    />
                    <Form.Text className="text-muted">
                      Leave empty to keep the existing image
                    </Form.Text>
                  </Form.Group>

                  <div className="d-grid gap-2">
                    <Button variant="warning" size="lg" onClick={handleUpdateTest}>
                      Confirm & Update {testType} Test
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