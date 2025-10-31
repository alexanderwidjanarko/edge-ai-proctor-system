import { Outlet } from 'react-router-dom'

const Layout = () => {
  

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Minimal header removed for prototype single page */}

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Outlet />
      </main>

      {/* Footer removed for prototype */}
    </div>
  )
}

export default Layout