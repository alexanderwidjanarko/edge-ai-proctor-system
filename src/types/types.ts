// Core Types
export interface Exam {
  id: string
  title: string
  description: string
  duration: number // in minutes
  startTime: Date
  endTime: Date
  settings: ExamSettings
  status: ExamStatus
  createdAt: Date
  updatedAt: Date
}

export interface ExamSettings {
  faceDetection: boolean
  headPoseTracking: boolean
  eyeGazeTracking: boolean
  objectDetection: boolean
  handObjectInteraction: boolean
  temporalAnalysis: boolean
  behaviorProfiling: boolean
  alertThresholds: AlertThresholds
  recordingEnabled: boolean
  audioEnabled: boolean
}

export interface AlertThresholds {
  faceDetectionConfidence: number // 0-1
  headPoseDeviation: number // degrees
  eyeGazeDeviation: number // degrees
  objectDetectionConfidence: number // 0-1
  suspiciousBehaviorScore: number // 0-1
  temporalAnomalyThreshold: number // 0-1
}

export type ExamStatus = 'draft' | 'scheduled' | 'active' | 'completed' | 'cancelled'

// ML Detection Types
export interface FaceDetection {
  id: string
  boundingBox: BoundingBox
  confidence: number
  landmarks?: FaceLandmarks
  timestamp: number
}

export interface FaceLandmarks {
  leftEye: Point2D
  rightEye: Point2D
  nose: Point2D
  mouth: Point2D
  chin: Point2D
}

export interface HeadPose {
  pitch: number // rotation around X-axis
  yaw: number // rotation around Y-axis
  roll: number // rotation around Z-axis
  confidence: number
  timestamp: number
}

export interface EyeGaze {
  leftEye: EyeDirection
  rightEye: EyeDirection
  combined: EyeDirection
  confidence: number
  timestamp: number
}

export interface EyeDirection {
  x: number // -1 to 1
  y: number // -1 to 1
  z: number // -1 to 1
}

export interface ObjectDetection {
  id: string
  label: string
  boundingBox: BoundingBox
  confidence: number
  category: ObjectCategory
  timestamp: number
}

export type ObjectCategory = 'phone' | 'book' | 'paper' | 'calculator' | 'headphone' | 'other'

export interface HandObjectInteraction {
  handId: string
  objectId: string
  interactionType: InteractionType
  confidence: number
  timestamp: number
}

export type InteractionType = 'holding' | 'touching' | 'nearby' | 'none'

export interface TemporalAnalysis {
  anomalyScore: number // 0-1
  patternType: PatternType
  confidence: number
  timestamp: number
}

export type PatternType = 'normal' | 'suspicious' | 'anomalous'

export interface BehaviorProfile {
  baselineMetrics: BaselineMetrics
  currentMetrics: CurrentMetrics
  deviationScore: number // 0-1
  timestamp: number
}

export interface BaselineMetrics {
  averageHeadPose: HeadPose
  averageEyeGaze: EyeGaze
  typicalObjectCount: number
  normalMovementPattern: number[]
}

export interface CurrentMetrics {
  currentHeadPose: HeadPose
  currentEyeGaze: EyeGaze
  currentObjectCount: number
  currentMovementPattern: number[]
}

// Alert Types
export interface Alert {
  id: string
  examId: string
  type: AlertType
  severity: AlertSeverity
  message: string
  data: AlertData
  timestamp: Date
  acknowledged: boolean
  resolved: boolean
}

export type AlertType = 
  | 'face_not_detected'
  | 'head_pose_deviation'
  | 'eye_gaze_deviation'
  | 'suspicious_object'
  | 'hand_object_interaction'
  | 'temporal_anomaly'
  | 'behavior_deviation'
  | 'system_error'

export type AlertSeverity = 'low' | 'medium' | 'high' | 'critical'

export interface AlertData {
  detection?: FaceDetection | HeadPose | EyeGaze | ObjectDetection
  interaction?: HandObjectInteraction
  analysis?: TemporalAnalysis
  behavior?: BehaviorProfile
  metadata?: Record<string, any>
}

// Performance Types
export interface PerformanceMetrics {
  inferenceTime: number // ms
  fps: number
  memoryUsage: number // MB
  cpuUsage: number // percentage
  modelLoadTime: number // ms
  falsePositiveRate: number // 0-1
  timestamp: number
}

export interface ModelInfo {
  name: string
  version: string
  size: number // bytes
  loadTime: number // ms
  isLoaded: boolean
  lastUsed: Date
}

// UI Types
export interface ProctorState {
  isActive: boolean
  isRecording: boolean
  isAnalyzing: boolean
  currentExam?: Exam
  alerts: Alert[]
  performanceMetrics: PerformanceMetrics
  models: ModelInfo[]
}

export interface CameraSettings {
  deviceId: string
  resolution: VideoResolution
  frameRate: number
  quality: number // 0-1
}

export type VideoResolution = '320x240' | '640x480' | '1280x720' | '1920x1080'

// Utility Types
export interface BoundingBox {
  x: number
  y: number
  width: number
  height: number
}

export interface Point2D {
  x: number
  y: number
}

export interface Point3D {
  x: number
  y: number
  z: number
}

// Store Types
export interface ProctorStore {
  // State
  isInitialized: boolean
  isActive: boolean
  isRecording: boolean
  isAnalyzing: boolean
  currentExam: Exam | null
  alerts: Alert[]
  performanceMetrics: PerformanceMetrics
  models: ModelInfo[]
  cameraSettings: CameraSettings
  
  // Actions
  initialize: () => Promise<void>
  startProctoring: (exam: Exam) => Promise<void>
  stopProctoring: () => void
  addAlert: (alert: Omit<Alert, 'id' | 'timestamp'>) => void
  acknowledgeAlert: (alertId: string) => void
  resolveAlert: (alertId: string) => void
  updatePerformanceMetrics: (metrics: Partial<PerformanceMetrics>) => void
  updateModelInfo: (model: ModelInfo) => void
  setCameraSettings: (settings: Partial<CameraSettings>) => void
}

// Hook Types
export interface UseProctoringOptions {
  exam: Exam
  onAlert?: (alert: Alert) => void
  onPerformanceUpdate?: (metrics: PerformanceMetrics) => void
}

export interface UseProctoringReturn {
  isActive: boolean
  isAnalyzing: boolean
  alerts: Alert[]
  performanceMetrics: PerformanceMetrics
  startProctoring: () => Promise<void>
  stopProctoring: () => void
  clearAlerts: () => void
  error?: string | null
  isInitialized?: boolean
}
