import { Link } from 'react-router-dom'
import { 
  StopIcon, 
  PlayIcon,
  CheckCircleIcon,
  EyeIcon,
  CpuChipIcon
} from '@heroicons/react/24/outline'

const ProctoringPage = () => {

  return (
    <div className="space-y-6">
      {/* Exam Header */}
      <div className="card">
        <div className="card-header">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Sample Exam</h1>
              <p className="text-gray-600 mt-1">This is a sample exam for testing</p>
            </div>
            <div className="flex items-center space-x-4">
              <div className="text-right">
                <div className="text-2xl font-bold text-gray-900">
                  45:30
                </div>
                <div className="text-sm text-gray-500">Time Remaining</div>
              </div>
              <div className="w-3 h-3 rounded-full bg-green-500 animate-pulse" />
            </div>
          </div>
        </div>
      </div>

      {/* Main Proctoring Interface */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Video Feed */}
        <div className="lg:col-span-2">
          <div className="card">
            <div className="card-header">
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-semibold text-gray-900">Live Feed</h2>
                <div className="flex items-center space-x-2">
                  <div className="flex items-center space-x-1 text-red-600">
                    <div className="w-2 h-2 bg-red-600 rounded-full animate-pulse" />
                    <span className="text-sm font-medium">Recording</span>
                  </div>
                  <div className="status-indicator status-active">
                    Active
                  </div>
                </div>
              </div>
            </div>
            <div className="card-body">
              <div className="video-container bg-gray-900 rounded-lg overflow-hidden">
                <div className="flex items-center justify-center h-full text-white">
                  <div className="text-center">
                    <EyeIcon className="h-12 w-12 mx-auto mb-4 opacity-50" />
                    <p className="text-lg font-medium">Camera Feed</p>
                    <p className="text-sm opacity-75">Live video will appear here</p>
                  </div>
                </div>
              </div>

              <div className="mt-4 flex justify-center space-x-4">
                <button className="btn-primary flex items-center space-x-2">
                  <PlayIcon className="h-5 w-5" />
                  <span>Start Proctoring</span>
                </button>
                <Link to="/reports" className="btn-danger flex items-center space-x-2">
                  <StopIcon className="h-5 w-5" />
                  <span>End Exam</span>
                </Link>
              </div>
            </div>
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Performance Metrics */}
          <div className="card">
            <div className="card-header">
              <h3 className="text-lg font-semibold text-gray-900">Performance Metrics</h3>
            </div>
            <div className="card-body">
              <div className="grid grid-cols-1 gap-4">
                <div className="p-4 bg-gray-50 rounded-lg border border-gray-200">
                  <div className="flex items-center space-x-3">
                    <CpuChipIcon className="h-5 w-5 text-gray-600" />
                    <div className="flex-1 min-w-0">
                      <div className="text-sm font-medium text-gray-900">Inference Time</div>
                      <div className="text-lg font-bold text-green-600">35.2ms</div>
                      <div className="text-xs text-gray-500">Target: &lt;50ms</div>
                    </div>
                    <div className="w-3 h-3 rounded-full bg-green-500" />
                  </div>
                </div>
                <div className="p-4 bg-gray-50 rounded-lg border border-gray-200">
                  <div className="flex items-center space-x-3">
                    <EyeIcon className="h-5 w-5 text-gray-600" />
                    <div className="flex-1 min-w-0">
                      <div className="text-sm font-medium text-gray-900">FPS</div>
                      <div className="text-lg font-bold text-green-600">28.5</div>
                      <div className="text-xs text-gray-500">Target: &gt;20</div>
                    </div>
                    <div className="w-3 h-3 rounded-full bg-green-500" />
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Alerts */}
          <div className="card">
            <div className="card-header">
              <h3 className="text-lg font-semibold text-gray-900">Alerts</h3>
            </div>
            <div className="card-body">
              <div className="text-center py-8 text-gray-500">
                <CheckCircleIcon className="h-8 w-8 mx-auto mb-2 text-green-500" />
                <p>No alerts</p>
              </div>
            </div>
          </div>

          {/* System Status */}
          <div className="card">
            <div className="card-header">
              <h3 className="text-lg font-semibold text-gray-900">System Status</h3>
            </div>
            <div className="card-body">
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Face Detection</span>
                  <div className="flex items-center space-x-2">
                    <div className="w-2 h-2 rounded-full bg-green-500" />
                    <span className="text-sm font-medium">Active</span>
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Object Detection</span>
                  <div className="flex items-center space-x-2">
                    <div className="w-2 h-2 rounded-full bg-green-500" />
                    <span className="text-sm font-medium">Active</span>
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Behavior Analysis</span>
                  <div className="flex items-center space-x-2">
                    <div className="w-2 h-2 rounded-full bg-green-500" />
                    <span className="text-sm font-medium">Active</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default ProctoringPage