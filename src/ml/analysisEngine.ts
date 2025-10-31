/*
  YOLOv8n analysis engine (face/person/anomaly) with graceful fallback if model not present.
  - Exposes initializeAnalysisEngine, startAnalysis, stopAnalysis
  - Uses onnxruntime-web when available, model at /models/yolov8n.onnx
  - Provides callback hooks via event listeners pattern (simple)
  - Detects faces (persons) and anomalous objects (cell phone, book, calculator, etc.)
*/

import { getCurrentFrame } from '@utils/cameraUtils'
import { verifyOneShot } from '@utils/verificationUtils'

type Detection = { 
  bbox: [number, number, number, number]; // [x, y, width, height]
  label: string; 
  score: number;
  classId: number;
  isAnomaly?: boolean;
}
type AnalysisListener = (payload: { 
  detections: Detection[]; 
  verified?: { score: number; match: boolean } | null;
  anomalies?: Detection[];
  faces?: Detection[];
}) => void

// COCO class labels (80 classes)
const COCO_CLASSES = [
  'person', 'bicycle', 'car', 'motorcycle', 'airplane', 'bus', 'train', 'truck', 'boat', 'traffic light',
  'fire hydrant', 'stop sign', 'parking meter', 'bench', 'bird', 'cat', 'dog', 'horse', 'sheep', 'cow',
  'elephant', 'bear', 'zebra', 'giraffe', 'backpack', 'umbrella', 'handbag', 'tie', 'suitcase', 'frisbee',
  'skis', 'snowboard', 'sports ball', 'kite', 'baseball bat', 'baseball glove', 'skateboard', 'surfboard',
  'tennis racket', 'bottle', 'wine glass', 'cup', 'fork', 'knife', 'spoon', 'bowl', 'banana', 'apple',
  'sandwich', 'orange', 'broccoli', 'carrot', 'hot dog', 'pizza', 'donut', 'cake', 'chair', 'couch',
  'potted plant', 'bed', 'dining table', 'toilet', 'tv', 'laptop', 'mouse', 'remote', 'keyboard', 'cell phone',
  'microwave', 'oven', 'toaster', 'sink', 'refrigerator', 'book', 'clock', 'vase', 'scissors', 'teddy bear',
  'hair drier', 'toothbrush'
]

// Anomaly classes (objects that should trigger alerts during exam)
// Expanded list to detect more cheating objects
const ANOMALY_CLASSES = new Set([
  67, // cell phone
  73, // book
  70, // remote
  63, // laptop
  62, // mouse
  64, // keyboard
  75, // clock
  39, // bottle (could hide phone/camera)
  40, // wine glass (could be used for reflection)
  41, // cup (could hide small objects)
  56, // chair (checking for unusual positions)
  69, // tv (external monitor)
  47, // sports ball (unusual object during exam)
  31, // handbag (could contain phones/notes)
  26, // backpack (could contain phones/notes)
  27, // umbrella (unusual object)
])

// Detection thresholds (optimized to reduce false positives)
const CONFIDENCE_THRESHOLD = 0.25  // Standard threshold for general objects
const ANOMALY_THRESHOLD = 0.2      // Threshold for anomalies (cellphone, laptop, etc.)
const PERSON_THRESHOLD = 0.3       // Higher threshold for person to reduce false positives
const NMS_THRESHOLD = 0.4

let ort: any = null
let session: any = null
let running = false
let listeners: Set<AnalysisListener> = new Set()

export async function initializeAnalysisEngine(): Promise<void> {
  try {
    // Dynamic import to avoid bundling if not installed
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    ort = (await import('onnxruntime-web')).default || (await import('onnxruntime-web'))
  } catch {
    ort = null
  }
  if (ort) {
    try {
      session = await ort.InferenceSession.create('/models/yolov8n.onnx', { executionProviders: ['wasm'] })
    } catch {
      session = null
    }
  }
}

export async function startAnalysis(): Promise<void> {
  running = true
  loop()
}

export function stopAnalysis(): void {
  running = false
}

