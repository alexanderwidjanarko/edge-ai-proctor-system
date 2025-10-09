# Edge Proctor System - Quick Start

## Prerequisites
- Node.js 18+ 
- npm or yarn
- Modern browser with WebRTC support

## Installation

```bash
# Clone repository
git clone <repository-url>
cd edge-proctor-system

# Install dependencies
npm install

# Start development server
npm run dev
```

## Basic Usage

### 1. Start New Exam
```typescript
import { useProctoring } from '@hooks/useProctoring'

const { startProctoring, stopProctoring, isActive } = useProctoring({
  exam: {
    id: 'exam-123',
    title: 'Sample Exam',
    duration: 60,
    settings: {
      faceDetection: true,
      headPoseTracking: true,
      eyeGazeTracking: true,
      objectDetection: true,
      handObjectInteraction: true,
      temporalAnalysis: true,
      behaviorProfiling: true,
      alertThresholds: {
        faceDetectionConfidence: 0.5,
        headPoseDeviation: 30,
        eyeGazeDeviation: 0.5,
        objectDetectionConfidence: 0.5,
        suspiciousBehaviorScore: 0.7,
        temporalAnomalyThreshold: 0.6
      },
      recordingEnabled: true,
      audioEnabled: false
    }
  },
  onAlert: (alert) => console.log('Alert:', alert),
  onPerformanceUpdate: (metrics) => console.log('Performance:', metrics)
})

// Start proctoring
await startProctoring()
```

### 2. Monitor Performance
```typescript
import { usePerformanceMonitoring } from '@hooks/usePerformanceMonitoring'

const { performanceMetrics, recordInference } = usePerformanceMonitoring()

// Record inference time
recordInference(35.2) // ms

// Access metrics
console.log('FPS:', performanceMetrics.fps)
console.log('Memory:', performanceMetrics.memoryUsage)
```

### 3. Handle Alerts
```typescript
import { useAlerts } from '@hooks/useAlerts'

const { alerts, acknowledgeAlert, resolveAlert } = useAlerts()

// Acknowledge alert
acknowledgeAlert('alert-id')

// Resolve alert
resolveAlert('alert-id')
```

## Configuration

### Camera Settings
```typescript
import { useCamera } from '@hooks/useCamera'

const { switchDevice, updateSettings } = useCamera()

// Switch camera device
await switchDevice('device-id')

// Update camera settings
await updateSettings({
  resolution: '1280x720',
  frameRate: 30,
  quality: 0.8
})
```

### ML Model Configuration
```typescript
import { modelManager } from '@ml/modelManager'

// Load specific model
await modelManager.loadModel('blazeface')

// Get loaded models
const loadedModels = modelManager.getLoadedModels()
```

## Performance Optimization

### Enable Debug Mode
```typescript
// Set environment variable
process.env.NODE_ENV = 'development'

// Enable performance monitoring
import { startPerformanceMonitoring } from '@utils/performanceUtils'
startPerformanceMonitoring()
```

### Memory Management
```typescript
// Cleanup models when done
import { cleanupModels } from '@ml/modelManager'
await cleanupModels()

// Cleanup camera
import { cleanupCamera } from '@utils/cameraUtils'
await cleanupCamera()
```

## Testing

```bash
# Run tests
npm run test

# Run tests with coverage
npm run test:coverage

# Run tests in UI mode
npm run test:ui
```

## Building for Production

```bash
# Build application
npm run build

# Preview production build
npm run preview
```

## Troubleshooting

### Camera Issues
- Check browser permissions
- Verify camera is not in use by other applications
- Test with different browsers

### Performance Issues
- Monitor memory usage in browser dev tools
- Check if hardware acceleration is enabled
- Verify WebAssembly support

### ML Model Issues
- Check ONNX Runtime Web compatibility
- Verify model files are accessible
- Monitor inference times

## Support

For issues and questions:
- Check the documentation
- Review the troubleshooting guide
- Create an issue on GitHub
