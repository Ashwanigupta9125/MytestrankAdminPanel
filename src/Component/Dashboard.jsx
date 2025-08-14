import React from 'react'
import { useNavigate } from 'react-router-dom'
import { Button, Container, Row, Col } from 'react-bootstrap'

export default function Dashboard() {
  const navigate = useNavigate()
  const routes = [
    { path: '/main', label: 'Main Page' },
    { path: '/data-fetcher', label: '📊 Data Fetcher' },
    { path: '/add-test', label: 'Add Test' },
    { path: '/add-course', label: 'Add Course' },
    { path: '/add-banner', label: 'Add Banner' },
    { path: '/delete-test', label: 'Delete Test' },
    { path: '/delete-course', label: 'Delete Course' },
    { path: '/delete-banner', label: 'Delete Banner' },
    { path: '/modify-test', label: 'Modify Test' },
    { path: '/modify-course', label: 'Modify Course' },
    { path: '/modify-banner', label: 'Modify Banner' }
  ]

  return (
    <Container
      style={{
        minHeight: '70vh',
        width: '80%',
        margin: '40px auto',
        background: '#f8f9fa',
        borderRadius: '16px',
        boxShadow: '0 0 12px rgba(0,0,0,0.08)',
        padding: '32px'
      }}
    >
      <h2 className="mb-4 text-center">Dashboard Page</h2>
      <Row className="justify-content-center">
        {routes.map(route => (
          <Col xs={12} md={6} lg={4} className="mb-3" key={route.path}>
            <Button
              variant="primary"
              size="lg"
              className="w-100"
              onClick={() => navigate(route.path)}
            >
              {route.label}
            </Button>
          </Col>
        ))}
      </Row>
    </Container>
  )
}