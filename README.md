# Edge Proctor System

Edge-Optimized Online Exam Proctoring System with AI/ML

## Overview

Edge Proctor System is an advanced online exam proctoring solution designed specifically for edge devices with limited resources. It leverages cutting-edge computer vision and machine learning technologies to monitor exam sessions in real-time while maintaining high performance and low latency.

## Key Features

### 🤖 AI/ML Modules (Simplified)
- **YOLOv8n Detection**: Single model for face/person/objects (ONNX Runtime Web)
- **One-shot ID Verification**: pHash + color histogram against one enrollment photo
- **Whisper Detection**: WebAudio-based heuristic for low-volume speech

### ⚡ Performance Targets
- **Inference Time**: <50ms per frame
- **FPS**: >20 frames per second
- **Memory Usage**: <200MB
- **Model Size**: <50MB total
- **Load Time**: <5 seconds
- **False Positive Rate**: <7%

### 🛠️ Technical Stack
- **Frontend**: React 18 + TypeScript
- **Build Tool**: Vite
- **Styling**: Tailwind CSS
- **ML Runtime**: ONNX Runtime Web (WASM)
- **State Management**: Zustand
- **Storage**: localStorage / IndexedDB
- **PWA**: Workbox
- **Testing**: Vitest + Testing Library

## Project Structure

```
src/
├── components/           # React components
│   ├── layout/          # Layout components
│   ├── pages/           # Page components
│   └── ui/              # Reusable UI components
├── hooks/               # Custom React hooks
├── stores/              # Zustand stores
├── ml/                  # ML modules and analysis engine
├── utils/               # Utility functions
├── types/               # TypeScript type definitions
└── test/                # Test files
```

## Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd edge-proctor-system
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Start development server**
   ```bash
   npm run dev
   ```

4. **Build for production**
   ```bash
   npm run build
   ```

## Usage

### Starting an Exam

1. Navigate to the Setup page
2. Configure exam details (title, duration, description)
3. Enable/disable AI modules as needed
4. Set alert thresholds
5. Review settings and start the exam

### Proctoring Interface

The proctoring interface provides:
- Live video feed
- Real-time performance metrics
- Alert notifications
- System status indicators
- Exam timer

### Reports

After exam completion, view detailed reports including:
- Alert timeline
- Performance metrics
- Behavior analysis
- System statistics

## Configuration

### Camera Settings
- Resolution: 320x240 to 1920x1080
- Frame rate: 15-60 FPS
- Quality: 10-100%

### AI Module Settings
- Face detection confidence threshold
- Head pose deviation limits
- Eye gaze deviation thresholds
- Object detection confidence
- Behavior anomaly thresholds

### Alert Settings
- Browser notifications
- Sound alerts
- Email notifications
- Severity levels

## Models and Enrollment

- Place YOLOv8n ONNX model at `public/models/yolov8n.onnx` (optional to boot; detection no-ops if missing).
- Put your enrollment photo at `public/enrollment/Foto_Nathan.jpg` to auto-load from Settings, or upload manually on Settings → Security.
- Enrollment is saved locally under key `proctor:enrollment` (cropped PNG + pHash + histogram).

## API Reference

### ML Modules

#### FaceDetector
```typescript
const faceDetector = new FaceDetector()
await faceDetector.initialize()
const detections = await faceDetector.detectFaces(imageData)
```

#### HeadPoseEstimator
```typescript
const headPoseEstimator = new HeadPoseEstimator()
await headPoseEstimator.initialize()
const pose = await headPoseEstimator.estimateHeadPose(imageData, boundingBox)
```

#### ObjectDetector
```typescript
const objectDetector = new ObjectDetector()
await objectDetector.initialize()
const objects = await objectDetector.detectObjects(imageData)
```

### Hooks

#### useProctoring
```typescript
const {
  isActive,
  isAnalyzing,
  alerts,
  performanceMetrics,
  startProctoring,
  stopProctoring
} = useProctoring({
  exam,
  onAlert: (alert) => console.log(alert),
  onPerformanceUpdate: (metrics) => console.log(metrics)
})
```

#### useCamera
```typescript
const {
  isActive,
  devices,
  currentDevice,
  switchDevice,
  captureFrame
} = useCamera()
```

## Performance Optimization

### Model Optimization
- ONNX Runtime Web with WASM backend
- Model quantization and pruning
- Lazy loading of non-critical models
- Efficient memory management

### Rendering Optimization
- React.memo for expensive components
- Virtual scrolling for large lists
- Debounced state updates
- Optimized re-renders

### Memory Management
- Automatic cleanup of ML models
- Efficient tensor operations
- Garbage collection optimization
- Memory leak prevention

## Testing

### Unit Tests
```bash
npm run test
```

### Coverage Report
```bash
npm run test:coverage
```

### UI Tests
```bash
npm run test:ui
```

## Browser Compatibility

- **Chrome**: 90+
- **Edge**: 90+
- **Firefox**: 88+
- **Safari**: 14+

## Security & Privacy

- **Local Processing**: All video data processed locally
- **No Data Transmission**: Video streams never leave the device
- **Encryption**: AES-256 encryption for stored data
- **Compliance**: GDPR, FERPA compliant
- **Privacy**: No personal data collection

## Deployment

### PWA Deployment
1. Build the application
2. Deploy to web server
3. Configure HTTPS
4. Register service worker

### Edge Deployment
1. Package for edge runtime
2. Deploy to CDN
3. Configure caching
4. Monitor performance

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests
5. Submit a pull request

## License

MIT License - see LICENSE file for details

## Support

For support and questions:
- Create an issue on GitHub
- Check the documentation
- Review the FAQ section

## Roadmap

- [ ] Multi-language support
- [ ] Advanced analytics dashboard
- [ ] Mobile app support
- [ ] Cloud integration
- [ ] Advanced ML models
- [ ] Real-time collaboration
