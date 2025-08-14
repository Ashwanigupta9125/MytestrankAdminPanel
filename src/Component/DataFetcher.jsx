import React, { useState } from 'react';
import { 
  Container, 
  Row, 
  Col, 
  Form, 
  Button, 
  Alert, 
  Card, 
  Table, 
  Badge, 
  Spinner, 
  Modal,
  Pagination,
  InputGroup,
  Dropdown,
  DropdownButton
} from 'react-bootstrap';
import axios from 'axios';
import './DataFetcher.css';

export default function DataFetcher() {
  const [selectedOption, setSelectedOption] = useState('');
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  
  // Pagination states for tests
  const [pageNo, setPageNo] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [totalPages, setTotalPages] = useState(0);
  const [totalItems, setTotalItems] = useState(0);
  
  // Modal states for detailed view
  const [showModal, setShowModal] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null);

  const options = [
    { value: 'banner', label: 'Banner', endpoint: 'https://www.srv620732.hstgr.cloud/banner/getBanners' },
    { value: 'courses', label: 'Courses', endpoint: 'https://www.srv620732.hstgr.cloud/courses/getallcourse' },
    { value: 'tests', label: 'Tests', endpoint: 'https://www.srv620732.hstgr.cloud/fetch/alltests' }
  ];

  const fetchData = async () => {
    if (!selectedOption) {
      setError('❌ Please select an option from the dropdown.');
      return;
    }

    setLoading(true);
    setError('');
    setSuccess('');
    setData(null);

    try {
      const selectedOpt = options.find(opt => opt.value === selectedOption);
      let url = selectedOpt.endpoint;

      // Add pagination parameters for tests
      if (selectedOption === 'tests') {
        url += `?page=${pageNo}&size=${pageSize}`;
      }

      const response = await axios.get(url);
      const responseData = response.data;

      if (selectedOption === 'tests') {
        // Handle paginated response for tests
        setData(responseData.content || responseData);
        setTotalPages(responseData.totalPages || 0);
        setTotalItems(responseData.totalElements || 0);
      } else {
        setData(responseData);
      }

      setSuccess(`✅ Successfully fetched ${selectedOption} data!`);
    } catch (error) {
      console.error('Error fetching data:', error);
      if (error.response) {
        setError(`❌ Error ${error.response.status}: ${error.response.data?.message || error.message}`);
      } else if (error.request) {
        setError('❌ Network error: Unable to connect to the server.');
      } else {
        setError(`❌ Error: ${error.message}`);
      }
    } finally {
      setLoading(false);
    }
  };

  const handlePageChange = (newPage) => {
    setPageNo(newPage);
  };

  const handlePageSizeChange = (newSize) => {
    setPageSize(newSize);
    setPageNo(1); // Reset to first page when changing page size
  };

  const showItemDetails = (item) => {
    setSelectedItem(item);
    setShowModal(true);
  };

  const renderBannerData = (banners) => {
    if (!Array.isArray(banners)) return <p>No banner data available</p>;
    
    return (
      <Row>
        {banners.map((banner, index) => (
          <Col key={banner.id || index} xs={12} md={6} lg={4} className="mb-3">
            <Card className="h-100 banner-card">
              <Card.Body>
                <Card.Title className="text-primary">{banner.title || 'Untitled Banner'}</Card.Title>
                <Card.Text>
                  <strong>Detail:</strong> {banner.title_detail || 'No detail available'}<br />
                  <strong>Redirect URL:</strong> {banner.urlToDirect || 'No URL'}<br />
                  <strong>ID:</strong> {banner.id || 'N/A'}
                </Card.Text>
                {banner.imageUrl && (
                  <img 
                    src={banner.imageUrl} 
                    alt="Banner" 
                    className="img-fluid rounded"
                    style={{ maxHeight: '150px', objectFit: 'cover' }}
                  />
                )}
                <Button 
                  variant="outline-info" 
                  size="sm" 
                  className="mt-2"
                  onClick={() => showItemDetails(banner)}
                >
                  View Details
                </Button>
              </Card.Body>
            </Card>
          </Col>
        ))}
      </Row>
    );
  };

  const renderCourseData = (courses) => {
    if (!Array.isArray(courses)) return <p>No course data available</p>;
    
    return (
      <Table striped bordered hover responsive>
        <thead className="table-dark">
          <tr>
            <th>ID</th>
            <th>Title</th>
            <th>Description</th>
            <th>Price</th>
            <th>Duration</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {courses.map((course, index) => (
            <tr key={course.id || index}>
              <td><Badge bg="secondary">{course.id || 'N/A'}</Badge></td>
              <td><strong>{course.title || course.name || 'Untitled Course'}</strong></td>
              <td>{course.description || course.desc || 'No description'}</td>
              <td>
                <Badge bg={course.price ? 'success' : 'warning'}>
                  {course.price ? `$${course.price}` : 'Free'}
                </Badge>
              </td>
              <td>{course.duration || course.time || 'N/A'}</td>
              <td>
                <Button 
                  variant="outline-primary" 
                  size="sm"
                  onClick={() => showItemDetails(course)}
                >
                  Details
                </Button>
              </td>
            </tr>
          ))}
        </tbody>
      </Table>
    );
  };

  const renderTestData = (tests) => {
    if (!Array.isArray(tests)) return <p>No test data available</p>;
    
    return (
      <>
        <Table striped bordered hover responsive>
          <thead className="table-dark">
            <tr>
              <th>ID</th>
              <th>Title</th>
              <th>Description</th>
              <th>Duration</th>
              <th>Questions</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {tests.map((test, index) => (
              <tr key={test.id || index}>
                <td><Badge bg="info">{test.id || 'N/A'}</Badge></td>
                <td><strong>{test.title || test.name || 'Untitled Test'}</strong></td>
                <td>{test.description || test.desc || 'No description'}</td>
                <td>{test.duration || test.time || 'N/A'}</td>
                <td>
                  <Badge bg="primary">
                    {test.questionCount || test.questions?.length || 0}
                  </Badge>
                </td>
                <td>
                  <Badge bg={test.active ? 'success' : 'danger'}>
                    {test.active ? 'Active' : 'Inactive'}
                  </Badge>
                </td>
                <td>
                  <Button 
                    variant="outline-info" 
                    size="sm"
                    onClick={() => showItemDetails(test)}
                  >
                    Details
                  </Button>
                </td>
              </tr>
            ))}
          </tbody>
        </Table>
        
        {/* Pagination */}
        {totalPages > 1 && (
          <Row className="mt-3">
            <Col>
              <Pagination className="justify-content-center">
                <Pagination.First 
                  onClick={() => handlePageChange(1)} 
                  disabled={pageNo === 1}
                />
                <Pagination.Prev 
                  onClick={() => handlePageChange(pageNo - 1)} 
                  disabled={pageNo === 1}
                />
                
                {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                  const page = Math.max(1, Math.min(totalPages - 4, pageNo - 2)) + i;
                  return (
                    <Pagination.Item
                      key={page}
                      active={page === pageNo}
                      onClick={() => handlePageChange(page)}
                    >
                      {page}
                    </Pagination.Item>
                  );
                })}
                
                <Pagination.Next 
                  onClick={() => handlePageChange(pageNo + 1)} 
                  disabled={pageNo === totalPages}
                />
                <Pagination.Last 
                  onClick={() => handlePageChange(totalPages)} 
                  disabled={pageNo === totalPages}
                />
              </Pagination>
            </Col>
          </Row>
        )}
      </>
    );
  };

  const renderData = () => {
    if (!data) return null;

    switch (selectedOption) {
      case 'banner':
        return renderBannerData(data);
      case 'courses':
        return renderCourseData(data);
      case 'tests':
        return renderTestData(data);
      default:
        return <p>No data to display</p>;
    }
  };

  return (
    <div className="data-fetcher-container">
      <Container>
        <Row className="justify-content-md-center">
          <Col md={10}>
            <Card className="data-fetcher-card">
              <Card.Header className="data-fetcher-header">
                <h2 className="mb-0">📊 Data Fetcher Dashboard</h2>
              </Card.Header>
              <Card.Body className="data-fetcher-body">
              {/* Selection Section */}
              <Row className="mb-4">
                <Col md={6}>
                  <Form.Group>
                    <Form.Label><strong>Select Data Type:</strong></Form.Label>
                    <Form.Select
                      value={selectedOption}
                      onChange={(e) => setSelectedOption(e.target.value)}
                      disabled={loading}
                    >
                      <option value="">Choose an option...</option>
                      {options.map(option => (
                        <option key={option.value} value={option.value}>
                          {option.label}
                        </option>
                      ))}
                    </Form.Select>
                  </Form.Group>
                </Col>
                
                <Col md={6}>
                  <Form.Group>
                    <Form.Label><strong>Action:</strong></Form.Label>
                    <div>
                      <Button 
                        variant="success" 
                        onClick={fetchData} 
                        disabled={loading || !selectedOption}
                        className="w-100 btn-fetch"
                      >
                        {loading ? (
                          <>
                            <Spinner animation="border" size="sm" className="me-2" />
                            Fetching Data...
                          </>
                        ) : (
                          '🚀 Fetch Data'
                        )}
                      </Button>
                    </div>
                  </Form.Group>
                </Col>
              </Row>

              {/* Pagination Controls for Tests */}
              {selectedOption === 'tests' && (
                <Row className="mb-3">
                  <Col md={6}>
                    <Form.Group>
                      <Form.Label><strong>Page Number:</strong></Form.Label>
                      <Form.Control
                        type="number"
                        min="0"
                        value={pageNo}
                        onChange={(e) => setPageNo(parseInt(e.target.value) || 0)}
                        disabled={loading}
                      />
                    </Form.Group>
                  </Col>
                  <Col md={6}>
                    <Form.Group>
                      <Form.Label><strong>Page Size:</strong></Form.Label>
                      <Form.Select
                        value={pageSize}
                        onChange={(e) => handlePageSizeChange(parseInt(e.target.value))}
                        disabled={loading}
                      >
                        <option value={5}>5 items</option>
                        <option value={10}>10 items</option>
                        <option value={20}>20 items</option>
                        <option value={50}>50 items</option>
                      </Form.Select>
                    </Form.Group>
                  </Col>
                </Row>
              )}

              {/* Alerts */}
              {error && <Alert variant="danger" className="mb-3">{error}</Alert>}
              {success && <Alert variant="success" className="mb-3">{success}</Alert>}

              {/* Data Display */}
              {data && (
                <div className="data-section">
                  <h4 className="mb-3">
                    📋 {selectedOption.charAt(0).toUpperCase() + selectedOption.slice(1)} Data
                    {selectedOption === 'tests' && (
                      <Badge bg="info" className="ms-2">
                        Page {pageNo} of {totalPages} ({totalItems} total items)
                      </Badge>
                    )}
                  </h4>
                  {renderData()}
                </div>
              )}
            </Card.Body>
          </Card>
        </Col>
      </Row>
      </Container>

      {/* Detail Modal */}
      <Modal show={showModal} onHide={() => setShowModal(false)} size="lg">
        <Modal.Header closeButton>
          <Modal.Title>📄 Item Details</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {selectedItem && (
            <div>
              <pre className="bg-light p-3 rounded" style={{ fontSize: '14px' }}>
                {JSON.stringify(selectedItem, null, 2)}
              </pre>
            </div>
          )}
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowModal(false)}>
            Close
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
} 