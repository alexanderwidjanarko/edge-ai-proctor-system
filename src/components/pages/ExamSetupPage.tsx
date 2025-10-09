import { Link } from 'react-router-dom'
import { 
  PlayIcon, 
  ShieldCheckIcon,
  EyeIcon,
  CpuChipIcon
} from '@heroicons/react/24/outline'

const ExamSetupPage = () => {
  return (
    <div className="max-w-4xl mx-auto">
      <div className="card">
        <div className="card-header">
          <h1 className="text-2xl font-bold text-gray-900">Exam Setup</h1>
          <p className="text-gray-600 mt-1">
            Configure your exam settings and AI proctoring parameters
          </p>
        </div>

        <div className="card-body">
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Exam Title
              </label>
              <input
                type="text"
                className="input-field"
                placeholder="Enter exam title"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Description
              </label>
              <textarea
                className="input-field"
                rows={3}
                placeholder="Enter exam description"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Duration (minutes)
              </label>
              <input
                type="number"
                className="input-field"
                min="1"
                max="480"
                defaultValue="60"
              />
            </div>

            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-4">AI Settings</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {[
                  { key: 'faceDetection', label: 'Face Detection', icon: EyeIcon, description: 'Detect and track faces' },
                  { key: 'headPoseTracking', label: 'Head Pose Tracking', icon: CpuChipIcon, description: 'Monitor head movements' },
                  { key: 'eyeGazeTracking', label: 'Eye Gaze Tracking', icon: EyeIcon, description: 'Track eye movements' },
                  { key: 'objectDetection', label: 'Object Detection', icon: ShieldCheckIcon, description: 'Detect suspicious objects' },
                  { key: 'handObjectInteraction', label: 'Hand-Object Interaction', icon: ShieldCheckIcon, description: 'Monitor hand movements' },
                  { key: 'temporalAnalysis', label: 'Temporal Analysis', icon: CpuChipIcon, description: 'Analyze behavior patterns' },
                  { key: 'behaviorProfiling', label: 'Behavior Profiling', icon: CpuChipIcon, description: 'Create behavior baseline' },
                  { key: 'recordingEnabled', label: 'Video Recording', icon: PlayIcon, description: 'Record exam session' }
                ].map((setting) => (
                  <div key={setting.key} className="flex items-center space-x-3 p-4 bg-gray-50 rounded-lg">
                    <setting.icon className="h-5 w-5 text-primary-600" />
                    <div className="flex-1">
                      <div className="font-medium text-gray-900">{setting.label}</div>
                      <div className="text-sm text-gray-600">{setting.description}</div>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        defaultChecked
                        className="sr-only peer"
                      />
                      <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary-600"></div>
                    </label>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        <div className="px-6 py-4 border-t border-gray-200 flex justify-end">
          <Link
            to="/proctor/sample-exam"
            className="btn-primary flex items-center space-x-2"
          >
            <PlayIcon className="h-5 w-5" />
            <span>Start Exam</span>
          </Link>
        </div>
      </div>
    </div>
  )
}

export default ExamSetupPage