# Edge Proctor System
Edge-Optimized Online Exam Proctoring System with AI/ML
## Overview

Edge Proctor System is an advanced online exam proctoring solution designed specifically for edge devices with limited resources. It leverages cutting-edge computer vision and machine learning technologies to monitor exam sessions in real-time while maintaining high performance and low latency.

## Key Features

### 🤖 AI/ML Modules
- **YOLOv8n Detection**: High-accuracy object detection model (ONNX Runtime Web)
  - Default model for accurate detection
  - Supports person, cell phone, laptop, and 80 COCO classes
  - Model size: ~6MB ONNX format
  - Inference time: ~30-100ms per frame
- **COCO SSD Detection**: Fast alternative model (TensorFlow.js)
  - Faster inference for real-time applications
  - Model size: ~28MB (browser-cached)
  - Inference time: ~50-200ms per frame
  - Supports same object classes as YOLO
- **One-shot ID Verification**: pHash + color histogram against one enrollment photo
  - Face recognition for identity verification
  - Enrollment stored locally in IndexedDB
- **Whisper Detection**: WebAudio-based heuristic for low-volume speech
  - Real-time audio monitoring
  - Suspicious activity detection

### ⚡ Performance Monitoring
- **Real-time Metrics Dashboard**:
  - Inference Time: Live tracking with line chart
  - FPS: Frame rate monitoring with visualization
  - CPU Usage: Performance tracking with trends
- **Performance Testing Mode**:
  - Automated comparison between YOLOv8n and COCO SSD
  - Time-series data collection (1 data point per second)
  - CSV export for research analysis
  - Automatic model switching (1 minute YOLO → 1 minute COCO)
  - Total testing duration: 2 minutes (120 data points per model)

### 📊 Performance Targets
- **Inference Time**: <100ms per frame (YOLO), <200ms per frame (COCO)
- **FPS**: >10 frames per second
- **CPU Usage**: Optimized for edge devices
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
3. Select detection model (YOLOv8n or COCO SSD)
4. Enable/disable AI modules as needed
5. Set alert thresholds
6. Review settings and start the exam

### Proctoring Interface

The proctoring interface provides:
- Live video feed with real-time object detection
- Boundary boxes for detected objects (person, cell phone, laptop, etc.)
- Real-time performance metrics with live charts:
  - Inference Time trend (line chart)
  - FPS trend (line chart)
  - CPU Usage trend (line chart)
- Alert notifications
- System status indicators
- Exam timer

### Performance Testing Mode

For research and model comparison:

1. **Start Testing**:
   - Click "Start Testing" button in Performance Testing Mode card
   - System automatically starts with YOLOv8n model
   - Records data every 1 second

2. **Automatic Model Switch**:
   - After 1 minute, system switches to COCO SSD automatically
   - Continues recording for another minute
   - Total duration: 2 minutes

3. **Data Collection**:
   - Each data point contains:
     - Timestamp (ISO format)
     - Elapsed seconds from start
     - Inference time (ms)
     - Average inference time (ms)
     - FPS
     - CPU usage (%)

4. **CSV Export**:
   - Two CSV files automatically generated:
     - `yolo_performance_[timestamp].csv`: YOLOv8n data (~60 data points)
     - `coco_performance_[timestamp].csv`: COCO SSD data (~60 data points)
   - Files automatically downloaded when testing completes

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

### Detection Models

**YOLOv8n (Default)**:
- Location: `public/models/yolov8n.onnx`
- Format: ONNX Runtime Web
- Size: ~6MB
- Auto-loads on page initialization
- Supports 80 COCO classes
- Optimized for accuracy

**COCO SSD**:
- Source: TensorFlow.js CDN (auto-download)
- Format: TensorFlow.js model
- Size: ~28MB (browser-cached)
- Alternative faster model
- Supports same COCO classes

### Model Selection

- Switch between models using UI buttons:
  - "YOLOv8n (Akurat)": For high-accuracy detection
  - "COCO SSD (Cepat)": For faster real-time detection
- Model state persists during session
- Both models support same detection classes

### Enrollment

- Put enrollment photo at `public/enrollment/Foto_Nathan.jpg` to auto-load
- Or upload manually on Settings → Security
- Enrollment is saved locally under key `proctor:enrollment`:
  - Cropped face PNG
  - pHash for face matching
  - Color histogram for verification

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