export function onAnalysis(cb: AnalysisListener): () => void {
  listeners.add(cb)
  return () => listeners.delete(cb)
}

async function loop() {
  while (running) {
    const canvas = await getCurrentFrame()
    if (canvas) {
      const detections = await detect(canvas)
      
      // Separate faces (persons) and anomalies
      const faces = detections.filter(d => d.label === 'person' || d.classId === 0)
      const anomalies = detections.filter(d => d.isAnomaly === true)
      
      // Crop largest face for verification
      let faceCanvas = cropLargestFace(canvas, faces)
      // Fallback: if no detections/model, center-crop square for verification
      if (!faceCanvas) {
        faceCanvas = centerCrop(canvas)
      }
      const verified = faceCanvas ? await verifyOneShot(faceCanvas).catch(() => null) : null
      
      emit({ 
        detections, 
        verified,
        anomalies,
        faces
      })
    }
    await sleep(100)
  }
}

async function detect(canvas: HTMLCanvasElement): Promise<Detection[]> {
  if (!session || !ort) {
    // Fallback: no model -> return empty
    return []
  }
  // Minimal pre/post pipeline for YOLOv8n (expects 640x640, RGB, normalized 0..1)
  const size = 640
  const input = preprocess(canvas, size)
  const feeds: Record<string, any> = {}
  const inputName = session.inputNames ? session.inputNames[0] : 'images'
  feeds[inputName] = new ort.Tensor('float32', input.data, [1, 3, size, size])
  let output
  try {
    output = await session.run(feeds)
  } catch (err) {
    console.error('YOLOv8 inference error:', err)
    return []
  }
  const outName = Object.keys(output)[0]
  const tensor = output[outName]
  const logits: Float32Array = tensor.data
  const shape = tensor.dims || tensor.shape || []
  
  // Debug: log output info (throttled)
  if (!(detect as any).lastLog || Date.now() - (detect as any).lastLog > 2000) {
    const sample = Array.from(logits.slice(0, 100))
    const max = Math.max(...Array.from(logits.slice(0, 1000)))
    const min = Math.min(...Array.from(logits.slice(0, 1000)))
    console.log(`[YOLOv8] Output shape: ${JSON.stringify(shape)}, length: ${logits.length}, sample: [${sample.slice(0, 5).map(v => v.toFixed(2)).join(', ')}...], max: ${max.toFixed(2)}, min: ${min.toFixed(2)}`)
    ;(detect as any).lastLog = Date.now()
  }
  
  const boxes = postprocessYolo(logits, canvas.width, canvas.height, shape)
  
  // Debug: log detections (throttled)
  if (!(detect as any).lastDetLog || Date.now() - (detect as any).lastDetLog > 2000) {
    if (boxes.length > 0) {
      console.log(`✅ [YOLOv8] Detected ${boxes.length} objects: ${boxes.map(d => `${d.label}(${(d.score * 100).toFixed(0)}%)`).join(', ')}`)
    } else {
      // Log why no detections if threshold is low enough
      let maxScoreFound = 0
      let maxClassFound = 0
      const sampleScores: number[] = []
      
      // Sample first 100 boxes to check scores
      const stride = 84
      const data = Array.from(logits)
      for (let i = 0; i < Math.min(100, 8400); i++) {
        const offset = i * stride
        if (offset + 4 + 80 > data.length) break
        for (let c = 0; c < 80; c++) {
          const score = data[offset + 4 + c]
          if (score > maxScoreFound) {
            maxScoreFound = score
            maxClassFound = c
          }
          if (sampleScores.length < 10) sampleScores.push(score)
        }
      }
      
      console.log(`⚠️ [YOLOv8] No detections. Max score found: ${maxScoreFound.toFixed(3)} (class ${maxClassFound}), threshold: ${CONFIDENCE_THRESHOLD}, sample scores: [${sampleScores.slice(0, 5).map(s => s.toFixed(2)).join(', ')}...]`)
    }
    ;(detect as any).lastDetLog = Date.now()
  }
  
  return boxes
}

