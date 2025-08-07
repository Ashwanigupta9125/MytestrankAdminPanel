import React from 'react'
import { Outlet } from 'react-router-dom'
import { Container, Nav, Navbar, NavDropdown } from 'react-bootstrap'
import { Link, useNavigate } from 'react-router-dom'
import 'bootstrap/dist/css/bootstrap.min.css'

function Layout() {
  const navigate = useNavigate()
  const handleLogout = () => {
    navigate('/')
  }

  return (
    <>
      <Navbar bg="dark" variant="dark" expand="lg">
        <Container>
          <Navbar.Brand as={Link} to="/dashboard">Mytestrank Admin</Navbar.Brand>
          <Navbar.Toggle aria-controls="admin-navbar" />
          <Navbar.Collapse id="admin-navbar">
            <Nav className="me-auto">
              <Nav.Link as={Link} to="/dashboard">Dashboard</Nav.Link>
              <Nav.Link as={Link} to="/add-test">Add Test</Nav.Link>
              <Nav.Link as={Link} to="/add-course">Add Course</Nav.Link>
              <Nav.Link as={Link} to="/add-banner">Add Banner</Nav.Link>
              <NavDropdown title="Delete Items" id="delete-dropdown">
                <NavDropdown.Item as={Link} to="/delete-test">Delete Test</NavDropdown.Item>
                <NavDropdown.Item as={Link} to="/delete-course">Delete Course</NavDropdown.Item>
                <NavDropdown.Item as={Link} to="/delete-banner">Delete Banner</NavDropdown.Item>
              </NavDropdown>
            </Nav>
            <Nav>
              <Nav.Link onClick={handleLogout} className="text-danger">
                Logout
              </Nav.Link>
            </Nav>
          </Navbar.Collapse>
        </Container>
      </Navbar>
      <Outlet />
    </>
  )
}

export default Layout