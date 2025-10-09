import { Link } from 'react-router-dom'
import { 
  PlayIcon, 
  CogIcon, 
  ChartBarIcon,
  ShieldCheckIcon,
  CpuChipIcon,
  EyeIcon
} from '@heroicons/react/24/outline'

const HomePage = () => {
  const features = [
    {
      name: 'Real-time Face Detection',
      description: 'Advanced BlazeFace model for accurate face detection with <50ms inference time',
      icon: EyeIcon,
      status: 'active'
    },
    {
      name: 'Head Pose Estimation',
      description: 'Monitor head movements and detect suspicious behavior patterns',
      icon: CpuChipIcon,
      status: 'active'
    },
    {
      name: 'Eye Gaze Tracking',
      description: 'Track eye movements to detect looking away from screen',
      icon: EyeIcon,
      status: 'active'
    },
    {
      name: 'Object Detection',
      description: 'YOLOv8n model to detect phones, books, and other suspicious objects',
      icon: ShieldCheckIcon,
      status: 'active'
    },
    {
      name: 'Behavior Analysis',
      description: 'AI-powered behavior profiling and anomaly detection',
      icon: ChartBarIcon,
      status: 'active'
    },
    {
      name: 'Edge Optimization',
      description: 'Optimized for edge devices with limited resources',
      icon: CpuChipIcon,
      status: 'active'
    }
  ]

  const stats = [
    {
      name: 'Inference Time',
      value: '35.2ms',
      target: '<50ms',
      status: 'good'
    },
    {
      name: 'FPS',
      value: '28.5',
      target: '>20',
      status: 'good'
    },
    {
      name: 'Memory Usage',
      value: '156.8MB',
      target: '<200MB',
      status: 'good'
    },
    {
      name: 'False Positive Rate',
      value: '5.0%',
      target: '<7%',
      status: 'good'
    }
  ]

  return (
    <div className="space-y-8">
      {/* Hero Section */}
      <div className="text-center">
        <h1 className="text-4xl font-bold text-gray-900 sm:text-5xl">
          Edge-Optimized
          <span className="text-gradient"> AI Proctoring</span>
        </h1>
        <p className="mt-4 text-xl text-gray-600 max-w-3xl mx-auto">
          Advanced computer vision and machine learning system designed for edge devices 
          with limited resources. Monitor exams in real-time with high accuracy and low latency.
        </p>

        <div className="mt-8 flex justify-center space-x-4">
          <Link
            to="/setup"
            className="btn-primary flex items-center space-x-2"
          >
            <PlayIcon className="h-5 w-5" />
            <span>Start New Exam</span>
          </Link>
          <Link
            to="/settings"
            className="btn-secondary flex items-center space-x-2"
          >
            <CogIcon className="h-5 w-5" />
            <span>Configure Settings</span>
          </Link>
        </div>
      </div>

      {/* Status Section */}
      <div className="card">
        <div className="card-header">
          <h2 className="text-lg font-semibold text-gray-900">System Status</h2>
        </div>
        <div className="card-body">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {stats.map((stat) => (
              <div key={stat.name} className="text-center">
                <div className={`text-2xl font-bold ${
                  stat.status === 'good' ? 'text-green-600' : 'text-yellow-600'
                }`}>
                  {stat.value}
                </div>
                <div className="text-sm text-gray-600">{stat.name}</div>
                <div className="text-xs text-gray-500">Target: {stat.target}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Features Section */}
      <div className="card">
        <div className="card-header">
          <h2 className="text-lg font-semibold text-gray-900">AI/ML Features</h2>
          <p className="text-sm text-gray-600 mt-1">
            Advanced machine learning modules optimized for edge computing
          </p>
        </div>
        <div className="card-body">
          <div className="proctor-grid">
            {features.map((feature) => (
              <div key={feature.name} className="p-6 bg-gray-50 rounded-lg border border-gray-200 hover:border-gray-300 transition-colors">
                <div className="flex items-start space-x-3">
                  <div className="flex-shrink-0">
                    <feature.icon className="h-6 w-6 text-primary-600" />
                  </div>
                  <div className="flex-1">
                    <h3 className="text-sm font-semibold text-gray-900">
                      {feature.name}
                    </h3>
                    <p className="text-sm text-gray-600 mt-1">
                      {feature.description}
                    </p>
                    <div className="mt-2">
                      <span className="status-indicator status-active">
                        {feature.status}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="card">
        <div className="card-header">
          <h2 className="text-lg font-semibold text-gray-900">Quick Actions</h2>
        </div>
        <div className="card-body">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Link
              to="/setup"
              className="p-4 bg-primary-50 rounded-lg border border-primary-200 hover:border-primary-300 transition-colors group"
            >
              <div className="flex items-center space-x-3">
                <PlayIcon className="h-5 w-5 text-primary-600 group-hover:text-primary-700" />
                <div>
                  <div className="font-medium text-primary-900">Start Exam</div>
                  <div className="text-sm text-primary-700">Configure and begin proctoring</div>
                </div>
              </div>
            </Link>

            <Link
              to="/reports"
              className="p-4 bg-green-50 rounded-lg border border-green-200 hover:border-green-300 transition-colors group"
            >
              <div className="flex items-center space-x-3">
                <ChartBarIcon className="h-5 w-5 text-green-600 group-hover:text-green-700" />
                <div>
                  <div className="font-medium text-green-900">View Reports</div>
                  <div className="text-sm text-green-700">Analyze exam data and alerts</div>
                </div>
              </div>
            </Link>

            <Link
              to="/settings"
              className="p-4 bg-gray-50 rounded-lg border border-gray-200 hover:border-gray-300 transition-colors group"
            >
              <div className="flex items-center space-x-3">
                <CogIcon className="h-5 w-5 text-gray-600 group-hover:text-gray-700" />
                <div>
                  <div className="font-medium text-gray-900">Settings</div>
                  <div className="text-sm text-gray-700">Configure system preferences</div>
                </div>
              </div>
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}

export default HomePage