import { useState, useEffect, useCallback, useRef } from 'react'
import { useProctorStore } from '@stores/proctorStore'
import { initializeAnalysisEngine, startAnalysis, stopAnalysis } from '@ml/analysisEngine'
import { initializeCamera, getCurrentFrame, cleanupCamera, getAvailableDevices, switchCameraDevice } from '@utils/cameraUtils'
import { startPerformanceMonitoring, stopPerformanceMonitoring, recordFrame, recordInferenceTime } from '@utils/performanceUtils'
import { showAlertNotification, requestNotificationPermission } from '@utils/notificationUtils'
import type { Exam, Alert, PerformanceMetrics, UseProctoringOptions, UseProctoringReturn } from '@types/types'

export const useProctoring = (options: UseProctoringOptions): UseProctoringReturn => {
  const { exam, onAlert, onPerformanceUpdate } = options
  
  const {
    isActive,
    isAnalyzing,
    alerts,
    performanceMetrics,
    startProctoring: storeStartProctoring,
    stopProctoring: storeStopProctoring,
    addAlert
  } = useProctorStore()

  const [isInitialized, setIsInitialized] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const analysisRef = useRef<boolean>(false)

  // Initialize proctoring system
  const initialize = useCallback(async () => {
    try {
      setError(null)
      
      // Initialize camera
      await initializeCamera()
      
      // Initialize analysis engine
      await initializeAnalysisEngine()
      
      // Request notification permission
      await requestNotificationPermission()
      
      // Start performance monitoring
      startPerformanceMonitoring()
      
      setIsInitialized(true)
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to initialize proctoring system'
      setError(errorMessage)
      console.error('Proctoring initialization failed:', err)
    }
  }, [])

  // Start proctoring
  const startProctoring = useCallback(async () => {
    if (!isInitialized) {
      await initialize()
    }

    try {
      setError(null)
      
      // Start analysis engine
      await startAnalysis(exam)
      
      // Start store proctoring
      storeStartProctoring(exam)
      
      analysisRef.current = true
      
      console.log('Proctoring started for exam:', exam.id)
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to start proctoring'
      setError(errorMessage)
      console.error('Proctoring start failed:', err)
    }
  }, [exam, isInitialized, initialize, storeStartProctoring])

  // Stop proctoring
  const stopProctoring = useCallback(() => {
    try {
      // Stop analysis engine
      stopAnalysis()
      
      // Stop store proctoring
      storeStopProctoring()
      
      // Stop performance monitoring
      stopPerformanceMonitoring()
      
      analysisRef.current = false
      
      console.log('Proctoring stopped')
    } catch (err) {
      console.error('Proctoring stop failed:', err)
    }
  }, [storeStopProctoring])

  // Clear alerts
  const clearAlerts = useCallback(() => {
    // This would clear alerts in the store
    // Implementation depends on store structure
    console.log('Alerts cleared')
  }, [])

  // Handle new alerts
  useEffect(() => {
    if (alerts.length > 0) {
      const latestAlert = alerts[alerts.length - 1]
      
      // Show notification
      showAlertNotification(latestAlert)
      
      // Call callback if provided
      if (onAlert) {
        onAlert(latestAlert)
      }
    }
  }, [alerts, onAlert])

  // Handle performance updates
  useEffect(() => {
    if (onPerformanceUpdate) {
      onPerformanceUpdate(performanceMetrics)
    }
  }, [performanceMetrics, onPerformanceUpdate])

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (analysisRef.current) {
        stopProctoring()
      }
      cleanupCamera()
    }
  }, [stopProctoring])

  return {
    isActive,
    isAnalyzing,
    alerts,
    performanceMetrics,
    startProctoring,
    stopProctoring,
    clearAlerts,
    error,
    isInitialized
  }
}

// Hook for camera management
export const useCamera = () => {
  const [isActive, setIsActive] = useState(false)
  const [devices, setDevices] = useState<MediaDeviceInfo[]>([])
  const [currentDevice, setCurrentDevice] = useState<string>('')
  const [error, setError] = useState<string | null>(null)

  const initializeCameraHook = useCallback(async () => {
    try {
      setError(null)
      await initializeCamera()
      setIsActive(true)
      
      // Get available devices
      const availableDevices = await getAvailableDevices()
      setDevices(availableDevices)
      
      if (availableDevices.length > 0) {
        setCurrentDevice(availableDevices[0].deviceId)
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to initialize camera'
      setError(errorMessage)
    }
  }, [])

  const switchDeviceHook = useCallback(async (deviceId: string) => {
    try {
      setError(null)
      await switchCameraDevice(deviceId)
      setCurrentDevice(deviceId)
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to switch camera device'
      setError(errorMessage)
    }
  }, [])

  const captureFrame = useCallback(async () => {
    try {
      return await getCurrentFrame()
    } catch (err) {
      console.error('Failed to capture frame:', err)
      return null
    }
  }, [])

  return {
    isActive,
    devices,
    currentDevice,
    error,
    initializeCamera: initializeCameraHook,
    switchDevice: switchDeviceHook,
    captureFrame
  }
}

// Hook for performance monitoring
export const usePerformanceMonitoring = () => {
  const { performanceMetrics, updatePerformanceMetrics } = useProctorStore()
  const [isMonitoring, setIsMonitoring] = useState(false)

  const startMonitoring = useCallback(() => {
    startPerformanceMonitoring()
    setIsMonitoring(true)
  }, [])

  const stopMonitoring = useCallback(() => {
    stopPerformanceMonitoring()
    setIsMonitoring(false)
  }, [])

  const recordInference = useCallback((inferenceTime: number) => {
    recordInferenceTime(inferenceTime)
  }, [])

  const recordFrameCount = useCallback(() => {
    recordFrame()
  }, [])

  return {
    performanceMetrics,
    isMonitoring,
    startMonitoring,
    stopMonitoring,
    recordInference,
    recordFrameCount
  }
}

// Hook for alert management
export const useAlerts = () => {
  const { alerts, addAlert, acknowledgeAlert, resolveAlert } = useProctorStore()
  const [unreadCount, setUnreadCount] = useState(0)

  useEffect(() => {
    const unread = alerts.filter(alert => !alert.acknowledged).length
    setUnreadCount(unread)
  }, [alerts])

  const acknowledgeAll = useCallback(() => {
    alerts.forEach(alert => {
      if (!alert.acknowledged) {
        acknowledgeAlert(alert.id)
      }
    })
  }, [alerts, acknowledgeAlert])

  const resolveAll = useCallback(() => {
    alerts.forEach(alert => {
      if (!alert.resolved) {
        resolveAlert(alert.id)
      }
    })
  }, [alerts, resolveAlert])

  const getAlertsBySeverity = useCallback((severity: Alert['severity']) => {
    return alerts.filter(alert => alert.severity === severity)
  }, [alerts])

  const getRecentAlerts = useCallback((minutes: number = 5) => {
    const cutoffTime = Date.now() - (minutes * 60 * 1000)
    return alerts.filter(alert => alert.timestamp.getTime() > cutoffTime)
  }, [alerts])

  return {
    alerts,
    unreadCount,
    addAlert,
    acknowledgeAlert,
    resolveAlert,
    acknowledgeAll,
    resolveAll,
    getAlertsBySeverity,
    getRecentAlerts
  }
}