function preprocess(canvas: HTMLCanvasElement, size: number): { data: Float32Array } {
  // Enhanced preprocessing for better detection from camera input
  const tmp = document.createElement('canvas')
  tmp.width = size
  tmp.height = size
  const ctx = tmp.getContext('2d') as CanvasRenderingContext2D
  
  // Enable image smoothing for better quality
  ctx.imageSmoothingEnabled = true
  ctx.imageSmoothingQuality = 'high'
  
  // Calculate aspect ratio to maintain it during resize
  const canvasAspect = canvas.width / canvas.height
  const targetAspect = size / size
  
  let sx = 0, sy = 0, sw = canvas.width, sh = canvas.height
  let dx = 0, dy = 0, dw = size, dh = size
  
  // Center crop to maintain aspect ratio
  if (canvasAspect > targetAspect) {
    // Canvas is wider - crop width
    sw = canvas.height * targetAspect
    sx = (canvas.width - sw) / 2
  } else {
    // Canvas is taller - crop height
    sh = canvas.width / targetAspect
    sy = (canvas.height - sh) / 2
  }
  
  // Clear canvas with black background (helps with normalization)
  ctx.fillStyle = '#000000'
  ctx.fillRect(0, 0, size, size)
  
  // Draw image centered and scaled
  ctx.drawImage(canvas, sx, sy, sw, sh, dx, dy, dw, dh)
  
  // Get image data
  const img = ctx.getImageData(0, 0, size, size)
  const data = new Float32Array(size * size * 3)
  
  // HWC -> CHW conversion, normalize 0..1
  // RGB format (YOLO expects RGB, not BGR)
  let p = 0
  for (let i = 0; i < img.data.length; i += 4) {
    const r = img.data[i] / 255.0
    const g = img.data[i + 1] / 255.0
    const b = img.data[i + 2] / 255.0
    
    // Store in CHW format: [R channel, G channel, B channel]
    data[p] = r                    // R channel
    data[p + size * size] = g      // G channel
    data[p + 2 * size * size] = b  // B channel
    p++
  }
  
  return { data }
}

