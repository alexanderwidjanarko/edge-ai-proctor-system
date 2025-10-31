import { Link } from 'react-router-dom'
import { useEffect, useRef, useState } from 'react'
import { initializeCamera, getVideoElement, cleanupCamera } from '@utils/cameraUtils'
import { initializeAnalysisEngine, startAnalysis, stopAnalysis, onAnalysis } from '@ml/analysisEngine'
import { startAudioMonitoring, stopAudioMonitoring } from '@utils/audioUtils'
import { loadEnrollment } from '@utils/verificationUtils'
import { enrollFromPublicPath } from '@utils/enrollmentBootstrap'
import { 
  StopIcon, 
  PlayIcon,
  CheckCircleIcon,
  EyeIcon,
  CpuChipIcon,
  ExclamationTriangleIcon,
  DevicePhoneMobileIcon,
  UserIcon
} from '@heroicons/react/24/outline'

type AnomalyAlert = {
  id: string
  message: string
  objectType: string
  confidence: number
  timestamp: Date
}

const ProctoringPage = () => {
  const containerRef = useRef<HTMLDivElement | null>(null)
  const canvasRef = useRef<HTMLCanvasElement | null>(null)
  const [isRunning, setIsRunning] = useState(false)
  const [alerts, setAlerts] = useState<string[]>([])
  const [anomalyAlerts, setAnomalyAlerts] = useState<AnomalyAlert[]>([])
  const [verified, setVerified] = useState<{ score: number; match: boolean } | null>(null)
  const [enrolledName, setEnrolledName] = useState<string>('')
  const [detections, setDetections] = useState<{ faces: number; anomalies: number }>({ faces: 0, anomalies: 0 })

  useEffect(() => {
    // Attach video element to container
    const el = getVideoElement()
    if (el && containerRef.current) {
      // Setup container as relative positioned
      if (!containerRef.current.style.position) {
        containerRef.current.style.position = 'relative'
      }
      
      // Remove existing children to avoid duplicates
      containerRef.current.innerHTML = ''
      
      // Setup video element
      el.style.width = '100%'
      el.style.height = '100%'
      el.style.display = 'block'
      el.style.objectFit = 'contain'
      containerRef.current.appendChild(el)
      
      // Create canvas for drawing detections overlay
      if (!canvasRef.current) {
        const canvas = document.createElement('canvas')
        canvas.style.position = 'absolute'
        canvas.style.top = '0'
        canvas.style.left = '0'
        canvas.style.width = '100%'
        canvas.style.height = '100%'
        canvas.style.pointerEvents = 'none'
        canvas.style.zIndex = '10'
        canvasRef.current = canvas
        containerRef.current.appendChild(canvas)
      }
    }
    
    // Handle window resize to update canvas
    const handleResize = () => {
      // Canvas will be updated on next detection frame
      if (isRunning && canvasRef.current) {
        const video = getVideoElement()
        if (video && video.videoWidth && video.videoHeight) {
          // Trigger a redraw by getting current detections if available
          // This will be handled by the onAnalysis callback
        }
      }
    }
    
    window.addEventListener('resize', handleResize)
    return () => {
      window.removeEventListener('resize', handleResize)
    }
  }, [isRunning])

  async function handleStart() {
    if (isRunning) return
    await initializeCamera()
    const el = getVideoElement()
    if (el && containerRef.current && !containerRef.current.contains(el)) {
      containerRef.current.appendChild(el)
    }
    
    // Ensure canvas exists for drawing detections
    if (containerRef.current) {
      // Setup container as relative if not already
      if (!containerRef.current.style.position) {
        containerRef.current.style.position = 'relative'
      }
      
      // Create or ensure canvas exists
      if (!canvasRef.current) {
        const canvas = document.createElement('canvas')
        canvas.style.position = 'absolute'
        canvas.style.top = '0'
        canvas.style.left = '0'
        canvas.style.width = '100%'
        canvas.style.height = '100%'
        canvas.style.pointerEvents = 'none'
        canvas.style.zIndex = '10'
        canvasRef.current = canvas
        
        // Make sure video is there first
        const existingVideo = containerRef.current.querySelector('video')
        if (existingVideo) {
          containerRef.current.insertBefore(canvas, existingVideo.nextSibling)
        } else {
          containerRef.current.appendChild(canvas)
        }
      }
    }
    
    await initializeAnalysisEngine()
    const e = loadEnrollment()
    setEnrolledName(e?.displayName || '')
    
    const off = onAnalysis((payload) => {
      if (payload.verified) setVerified(payload.verified)
      
      // Update detection counts
      setDetections({
        faces: payload.faces?.length || 0,
        anomalies: payload.anomalies?.length || 0
      })
      
      // Draw detections on canvas
      drawDetections(payload.detections || [], payload.anomalies || [])
      
      // Add anomaly alerts
      if (payload.anomalies && payload.anomalies.length > 0) {
        payload.anomalies.forEach(anomaly => {
          const alertId = `${anomaly.label}-${anomaly.bbox[0]}-${anomaly.bbox[1]}`
          const existingAlert = anomalyAlerts.find(a => a.id === alertId)
          
          // Only add new alert if not already tracked (avoid duplicates)
          if (!existingAlert) {
            const alert: AnomalyAlert = {
              id: alertId,
              message: `Anomali terdeteksi: ${anomaly.label}`,
              objectType: anomaly.label,
              confidence: anomaly.score,
              timestamp: new Date()
            }
            setAnomalyAlerts(prev => [alert, ...prev].slice(0, 20))
            
            // Add to text alerts for display
            setAlerts(prev => [
              `🚨 ${anomaly.label} terdeteksi (${(anomaly.score * 100).toFixed(0)}% confidence) - ${new Date().toLocaleTimeString()}`,
              ...prev
            ].slice(0, 20))
          }
        })
      }
    })
    
    await startAnalysis()
    await startAudioMonitoring(({ level }) => {
      setAlerts((prev) => [
        `Whisper detected (level ${level.toFixed(2)}) at ${new Date().toLocaleTimeString()}`,
        ...prev
      ].slice(0, 20))
    })
    ;(window as any).__proctor_off = off
    setIsRunning(true)
  }
  
  function drawDetections(detections: any[], anomalies: any[]) {
    const canvas = canvasRef.current
    const video = getVideoElement()
    const container = containerRef.current
    
    if (!canvas || !video || !video.videoWidth || !video.videoHeight || !container) {
      // Clear canvas if invalid
      if (canvas) {
        const ctx = canvas.getContext('2d')
        if (ctx) ctx.clearRect(0, 0, canvas.width, canvas.height)
      }
      return
    }
    
    // Get container display dimensions
    const rect = container.getBoundingClientRect()
    const containerWidth = rect.width
    const containerHeight = rect.height
    
    // Set canvas size to match container (use device pixel ratio for crisp rendering)
    const dpr = window.devicePixelRatio || 1
    canvas.width = containerWidth * dpr
    canvas.height = containerHeight * dpr
    
    const ctx = canvas.getContext('2d')
    if (!ctx) return
    
    // Scale context to handle device pixel ratio
    ctx.scale(dpr, dpr)
    
    // Clear previous drawings
    ctx.clearRect(0, 0, containerWidth, containerHeight)
    
    // If no detections, just clear and return
    if (detections.length === 0) return
    
    // Get video display size (video element might have object-fit)
    const videoDisplayWidth = video.offsetWidth || containerWidth
    const videoDisplayHeight = video.offsetHeight || containerHeight
    
    // Calculate how video is displayed in container (considering object-fit)
    const videoAspect = video.videoWidth / video.videoHeight
    const containerAspect = containerWidth / containerHeight
    
    let scaleX = 1
    let scaleY = 1
    let offsetX = 0
    let offsetY = 0
    
    // Match video display logic (object-fit: contain)
    if (videoAspect > containerAspect) {
      // Video is wider - fit to width
      scaleX = scaleY = containerWidth / video.videoWidth
      offsetY = (containerHeight - video.videoHeight * scaleY) / 2
    } else {
      // Video is taller - fit to height
      scaleX = scaleY = containerHeight / video.videoHeight
      offsetX = (containerWidth - video.videoWidth * scaleX) / 2
    }
    
    // Draw all detections with bounding boxes (YOLO style)
    detections.forEach(det => {
      const [x, y, w, h] = det.bbox
      const isAnomaly = det.isAnomaly || anomalies.some(a => 
        a.label === det.label && 
        Math.abs(a.bbox[0] - x) < 10 && 
        Math.abs(a.bbox[1] - y) < 10
      )
      
      // Transform coordinates from video space (actual video resolution) to canvas space (display)
      const canvasX = x * scaleX + offsetX
      const canvasY = y * scaleY + offsetY
      const canvasW = w * scaleX
      const canvasH = h * scaleY
      
      // Skip if outside container bounds
      if (canvasX + canvasW < 0 || canvasX > containerWidth || 
          canvasY + canvasH < 0 || canvasY > containerHeight) {
        return
      }
      
      // Choose colors based on detection type
      const boxColor = isAnomaly ? '#ef4444' : '#10b981' // Red for anomaly, green for normal
      const labelBgColor = isAnomaly ? '#ef4444' : '#10b981'
      
      // Draw bounding box (thicker for anomalies)
      ctx.strokeStyle = boxColor
      ctx.lineWidth = isAnomaly ? 3 : 2
      ctx.setLineDash([])
      ctx.strokeRect(canvasX, canvasY, canvasW, canvasH)
      
      // Draw label with background (YOLO style)
      const label = `${det.label} ${(det.score * 100).toFixed(0)}%`
      ctx.font = 'bold 14px Arial, sans-serif'
      const metrics = ctx.measureText(label)
      const labelHeight = 22
      const labelPadding = 4
      const labelY = Math.max(labelHeight, canvasY)
      
      // Draw label background rectangle
      ctx.fillStyle = labelBgColor
      const labelWidth = metrics.width + labelPadding * 2
      ctx.fillRect(
        canvasX, 
        labelY - labelHeight, 
        labelWidth, 
        labelHeight
      )
      
      // Draw label text
      ctx.fillStyle = '#ffffff'
      ctx.textBaseline = 'top'
      ctx.fillText(label, canvasX + labelPadding, labelY - labelHeight + 2)
      
      // Optional: Draw corner marks for better visibility (YOLO style)
      if (isAnomaly) {
        const cornerSize = 8
        ctx.strokeStyle = boxColor
        ctx.lineWidth = 2
        
        // Top-left corner
        ctx.beginPath()
        ctx.moveTo(canvasX, canvasY)
        ctx.lineTo(canvasX + cornerSize, canvasY)
        ctx.moveTo(canvasX, canvasY)
        ctx.lineTo(canvasX, canvasY + cornerSize)
        ctx.stroke()
        
        // Top-right corner
        ctx.beginPath()
        ctx.moveTo(canvasX + canvasW, canvasY)
        ctx.lineTo(canvasX + canvasW - cornerSize, canvasY)
        ctx.moveTo(canvasX + canvasW, canvasY)
        ctx.lineTo(canvasX + canvasW, canvasY + cornerSize)
        ctx.stroke()
        
        // Bottom-left corner
        ctx.beginPath()
        ctx.moveTo(canvasX, canvasY + canvasH)
        ctx.lineTo(canvasX + cornerSize, canvasY + canvasH)
        ctx.moveTo(canvasX, canvasY + canvasH)
        ctx.lineTo(canvasX, canvasY + canvasH - cornerSize)
        ctx.stroke()
        
        // Bottom-right corner
        ctx.beginPath()
        ctx.moveTo(canvasX + canvasW, canvasY + canvasH)
        ctx.lineTo(canvasX + canvasW - cornerSize, canvasY + canvasH)
        ctx.moveTo(canvasX + canvasW, canvasY + canvasH)
        ctx.lineTo(canvasX + canvasW, canvasY + canvasH - cornerSize)
        ctx.stroke()
      }
    })
  }

  function handleStop() {
    if (!isRunning) return
    stopAnalysis()
    stopAudioMonitoring()
    cleanupCamera()
    const off = (window as any).__proctor_off as undefined | (() => void)
    off && off()
    setIsRunning(false)
  }

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
              <div className="video-container bg-gray-900 rounded-lg overflow-hidden min-h-[320px]" ref={containerRef} />

              <div className="mt-4 flex justify-center flex-wrap gap-3">
                <button className="btn-primary flex items-center space-x-2" onClick={handleStart} disabled={isRunning}>
                  <PlayIcon className="h-5 w-5" />
                  <span>{isRunning ? 'Running' : 'Start Proctoring'}</span>
                </button>
                <button className="btn-danger flex items-center space-x-2" onClick={handleStop} disabled={!isRunning}>
                  <StopIcon className="h-5 w-5" />
                  <span>Stop</span>
                </button>
                <button className="btn-secondary" onClick={async () => {
                  try {
                    await enrollFromPublicPath('/enrollment/Foto_Nathan.jpg')
                    const e = loadEnrollment()
                    if (e?.displayName) setEnrolledName(e.displayName)
                    alert('Enrollment loaded from /enrollment/Foto_Nathan.jpg')
                  } catch {
                    alert('Put Foto_Nathan.jpg under public/enrollment first.')
                  }
                }}>Load Default Enrollment</button>
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

          {/* Detection Status */}
          <div className="card">
            <div className="card-header">
              <h3 className="text-lg font-semibold text-gray-900">Detection Status</h3>
            </div>
            <div className="card-body">
              <div className="space-y-3">
                <div className="flex items-center justify-between p-3 bg-gray-50 rounded border">
                  <div className="flex items-center space-x-2">
                    <UserIcon className="h-5 w-5 text-blue-600" />
                    <div className="text-sm text-gray-700">Wajah Terdeteksi</div>
                  </div>
                  <div className="text-sm font-semibold text-blue-600">
                    {detections.faces} wajah
                  </div>
                </div>
                <div className="flex items-center justify-between p-3 bg-gray-50 rounded border">
                  <div className="flex items-center space-x-2">
                    <DevicePhoneMobileIcon className="h-5 w-5 text-red-600" />
                    <div className="text-sm text-gray-700">Anomali Terdeteksi</div>
                  </div>
                  <div className={`text-sm font-semibold ${detections.anomalies > 0 ? 'text-red-600' : 'text-green-600'}`}>
                    {detections.anomalies} anomali
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
              <div className="space-y-3">
                <div className="flex items-center justify-between p-3 bg-gray-50 rounded border">
                  <div className="text-sm text-gray-700">Identity Verification {enrolledName ? `• ${enrolledName}` : ''}</div>
                  <div className={`text-sm font-semibold ${verified?.match ? 'text-green-600' : 'text-gray-500'}`}>
                    {verified ? `${verified.match ? 'MATCH' : 'NO MATCH'} (${(verified.score * 100).toFixed(0)}%)` : '—'}
                  </div>
                </div>
                {alerts.length === 0 ? (
                  <div className="text-center py-6 text-gray-500">
                    <CheckCircleIcon className="h-8 w-8 mx-auto mb-2 text-green-500" />
                    <p>No alerts</p>
                  </div>
                ) : (
                  <ul className="text-sm text-gray-800 space-y-2 max-h-56 overflow-auto">
                    {alerts.map((a, i) => {
                      const isAnomaly = a.includes('terdeteksi')
                      return (
                        <li 
                          key={i} 
                          className={`p-2 border rounded ${
                            isAnomaly 
                              ? 'bg-red-50 border-red-200 text-red-700' 
                              : 'bg-yellow-50 border-yellow-200 text-yellow-700'
                          }`}
                        >
                          {isAnomaly && <ExclamationTriangleIcon className="h-4 w-4 inline-block mr-1" />}
                          {a}
                        </li>
                      )
                    })}
                  </ul>
                )}
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
                  <span className="text-sm text-gray-600">YOLOv8n Detection</span>
                  <div className="flex items-center space-x-2">
                    <div className="w-2 h-2 rounded-full bg-green-500" />
                    <span className="text-sm font-medium">Active</span>
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Identity Verification</span>
                  <div className="flex items-center space-x-2">
                    <div className="w-2 h-2 rounded-full bg-green-500" />
                    <span className="text-sm font-medium">Active</span>
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Whisper Detection</span>
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