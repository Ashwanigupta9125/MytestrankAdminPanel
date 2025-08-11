import React from 'react'
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import LoginPage from './Component/LoginPage'
import Layout from './Component/Layout'
import Dashboard from './Component/Dashboard'
import AddTest from './Component/AddTest'
import AddCourse from './Component/AddCourse'
import AddBanner from './Component/AddBanner'
import DeleteTest from './Component/DeleteTest'
import DeleteCourse from './Component/DeleteCourse'
import DeleteBanner from './Component/DeleteBanner'
import ModifyTest from './Component/ModifyTest'
import ModifyCourse from './Component/ModifyCourse'
import ModifyBanner from './Component/ModifyBanner'

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<LoginPage />} />
        <Route element={<Layout />}>
          <Route path="/main" element={<Dashboard />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/add-test" element={<AddTest />} />
          <Route path="/add-course" element={<AddCourse />} />
          <Route path="/add-banner" element={<AddBanner />} />
          <Route path="/delete-test" element={<DeleteTest />} />
          <Route path="/delete-course" element={<DeleteCourse />} />
          <Route path="/delete-banner" element={<DeleteBanner />} />
          <Route path="/modify-test" element={<ModifyTest />} />
          <Route path="/modify-course" element={<ModifyCourse />} />
          <Route path="/modify-banner" element={<ModifyBanner />} />
        </Route>
      </Routes>
    </Router>
  )
}

export default App