function postprocessYolo(output: Float32Array, imgW: number, imgH: number, shape?: number[]): Detection[] {
  // YOLOv8 output format: [1, 84, 8400] or [1, 8400, 84]
  // Each detection: [x_center, y_center, width, height, class_score_0, ..., class_score_79]
  // YOLOv8 outputs coordinates in normalized format (0-1) relative to input size (640x640)
  
  const detections: Detection[] = []
  const numClasses = 80
  const stride = 4 + numClasses // 84
  const numBoxes = 8400
  
  // Convert to array for easier manipulation
  const data = Array.from(output)
  
  // Determine output shape from provided shape or infer from data length
  let actualShape: number[] = shape || []
  let processedData: number[] = []
  
  // Check if we need to transpose based on shape
  if (actualShape.length === 3) {
    const [, dim1, dim2] = actualShape
    
    // Format [1, 84, 8400] - features first, boxes second (need transpose)
    if (dim1 === stride && dim2 === numBoxes) {
      // Transpose: [f0_b0, f0_b1, ..., f0_b8399, f1_b0, ...] -> [b0_f0, b0_f1, ..., b0_f83, b1_f0, ...]
      processedData = new Array(stride * numBoxes)
      for (let b = 0; b < numBoxes; b++) {
        for (let f = 0; f < stride; f++) {
          const srcIdx = f * numBoxes + b  // Source: feature f, box b
          const dstIdx = b * stride + f    // Destination: box b, feature f
          if (srcIdx < data.length && dstIdx < processedData.length) {
            processedData[dstIdx] = data[srcIdx]
          }
        }
      }
    } 
    // Format [1, 8400, 84] - boxes first, features second (already correct)
    else if (dim1 === numBoxes && dim2 === stride) {
      processedData = data
    }
    // Unknown format, try to infer
    else {
      // Try format [1, 84, 8400] by default
      if (data.length === stride * numBoxes) {
        processedData = new Array(stride * numBoxes)
        for (let b = 0; b < numBoxes; b++) {
          for (let f = 0; f < stride; f++) {
            const srcIdx = f * numBoxes + b
            const dstIdx = b * stride + f
            if (srcIdx < data.length && dstIdx < processedData.length) {
              processedData[dstIdx] = data[srcIdx]
            }
          }
        }
      } else {
        processedData = data
      }
    }
  } else {
    // No shape info, infer from data length
    if (data.length === stride * numBoxes) {
      // Likely [1, 84, 8400] format - transpose needed
      processedData = new Array(stride * numBoxes)
      for (let b = 0; b < numBoxes; b++) {
        for (let f = 0; f < stride; f++) {
          const srcIdx = f * numBoxes + b
          const dstIdx = b * stride + f
          if (srcIdx < data.length && dstIdx < processedData.length) {
            processedData[dstIdx] = data[srcIdx]
          }
        }
      }
    } else {
      // Likely [1, 8400, 84] format - already correct
      processedData = data
    }
  }
  
  // Now process boxes: [box0_feat0, box0_feat1, ..., box0_feat83, box1_feat0, ...]
  for (let i = 0; i < numBoxes; i++) {
    const offset = i * stride
    if (offset + stride > processedData.length) break
    
    // Extract box values
    let x_center_raw = processedData[offset + 0]
    let y_center_raw = processedData[offset + 1]
    let width_raw = processedData[offset + 2]
    let height_raw = processedData[offset + 3]
    
    // Find class with highest score
    // YOLOv8 output scores might need sigmoid normalization if in logit form
    let maxScore = 0
    let maxClassId = 0
    for (let c = 0; c < numClasses; c++) {
      let score = processedData[offset + 4 + c]
      
      // Apply sigmoid if confidence seems to be in logit form (values > 10 or < 0)
      if (Math.abs(score) > 10) {
        // Likely logits - apply sigmoid
        score = 1 / (1 + Math.exp(-score))
      } else if (score < 0) {
        // Negative values - apply sigmoid
        score = 1 / (1 + Math.exp(-score))
      }
      // Clamp to 0-1 range
      score = Math.max(0, Math.min(1, score))
      
      if (score > maxScore) {
        maxScore = score
        maxClassId = c
      }
    }
    
    // Apply confidence threshold - use different thresholds for different classes
    const isAnomalyClass = ANOMALY_CLASSES.has(maxClassId)
    let threshold: number
    if (maxClassId === 0) {
      threshold = PERSON_THRESHOLD  // Person needs higher confidence
    } else if (isAnomalyClass) {
      threshold = ANOMALY_THRESHOLD
    } else {
      threshold = CONFIDENCE_THRESHOLD
    }
    
    if (maxScore < threshold) continue
    
    // YOLOv8 outputs coordinates in normalized format (0-1) relative to input size (640x640)
    // But sometimes the output might have larger values if not properly normalized
    // We'll always treat them as normalized and clamp if needed
    
    let x_center_norm = x_center_raw
    let y_center_norm = y_center_raw
    let width_norm = width_raw
    let height_norm = height_raw
    
    // If coordinates are > 1, they might be in pixel format - normalize them
    // Check by looking at typical range - YOLO normalized coords should be 0-1
    if (Math.abs(x_center_raw) > 1 || Math.abs(y_center_raw) > 1 || 
        Math.abs(width_raw) > 1 || Math.abs(height_raw) > 1) {
      // Assume coordinates are in pixel format (0-640), normalize them
      x_center_norm = x_center_raw / 640
      y_center_norm = y_center_raw / 640
      width_norm = width_raw / 640
      height_norm = height_raw / 640
    }
    
    // Clamp normalized values to reasonable range (allow slight overflow)
    x_center_norm = Math.max(-0.1, Math.min(1.1, x_center_norm))
    y_center_norm = Math.max(-0.1, Math.min(1.1, y_center_norm))
    width_norm = Math.max(0.01, Math.min(2, width_norm))  // Allow boxes up to 2x image size
    height_norm = Math.max(0.01, Math.min(2, height_norm))
    
    // Further clamp to valid 0-1 range for calculation
    const x_center = Math.max(0, Math.min(1, x_center_norm))
    const y_center = Math.max(0, Math.min(1, y_center_norm))
    const width = Math.max(0.01, Math.min(1, width_norm))
    const height = Math.max(0.01, Math.min(1, height_norm))
    
    // Convert normalized coordinates (0-1 relative to 640x640 input) to pixel coordinates
    // First scale to 640x640 space, then scale to actual image size
    const scaleX = imgW / 640
    const scaleY = imgH / 640
    
    // Calculate pixel coordinates in 640x640 space first
    const x_center_640 = x_center * 640
    const y_center_640 = y_center * 640
    const width_640 = width * 640
    const height_640 = height * 640
    
    // Convert to actual image pixel coordinates
    const x_center_px = x_center_640 * scaleX
    const y_center_px = y_center_640 * scaleY
    const width_px = width_640 * scaleX
    const height_px = height_640 * scaleY
    
    // Convert from center+size format to top-left+size format
    const x = Math.max(0, x_center_px - width_px / 2)
    const y = Math.max(0, y_center_px - height_px / 2)
    const w = width_px
    const h = height_px
    
    // Validate box - only skip if completely invalid
    // Allow boxes that extend slightly outside image bounds
    if (w < 5 || h < 5 || x + w < -10 || y + h < -10 || x > imgW + 10 || y > imgH + 10) {
      continue
    }
    
    // Clamp box to image bounds
    const clampedX = Math.max(0, Math.min(imgW - 1, x))
    const clampedY = Math.max(0, Math.min(imgH - 1, y))
    const clampedW = Math.min(w, imgW - clampedX)
    const clampedH = Math.min(h, imgH - clampedY)
    
    let label = COCO_CLASSES[maxClassId] || `class_${maxClassId}`
    let isAnomaly = ANOMALY_CLASSES.has(maxClassId)
    let finalClassId = maxClassId
    let finalScore = maxScore
    
    // IMPORTANT: Validate person detections to reduce false positives
    // If detection is labeled as "person" but has characteristics of cellphone/object, verify
    if (label === 'person' && maxClassId === 0) {
      const aspectRatio = clampedW / clampedH
      const area = clampedW * clampedH
      const imgArea = imgW * imgH
      const relativeArea = area / imgArea
      
      // Cellphone characteristics: small area, tall aspect ratio (portrait)
      // Person characteristics: larger area, usually portrait but not extreme
      const isLikelyCellphone = relativeArea < 0.01 && aspectRatio < 0.5  // Very small and tall
      const isLikelyObject = relativeArea < 0.005  // Extremely small
      
      // Check if there's a better match in anomaly classes
      if (isLikelyCellphone || (isLikelyObject && maxScore < 0.5)) {
        // Re-check all classes for better match
        let bestAnomalyConf = 0
        let bestAnomalyClass = -1
        for (let c = 0; c < numClasses; c++) {
          if (ANOMALY_CLASSES.has(c)) {
            let conf = processedData[offset + 4 + c]
            if (Math.abs(conf) > 10) conf = 1 / (1 + Math.exp(-conf))
            else if (conf < 0) conf = 1 / (1 + Math.exp(-conf))
            conf = Math.max(0, Math.min(1, conf))
            
            if (conf > bestAnomalyConf && conf > ANOMALY_THRESHOLD) {
              bestAnomalyConf = conf
              bestAnomalyClass = c
            }
          }
        }
        
        // If anomaly class has higher or similar confidence, prefer it
        if (bestAnomalyClass >= 0 && bestAnomalyConf >= maxScore * 0.7) {
          // Use anomaly class instead
          label = COCO_CLASSES[bestAnomalyClass] || `class_${bestAnomalyClass}`
          finalClassId = bestAnomalyClass
          finalScore = bestAnomalyConf
          isAnomaly = true
        }
      }
    }
    
    // Only add if box is reasonably sized
    if (clampedW >= 5 && clampedH >= 5) {
      detections.push({
        bbox: [clampedX, clampedY, clampedW, clampedH],
        label,
        score: finalScore,
        classId: finalClassId,
        isAnomaly
      })
    }
  }
  
  // Apply Non-Maximum Suppression (NMS) to remove overlapping detections
  return applyNMS(detections, NMS_THRESHOLD)
}

