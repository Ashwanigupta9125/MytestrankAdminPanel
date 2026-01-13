import React from 'react'
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import LoginPage from './Component/LoginPage'
import Layout from './Component/Layout'
import Dashboard from './Component/Dashboard'
import AddTest from './Component/Test/AddTest'
import BulkAddTest from './Component/Test/BulkAddTest'
import AddCourse from './Component/Course/AddCourse'
import AddBanner from './Component/Banner/AddBanner'
import DeleteTest from './Component/Test/DeleteTest'
import DeleteCourse from './Component/Course/DeleteCourse'
import DeleteBanner from './Component/Banner/DeleteBanner'
import ModifyTest from './Component/Test/ModifyTest'
import ModifyCourse from './Component/Course/ModifyCourse'
import ModifyBanner from './Component/Banner/ModifyBanner'
import DataFetcher from './Component/DataFetcher'
import ArrangeBannerOrder from './Component/Banner/ArrangeBannerOrder'

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<LoginPage />} />
        <Route element={<Layout />}>
          <Route path="/main" element={<Dashboard />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/add-test" element={<AddTest />} />
          <Route path="/add-test-bulk" element={<BulkAddTest />} />
          <Route path="/add-course" element={<AddCourse />} />
          <Route path="/add-banner" element={<AddBanner />} />
          <Route path="/delete-test" element={<DeleteTest />} />
          <Route path="/delete-course" element={<DeleteCourse />} />
          <Route path="/delete-banner" element={<DeleteBanner />} />
          <Route path="/modify-test" element={<ModifyTest />} />
          <Route path="/modify-course" element={<ModifyCourse />} />
          <Route path="/modify-banner" element={<ModifyBanner />} />
          <Route path="/data-fetcher" element={<DataFetcher />} />
          <Route path="/arrange-banner" element={<ArrangeBannerOrder />} />
        </Route>
      </Routes>
    </Router>
  )
}

export default App
