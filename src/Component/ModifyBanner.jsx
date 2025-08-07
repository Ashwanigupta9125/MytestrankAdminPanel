import React, { useState } from 'react'
import { Container, Row, Col, Form, Button, Alert, Card } from 'react-bootstrap'
import axios from 'axios'

export default function ModifyBanner() {
  const [bannerId, setBannerId] = useState('')
  const [banner, setBanner] = useState(null)
  const [form, setForm] = useState(null)
  const [image, setImage] = useState(null)
  const [message, setMessage] = useState('')
  const [variant, setVariant] = useState('success')

  const handleCheckBanner = async () => {
    setMessage('')
    setVariant('success')
    setBanner(null)
    setForm(null)
    if (!bannerId) {
      setMessage('Please enter a Banner ID.')
      setVariant('danger')
      return
    }
    try {
      const response = await axios.get(`http://localhost:8080/banner/getbannerbyid/${bannerId}`)
      if (response.status === 200 && response.data && response.data.id) {
        setBanner(response.data)
        setForm({
          title: response.data.title,
          title_detail: response.data.title_detail,
          urlToDirect: response.data.urlToDirect
        })
        setMessage('✅ Banner found. You can now modify and confirm.')
        setVariant('success')
      } else {
        setMessage('❌ Banner not found or invalid ID.')
        setVariant('danger')
      }
    } catch (error) {
      setMessage('❌ Error fetching banner.')
      setVariant('danger')
    }
  }

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value })
  }

  const handleImageChange = (e) => {
    setImage(e.target.files[0])
  }

  const handleUpdateBanner = async () => {
    if (!form.title || !form.title_detail || !form.urlToDirect) {
      setMessage('Please fill all fields.')
      setVariant('danger')
      return
    }
    const bannerData = {
      title: form.title,
      title_detail: form.title_detail,
      urlToDirect: form.urlToDirect
    }
    const formData = new FormData()
    formData.append('banner', new Blob([JSON.stringify(bannerData)], { type: 'application/json' }))
    if (image) formData.append('image', image)

    try {
      const response = await axios.put(`http://localhost:8080/banner/updatebanner/${bannerId}`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      })
      if (response.status === 200) {
        setMessage('✅ Banner updated successfully.')
        setVariant('success')
        setBannerId('')
        setBanner(null)
        setForm(null)
        setImage(null)
      } else {
        setMessage('❌ Failed to update banner.')
        setVariant('danger')
      }
    } catch (error) {
      setMessage('❌ Error updating banner.')
      setVariant('danger')
    }
  }

  return (
    <Container className="mt-4">
      <Row className="justify-content-md-center">
        <Col md={8}>
          <h2 className="mb-4 text-center">Modify Banner</h2>
          {message && <Alert variant={variant}>{message}</Alert>}

          <Form className="mb-4" onSubmit={e => { e.preventDefault(); handleCheckBanner(); }}>
            <Form.Group className="mb-3">
              <Form.Label>Enter Banner ID</Form.Label>
              <Form.Control
                type="text"
                placeholder="Enter banner ID"
                value={bannerId}
                onChange={(e) => setBannerId(e.target.value)}
              />
            </Form.Group>
            <Button variant="primary" type="submit">
              Fetch Banner
            </Button>
          </Form>

          {form && (
            <Form className="mb-4">
              <Form.Group className="mb-3">
                <Form.Label>Title</Form.Label>
                <Form.Control name="title" value={form.title} onChange={handleChange} required />
              </Form.Group>
              <Form.Group className="mb-3">
                <Form.Label>Title Detail</Form.Label>
                <Form.Control name="title_detail" value={form.title_detail} onChange={handleChange} required />
              </Form.Group>
              <Form.Group className="mb-3">
                <Form.Label>URL to Direct</Form.Label>
                <Form.Control name="urlToDirect" value={form.urlToDirect} onChange={handleChange} required />
              </Form.Group>
              <Form.Group className="mb-3">
                <Form.Label>Banner Image (optional)</Form.Label>
                <Form.Control type="file" accept="image/*" onChange={handleImageChange} />
              </Form.Group>
              <Button variant="warning" onClick={handleUpdateBanner}>
                Confirm & Update Banner
              </Button>
            </Form>
          )}
        </Col>
      </Row>
    </Container>
  )
}