function applyNMS(detections: Detection[], iouThreshold: number): Detection[] {
  // Sort by confidence (descending)
  const sorted = detections.sort((a, b) => b.score - a.score)
  const kept: Detection[] = []
  const suppressed = new Set<number>()
  
  for (let i = 0; i < sorted.length; i++) {
    if (suppressed.has(i)) continue
    
    kept.push(sorted[i])
    
    // Suppress boxes with high IoU
    for (let j = i + 1; j < sorted.length; j++) {
      if (suppressed.has(j)) continue
      
      const iou = calculateIoU(sorted[i].bbox, sorted[j].bbox)
      if (iou > iouThreshold) {
        suppressed.add(j)
      }
    }
  }
  
  return kept
}

function calculateIoU(box1: [number, number, number, number], box2: [number, number, number, number]): number {
  const [x1, y1, w1, h1] = box1
  const [x2, y2, w2, h2] = box2
  
  const x1Max = x1 + w1
  const y1Max = y1 + h1
  const x2Max = x2 + w2
  const y2Max = y2 + h2
  
  const xMin = Math.max(x1, x2)
  const yMin = Math.max(y1, y2)
  const xMax = Math.min(x1Max, x2Max)
  const yMax = Math.min(y1Max, y2Max)
  
  if (xMax <= xMin || yMax <= yMin) return 0
  
  const intersection = (xMax - xMin) * (yMax - yMin)
  const area1 = w1 * h1
  const area2 = w2 * h2
  const union = area1 + area2 - intersection
  
  return intersection / union
}

