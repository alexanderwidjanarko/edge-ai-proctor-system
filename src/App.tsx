import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { Toaster } from 'react-hot-toast'
import Layout from '@components/layout/Layout'
import HomePage from '@components/pages/HomePage'
import ExamSetupPage from '@components/pages/ExamSetupPage'
import ProctoringPage from '@components/pages/ProctoringPage'
import ExamReportPage from '@components/pages/ExamReportPage'
import SettingsPage from '@components/pages/SettingsPage'
import NotFoundPage from '@components/pages/NotFoundPage'
import './index.css'

function App() {
  return (
    <>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Layout />}>
            <Route index element={<HomePage />} />
            <Route path="setup" element={<ExamSetupPage />} />
            <Route path="proctor/:examId" element={<ProctoringPage />} />
            <Route path="report/:examId" element={<ExamReportPage />} />
            <Route path="settings" element={<SettingsPage />} />
            <Route path="*" element={<NotFoundPage />} />
          </Route>
        </Routes>
      </BrowserRouter>
      
      <Toaster
        position="top-right"
        toastOptions={{
          duration: 4000,
          style: {
            background: '#363636',
            color: '#fff',
          },
        }}
      />
    </>
  )
}

export default App