import { 
  ChartBarIcon, 
  ClockIcon, 
  ExclamationTriangleIcon,
  CheckCircleIcon
} from '@heroicons/react/24/outline'

const ExamReportPage = () => {
  return (
    <div className="space-y-6">
      {/* Exam Header */}
      <div className="card">
        <div className="card-header">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Sample Exam Report</h1>
              <p className="text-gray-600 mt-1">This is a sample exam report</p>
            </div>
            <div className="text-right">
              <div className="text-sm text-gray-500">Exam Duration</div>
              <div className="text-lg font-semibold text-gray-900">
                60 minutes
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="card">
          <div className="card-body text-center">
            <ExclamationTriangleIcon className="h-8 w-8 text-red-500 mx-auto mb-2" />
            <div className="text-2xl font-bold text-gray-900">2</div>
            <div className="text-sm text-gray-600">Total Alerts</div>
          </div>
        </div>

        <div className="card">
          <div className="card-body text-center">
            <CheckCircleIcon className="h-8 w-8 text-green-500 mx-auto mb-2" />
            <div className="text-2xl font-bold text-gray-900">1</div>
            <div className="text-sm text-gray-600">Resolved</div>
          </div>
        </div>

        <div className="card">
          <div className="card-body text-center">
            <ChartBarIcon className="h-8 w-8 text-blue-500 mx-auto mb-2" />
            <div className="text-2xl font-bold text-gray-900">5.0%</div>
            <div className="text-sm text-gray-600">False Positive Rate</div>
          </div>
        </div>

        <div className="card">
          <div className="card-body text-center">
            <ClockIcon className="h-8 w-8 text-purple-500 mx-auto mb-2" />
            <div className="text-2xl font-bold text-gray-900">35.2ms</div>
            <div className="text-sm text-gray-600">Avg Inference Time</div>
          </div>
        </div>
      </div>

      {/* Alert Details */}
      <div className="card">
        <div className="card-header">
          <h2 className="text-lg font-semibold text-gray-900">Alert Details</h2>
          <p className="text-sm text-gray-600 mt-1">
            Detailed breakdown of all alerts during the exam
          </p>
        </div>
        <div className="card-body">
          <div className="space-y-4">
            <div className="flex items-center space-x-4 p-4 bg-yellow-50 rounded-lg border border-yellow-200">
              <div className="w-3 h-3 bg-yellow-500 rounded-full" />
              <div className="flex-1">
                <div className="font-medium text-gray-900">Head pose deviation detected</div>
                <div className="text-sm text-gray-600">
                  {new Date().toLocaleString()}
                </div>
              </div>
              <div className="status-indicator status-warning">
                Active
              </div>
            </div>

            <div className="flex items-center space-x-4 p-4 bg-red-50 rounded-lg border border-red-200">
              <div className="w-3 h-3 bg-red-500 rounded-full" />
              <div className="flex-1">
                <div className="font-medium text-gray-900">Suspicious object detected: cell phone</div>
                <div className="text-sm text-gray-600">
                  {new Date().toLocaleString()}
                </div>
              </div>
              <div className="status-indicator status-active">
                Resolved
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Timeline */}
      <div className="card">
        <div className="card-header">
          <h2 className="text-lg font-semibold text-gray-900">Exam Timeline</h2>
          <p className="text-sm text-gray-600 mt-1">
            Chronological view of exam events and alerts
          </p>
        </div>
        <div className="card-body">
          <div className="space-y-4">
            <div className="flex items-center space-x-4 p-4 bg-green-50 rounded-lg border border-green-200">
              <div className="w-3 h-3 bg-green-500 rounded-full" />
              <div className="flex-1">
                <div className="font-medium text-green-900">Exam Started</div>
                <div className="text-sm text-green-700">
                  {new Date().toLocaleString()}
                </div>
              </div>
            </div>

            <div className="flex items-center space-x-4 p-4 bg-blue-50 rounded-lg border border-blue-200">
              <div className="w-3 h-3 bg-blue-500 rounded-full" />
              <div className="flex-1">
                <div className="font-medium text-blue-900">Exam Completed</div>
                <div className="text-sm text-blue-700">
                  {new Date().toLocaleString()}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default ExamReportPage