function cropLargestFace(canvas: HTMLCanvasElement, detections: Detection[]): HTMLCanvasElement | null {
  // Filter for person detections (face detection in YOLO is typically person)
  const persons = detections.filter((d) => d.label === 'person' || d.classId === 0)
  if (persons.length === 0) return null
  
  const largest = persons.reduce((a, b) => (area(b.bbox) > area(a.bbox) ? b : a))
  const [x, y, w, h] = largest.bbox
  
  // Crop with some padding for better face recognition
  const padding = 0.1
  const padX = w * padding
  const padY = h * padding
  
  const out = document.createElement('canvas')
  out.width = Math.max(1, Math.floor(w + padX * 2))
  out.height = Math.max(1, Math.floor(h + padY * 2))
  const ctx = out.getContext('2d') as CanvasRenderingContext2D
  
  ctx.drawImage(
    canvas,
    Math.max(0, Math.floor(x - padX)), 
    Math.max(0, Math.floor(y - padY)), 
    Math.floor(w + padX * 2), 
    Math.floor(h + padY * 2),
    0, 0, out.width, out.height
  )
  return out
}

function centerCrop(canvas: HTMLCanvasElement): HTMLCanvasElement {
  const side = Math.min(canvas.width, canvas.height)
  const sx = Math.floor((canvas.width - side) / 2)
  const sy = Math.floor((canvas.height - side) / 2)
  const out = document.createElement('canvas')
  out.width = side
  out.height = side
  const ctx = out.getContext('2d') as CanvasRenderingContext2D
  ctx.drawImage(canvas, sx, sy, side, side, 0, 0, side, side)
  return out
}

function area(b: [number, number, number, number]): number {
  return Math.max(0, b[2]) * Math.max(0, b[3])
}

function emit(payload: { 
  detections: Detection[]; 
  verified?: { score: number; match: boolean } | null;
  anomalies?: Detection[];
  faces?: Detection[];
}) {
  listeners.forEach((cb) => cb(payload))
}

function sleep(ms: number) { return new Promise((r) => setTimeout(r, ms)) }


