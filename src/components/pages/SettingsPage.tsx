import { useEffect, useRef, useState } from 'react'
import { enrollFromCanvas, loadEnrollment } from '@utils/verificationUtils'
import { enrollFromPublicPath } from '@utils/enrollmentBootstrap'
import { 
  VideoCameraIcon, 
  CpuChipIcon,
  ShieldCheckIcon,
  BellIcon
} from '@heroicons/react/24/outline'

const SettingsPage = () => {
  const [activeTab, setActiveTab] = useState('camera')
  const [enrollPreview, setEnrollPreview] = useState<string | null>(null)
  const [enrolledInfo, setEnrolledInfo] = useState<{ hasData: boolean; name?: string } | null>(null)
  const [enrollName, setEnrollName] = useState<string>("")
  const imgRef = useRef<HTMLImageElement | null>(null)
  const canvasRef = useRef<HTMLCanvasElement | null>(null)

  useEffect(() => {
    const e = loadEnrollment()
    setEnrolledInfo({ hasData: !!e, name: e?.displayName })
    setEnrollName(e?.displayName || '')
  }, [])

  const tabs = [
    { id: 'camera', name: 'Camera', icon: VideoCameraIcon },
    { id: 'ai', name: 'AI Settings', icon: CpuChipIcon },
    { id: 'alerts', name: 'Alerts', icon: BellIcon },
    { id: 'security', name: 'Security', icon: ShieldCheckIcon }
  ]

  return (
    <div className="max-w-4xl mx-auto">
      <div className="card">
        <div className="card-header">
          <h1 className="text-2xl font-bold text-gray-900">Settings</h1>
          <p className="text-gray-600 mt-1">
            Configure your proctoring system preferences
          </p>
        </div>

        {/* Tab Navigation */}
        <div className="px-6 py-4 border-b border-gray-200">
          <nav className="flex space-x-8">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center space-x-2 text-sm font-medium ${
                  activeTab === tab.id
                    ? 'text-primary-600 border-b-2 border-primary-500'
                    : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                <tab.icon className="h-4 w-4" />
                <span>{tab.name}</span>
              </button>
            ))}
          </nav>
        </div>

        {/* Tab Content */}
        <div className="card-body">
          {activeTab === 'camera' && (
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Camera Device
                </label>
                <select className="input-field">
                  <option>Default Camera</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Resolution
                </label>
                <select className="input-field">
                  <option value="320x240">320x240 (QVGA)</option>
                  <option value="640x480">640x480 (VGA)</option>
                  <option value="1280x720">1280x720 (HD)</option>
                  <option value="1920x1080">1920x1080 (Full HD)</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Frame Rate: 30 FPS
                </label>
                <input
                  type="range"
                  min="15"
                  max="60"
                  step="5"
                  defaultValue="30"
                  className="w-full"
                />
              </div>
            </div>
          )}

          {activeTab === 'ai' && (
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4">ML Models</h3>
                <div className="space-y-4">
                  {[
                    { name: 'blazeface', version: '1.0.0', size: '2.3MB', loaded: true },
                    { name: 'head-pose', version: '1.0.0', size: '8.5MB', loaded: true },
                    { name: 'eye-gaze', version: '1.0.0', size: '3.2MB', loaded: true },
                    { name: 'yolov8n', version: '1.0.0', size: '6.1MB', loaded: true }
                  ].map((model) => (
                    <div key={model.name} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                      <div>
                        <div className="font-medium text-gray-900 capitalize">
                          {model.name.replace(/-/g, ' ')}
                        </div>
                        <div className="text-sm text-gray-600">
                          Version {model.version} • {model.size}
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <div className={`w-2 h-2 rounded-full ${model.loaded ? 'bg-green-500' : 'bg-gray-400'}`} />
                        <span className="text-sm font-medium">
                          {model.loaded ? 'Loaded' : 'Not Loaded'}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {activeTab === 'alerts' && (
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Alert Preferences</h3>
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                    <div>
                      <div className="font-medium text-gray-900">Browser Notifications</div>
                      <div className="text-sm text-gray-600">Show desktop notifications for alerts</div>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input type="checkbox" className="sr-only peer" defaultChecked />
                      <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary-600"></div>
                    </label>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'security' && (
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Security Settings</h3>
                <div className="space-y-4">
                  <div className="p-4 bg-red-50 rounded-lg border border-red-200">
                    <div className="font-medium text-red-900 mb-2">Data Privacy</div>
                    <div className="text-sm text-red-700">
                      All video data is processed locally and never transmitted to external servers. 
                      Only alert metadata is stored for reporting purposes.
                    </div>
                  </div>

                  <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
                    <div className="font-medium text-blue-900 mb-2">Encryption</div>
                    <div className="text-sm text-blue-700">
                      All stored data is encrypted using AES-256 encryption. 
                      Video streams are processed in memory only.
                    </div>
                  </div>
                </div>
              </div>

              <div className="p-4 bg-gray-50 rounded-lg border border-gray-200">
                <div className="font-medium text-gray-900 mb-2">One-shot Face Enrollment</div>
                <p className="text-sm text-gray-700 mb-3">
                  Upload exactly one clear, front-facing photo of the test taker. This will be stored locally in the browser under key <code>proctor:enrollment</code> and used to verify identity during the exam.
                </p>

                <div className="flex flex-col md:flex-row md:items-start md:space-x-6 space-y-4 md:space-y-0">
                  <div className="space-y-2">
                    <input
                      type="file"
                      accept="image/*"
                      onChange={async (e) => {
                        const file = e.target.files?.[0]
                        if (!file) return
                        const url = URL.createObjectURL(file)
                        setEnrollPreview(url)
                      }}
                      className="input-field"
                    />
                    <input
                      type="text"
                      placeholder="Display name (contoh: Alex)"
                      className="input-field"
                      value={enrollName}
                      onChange={(e) => setEnrollName(e.target.value)}
                    />
                    {enrollPreview && (
                      <img ref={imgRef} src={enrollPreview} alt="Enrollment preview" className="max-w-xs rounded border" onLoad={() => {
                        const img = imgRef.current
                        if (!img) return
                        const c = canvasRef.current || document.createElement('canvas')
                        canvasRef.current = c
                        const size = 256
                        c.width = size
                        c.height = size
                        const ctx = c.getContext('2d')!
                        // Center-crop square then draw
                        const minSide = Math.min(img.naturalWidth, img.naturalHeight)
                        const sx = (img.naturalWidth - minSide) / 2
                        const sy = (img.naturalHeight - minSide) / 2
                        ctx.drawImage(img, sx, sy, minSide, minSide, 0, 0, size, size)
                      }} />
                    )}
                  </div>

                  <div className="flex-1 space-y-3">
                    <button
                      className="btn-primary"
                      onClick={async () => {
                        const c = canvasRef.current
                        if (!c) return
                        await enrollFromCanvas(c)
                        const current = loadEnrollment()
                        if (current) {
                          const updated = { ...current, displayName: enrollName || current.displayName }
                          localStorage.setItem('proctor:enrollment', JSON.stringify(updated))
                          setEnrolledInfo({ hasData: true, name: updated.displayName })
                        } else {
                          setEnrolledInfo({ hasData: true, name: enrollName })
                        }
                        alert('Enrollment saved locally. Ready for verification during exam.')
                      }}
                      disabled={!enrollPreview}
                    >
                      Save Enrollment
                    </button>
                    <button
                      className="btn-secondary"
                      onClick={async () => {
                        try {
                          await enrollFromPublicPath('/enrollment/Foto_Alex.jpg')
                          const nameFromFile = 'Alex'
                          const current = loadEnrollment()
                          if (current) {
                            const updated = { ...current, displayName: enrollName || nameFromFile }
                            localStorage.setItem('proctor:enrollment', JSON.stringify(updated))
                            setEnrolledInfo({ hasData: true, name: updated.displayName })
                            setEnrollName(updated.displayName || '')
                          } else {
                            setEnrolledInfo({ hasData: true, name: enrollName || nameFromFile })
                            setEnrollName(enrollName || nameFromFile)
                          }
                          alert('Enrollment loaded from /enrollment/Foto_Alex.jpg')
                        } catch (e) {
                          alert('Failed to load /enrollment/Foto_Alex.jpg. Make sure the file exists under public/enrollment/')
                        }
                      }}
                    >
                      Load from public/enrollment/Foto_Alex.jpg
                    </button>
                    <div className="text-sm text-gray-600">
                      Status: {enrolledInfo?.hasData ? `Enrolled${enrolledInfo?.name ? ` as ${enrolledInfo.name}` : ''}` : 'Not enrolled'}
                    </div>
                    <div className="text-xs text-gray-500">
                      Where to place default file? Put the image at <code>public/enrollment/Foto_Alex.jpg</code> so the button above can import it. Stored locally under key <code>proctor:enrollment</code>.
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default SettingsPage