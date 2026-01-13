import React, { useEffect, useState } from 'react'
import {
  Container,
  Row,
  Col,
  Form,
  Button,
  Alert,
  Card,
  Spinner,
  Badge,
  Accordion
} from 'react-bootstrap'
import axios from 'axios'

const testTypes = ['NORMAL', 'DEMO', 'LIVE']
const testLanguages = ['ENGLISH', 'HINDI']

export default function BulkAddTest() {
  const [courses, setCourses] = useState([])
  const [courseId, setCourseId] = useState('')
  const [errorsMap, setErrorsMap] = useState({})
  const [defaultLanguage, setDefaultLanguage] = useState('')
  const [tests, setTests] = useState([
    {
      title: '',
      description: '',
      type: '',
      language: '',
      price: '',
      discountPercentage: '',
      durationInMinutes: '',
      contain: '',
      scheduledStart: '',
      scheduledEnd: '',
      imageFile: null
    }
  ])
  const [loadingCourses, setLoadingCourses] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [message, setMessage] = useState('')
  const [variant, setVariant] = useState('success')

  useEffect(() => {
    const fetchCourses = async () => {
      setLoadingCourses(true)
      setMessage('')
      try {
        const res = await axios.get('http://localhost:8080/fetch/allCourseMainPage')
        const data = Array.isArray(res.data) ? res.data : []
        setCourses(data)
      } catch (error) {
        setVariant('danger')
        setMessage(
          'Error fetching courses: ' + (error.response?.data?.message || error.message)
        )
      } finally {
        setLoadingCourses(false)
      }
    }

    fetchCourses()
  }, [])

  const handleTestChange = (index, field, value) => {
    const updated = [...tests]
    updated[index][field] = value
    setTests(updated)
  }

  const handleImageChange = (index, file) => {
    const updated = [...tests]
    updated[index].imageFile = file
    setTests(updated)
  }

  // Whenever a default language is chosen, apply it to all tests.
  // User can still manually change any individual test language afterwards.
  useEffect(() => {
    if (!defaultLanguage) return
    setTests(prevTests =>
      prevTests.map(t => ({
        ...t,
        language: defaultLanguage
      }))
    )
  }, [defaultLanguage])

  const addTestRow = () => {
    setTests([
      ...tests,
      {
        title: '',
        description: '',
        type: '',
        language: defaultLanguage || '',
        price: '',
        discountPercentage: '',
        durationInMinutes: '',
        contain: '',
        scheduledStart: '',
        scheduledEnd: '',
        imageFile: null
      }
    ])
  }

  const removeTestRow = index => {
    if (tests.length === 1) return
    setTests(tests.filter((_, i) => i !== index))
  }

  const validateTest = test => {
    // Only require the three requested fields: Title, Contain, and Language
    if (!test.title || !test.contain || !test.language) {
      return 'Please fill Title, Contain and Language for each test.'
    }

    const start = new Date(test.scheduledStart)
    const end = new Date(test.scheduledEnd)
    if (end <= start) {
      return 'Scheduled End must be after Scheduled Start for all tests.'
    }
    const now = new Date()
    const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime()
    if (start.getTime() < todayStart) {
      return 'Scheduled Start must be today or in the future for all tests.'
    }

    return ''
  }

  const handleSubmit = async (e) => {
  e.preventDefault();
  setMessage('');
  setErrorsMap({});

  if (!courseId) {
    setVariant('danger');
    setMessage('Please select a course before submitting.');
    return;
  }

  // 1. Prepare the data array
  const payload = tests.map(t => ({
    title: t.title,
    contain: t.contain,
    language: t.language,
    course: { id: parseInt(courseId) } // Ensure backend can map this
  }));

  setSubmitting(true);

  try {
    // 2. Single call to the bulk endpoint
    const res = await axios.post('http://localhost:8080/test/normal/bulk', payload);
    
    const { successIds, failed } = res.data;
    const failCount = Object.keys(failed || {}).length;
    const successCount = successIds?.length || 0;

    if (failCount === 0) {
      setVariant('success');
      setMessage(`Successfully uploaded all ${successCount} tests!`);
      // Reset form
      setTests([{ title: '', contain: '', language: defaultLanguage || '', courseId: '' }]);
    } else {
      setVariant('warning');
      // Construct a detailed message for failures
      const errorDetails = Object.entries(failed)
        .map(([index, reason]) => `Row ${parseInt(index) + 1}: ${reason}`)
        .join(' | ');
      
      setMessage(`Completed: ${successCount} succeeded. ${failCount} failed. Details: ${errorDetails}`);
    }
  } catch (error) {
    setVariant('danger');
    setMessage('Server Error: ' + (error.response?.data?.message || error.message));
  } finally {
    setSubmitting(false);
  }
  };
  const today = new Date().toISOString().slice(0, 16)

 return (
  <Container className="mt-4">
    <Row className="justify-content-md-center">
      <Col md={12}>
        <h2 className="mb-3">Add Tests in Bulk</h2>
        <p className="text-muted">
          Select a course and fill multiple test rows. All tests will be created for the selected course.
        </p>

        {/* Global Success/Error Message */}
        {message && <Alert variant={variant}>{message}</Alert>}

        {/* Course and Language Selectors */}
        <Card className="mb-3">
          <Card.Body>
            <Form.Group as={Row} className="align-items-center">
              <Form.Label column sm={2}>Course</Form.Label>
              <Col sm={10}>
                <Form.Select
                  value={courseId}
                  onChange={e => setCourseId(e.target.value)}
                  disabled={loadingCourses || submitting}
                >
                  <option value="">{loadingCourses ? 'Loading courses...' : 'Select a course'}</option>
                  {courses.map(course => (
                    <option key={course.id} value={course.id}>
                      {course.id} - {course.title || course.name || 'Untitled Course'}
                    </option>
                  ))}
                </Form.Select>
              </Col>
            </Form.Group>

            <Form.Group as={Row} className="align-items-center mt-3">
              <Form.Label column sm={2}>Default Language</Form.Label>
              <Col sm={10}>
                <Form.Select
                  value={defaultLanguage}
                  onChange={e => setDefaultLanguage(e.target.value)}
                  disabled={submitting}
                >
                  <option value="">Select default language (optional)</option>
                  {testLanguages.map(lang => (
                    <option key={lang} value={lang}>{lang}</option>
                  ))}
                </Form.Select>
              </Col>
            </Form.Group>
          </Card.Body>
        </Card>

        <Form onSubmit={handleSubmit}>
          <Card>
            <Card.Header className="d-flex justify-content-between align-items-center">
              <span>Test Details</span>
              <div className="d-flex align-items-center gap-2">
                <Badge bg="secondary">Total tests: {tests.length}</Badge>
                <Button variant="outline-primary" size="sm" onClick={addTestRow} disabled={submitting}>
                  + Add Test
                </Button>
              </div>
            </Card.Header>
            <Card.Body>
              <Accordion defaultActiveKey="0" alwaysOpen>
                {tests.map((t, index) => {
                  // NEW: Check if this specific row has an error from the backend
                  const rowError = errorsMap[index];

                  return (
                    <Accordion.Item 
                      eventKey={String(index)} 
                      key={index}
                      className={rowError ? "border-danger mb-2" : "mb-2"}
                    >
                      <Accordion.Header>
                        <div className="d-flex justify-content-between w-100 align-items-center">
                          <span>
                            <strong>Test #{index + 1}</strong>
                            {t.title ? ` - ${t.title}` : ''}
                            {/* NEW: Error Badge */}
                            {rowError && <Badge bg="danger" className="ms-2">Failed</Badge>}
                          </span>
                          <Button
                            variant="outline-danger"
                            size="sm"
                            onClick={e => { e.stopPropagation(); removeTestRow(index); }}
                            disabled={tests.length === 1 || submitting}
                          >
                            Remove
                          </Button>
                        </div>
                      </Accordion.Header>
                      <Accordion.Body>
                        {/* NEW: Specific Error Alert for this row */}
                        {rowError && (
                          <Alert variant="danger" className="py-1 small mb-3">
                            <strong>Error:</strong> {rowError}
                          </Alert>
                        )}

                        <Row className="g-3">
                          <Col md={6}>
                            <Form.Group>
                              <Form.Label>Title</Form.Label>
                              <Form.Control
                                type="text"
                                value={t.title}
                                isInvalid={!!rowError} // Highlights input red on error
                                onChange={e => handleTestChange(index, 'title', e.target.value)}
                                placeholder="Enter test title"
                              />
                            </Form.Group>
                          </Col>
                          <Col md={6}>
                            <Form.Group>
                              <Form.Label>Language</Form.Label>
                              <Form.Select
                                value={t.language}
                                isInvalid={!!rowError}
                                onChange={e => handleTestChange(index, 'language', e.target.value)}
                              >
                                <option value="">Select language</option>
                                {testLanguages.map(lang => (
                                  <option key={lang} value={lang}>{lang}</option>
                                ))}
                              </Form.Select>
                            </Form.Group>
                          </Col>
                          <Col md={12}>
                            <Form.Group>
                              <Form.Label>Contain</Form.Label>
                              <Form.Control
                                as="textarea"
                                rows={2}
                                value={t.contain}
                                isInvalid={!!rowError}
                                onChange={e => handleTestChange(index, 'contain', e.target.value)}
                                placeholder="What does this test contain?"
                              />
                            </Form.Group>
                          </Col>
                        </Row>
                      </Accordion.Body>
                    </Accordion.Item>
                  );
                })}
              </Accordion>

              <div className="text-center mt-3">
                <Button variant="outline-primary" size="sm" onClick={addTestRow} disabled={submitting}>
                  + Add Another Test
                </Button>
              </div>
            </Card.Body>
          </Card>

          <div className="mt-3">
            <Button variant="primary" type="submit" className="w-100" disabled={submitting || loadingCourses}>
              {submitting ? (
                <>
                  <Spinner animation="border" size="sm" className="me-2" />
                  Submitting {tests.length} tests...
                </>
              ) : (
                'Add All Tests'
              )}
            </Button>
          </div>
        </Form>
      </Col>
    </Row>
  </Container>
)
}


