# Performance Testing Mode Documentation

## Overview

The Performance Testing Mode is a comprehensive benchmarking system designed to evaluate and compare the performance of different object detection models (YOLOv8n and COCO SSD) under controlled conditions. This system enables researchers to collect empirical data for academic research and system optimization.

## Testing Protocol

### Test Configuration

- **Duration**: 2 minutes total
  - First minute: YOLOv8n model testing
  - Second minute: COCO SSD model testing
- **Sampling Rate**: 1 data point per second
- **Expected Data Points**: ~60 per model (~120 total)
- **Automatic Model Switching**: Yes (after 1 minute)

### Data Collection

The system records the following metrics at 1-second intervals:

1. **Timestamp**: ISO 8601 format timestamp for precise time reference
2. **Elapsed Seconds**: Time elapsed from test start (for relative time analysis)
3. **Inference Time (ms)**: Last recorded inference time per frame
4. **Average Inference Time (ms)**: Rolling average of inference times
5. **FPS**: Frames processed per second
6. **CPU Usage (%)**: Percentage of CPU utilization

### CSV Output Format

#### File Structure

**File 1: `yolo_performance_[timestamp].csv`**
```
timestamp,elapsed_seconds,inference_time_ms,avg_inference_time_ms,fps,cpu_usage_percent
2024-01-15T10:00:00.000Z,0,35.2,35.2,10,45.5
2024-01-15T10:00:01.000Z,1,38.1,36.65,10,47.2
...
```

**File 2: `coco_performance_[timestamp].csv`**
```
timestamp,elapsed_seconds,inference_time_ms,avg_inference_time_ms,fps,cpu_usage_percent
2024-01-15T10:01:00.000Z,60,85.3,85.3,8,52.1
2024-01-15T10:01:01.000Z,61,92.4,88.85,8,53.8
...
```

#### Column Descriptions

- **timestamp**: ISO 8601 timestamp (e.g., "2024-01-15T10:00:00.000Z")
- **elapsed_seconds**: Integer seconds from test start
- **inference_time_ms**: Float value, milliseconds (2 decimal places)
- **avg_inference_time_ms**: Float value, rolling average (2 decimal places)
- **fps**: Integer, frames per second
- **cpu_usage_percent**: Float value, percentage (2 decimal places)

## Usage Instructions

### Starting a Test

1. Ensure camera is accessible (permission granted)
2. Click "Start Testing" button in Performance Testing Mode card
3. System will:
   - Auto-start camera if not running
   - Load YOLOv8n model if not loaded
   - Begin recording data every second
   - Display real-time status updates

### During Testing

- **Status Display**:
  - Current status (Testing...)
  - Active model (YOLOv8n → COCO SSD)
  - Elapsed time (minutes:seconds)
  - Total data points collected

- **Real-time Monitoring**:
  - Performance charts update in real-time
  - Metrics display current values
  - System continues normal detection operations

### Model Switch (Automatic)

- At 1 minute mark:
  - System logs switch event
  - Stops current detection loop
  - Switches to COCO SSD model
  - Resumes detection automatically
  - Continues data collection

### Test Completion

- After 2 minutes:
  - Test automatically stops
  - Status changes to "Completed"
  - CSV files are generated
  - Files automatically download:
    - `yolo_performance_[timestamp].csv`
    - `coco_performance_[timestamp].csv`
  - Alert notification confirms completion

### Manual Stop

- Click "Stop Testing" button anytime
- Current data is preserved
- CSV files generated from collected data
- Test can be restarted for new session

## Research Applications

### Comparative Analysis

The CSV data enables researchers to:

1. **Performance Comparison**:
   - Compare inference times between models
   - Analyze FPS differences
   - Evaluate CPU utilization patterns

2. **Statistical Analysis**:
   - Calculate mean, median, standard deviation
   - Identify performance outliers
   - Analyze temporal patterns

3. **Visualization**:
   - Time-series plots
   - Distribution histograms
   - Correlation analysis

4. **Model Selection**:
   - Data-driven model selection
   - Trade-off analysis (accuracy vs speed)
   - Resource optimization

### Data Analysis Example

```python
import pandas as pd
import matplotlib.pyplot as plt

# Load data
yolo_data = pd.read_csv('yolo_performance_*.csv')
coco_data = pd.read_csv('coco_performance_*.csv')

# Compare average inference time
yolo_avg = yolo_data['inference_time_ms'].mean()
coco_avg = coco_data['inference_time_ms'].mean()

print(f"YOLO Average: {yolo_avg:.2f}ms")
print(f"COCO Average: {coco_avg:.2f}ms")
print(f"Speed Improvement: {(coco_avg/yolo_avg - 1)*100:.1f}%")

# Plot comparison
plt.figure(figsize=(12, 6))
plt.plot(yolo_data['elapsed_seconds'], yolo_data['inference_time_ms'], label='YOLOv8n')
plt.plot(coco_data['elapsed_seconds'], coco_data['inference_time_ms'], label='COCO SSD')
plt.xlabel('Elapsed Time (seconds)')
plt.ylabel('Inference Time (ms)')
plt.title('Inference Time Comparison')
plt.legend()
plt.grid(True)
plt.show()
```

## Technical Specifications

### System Requirements

- **Browser**: Chrome 90+, Edge 90+, Firefox 88+, Safari 14+
- **WebRTC**: Required for camera access
- **IndexedDB**: For model caching
- **WebAssembly**: For ONNX Runtime
- **Hardware**: Camera device with minimum 640x480 resolution

### Performance Characteristics

#### YOLOv8n Model
- **Inference Time**: 30-100ms (typical: 35-50ms)
- **FPS**: 10-20 fps
- **CPU Usage**: 40-60% (typical)
- **Accuracy**: High (90%+ on COCO dataset)

#### COCO SSD Model
- **Inference Time**: 50-200ms (typical: 80-120ms)
- **FPS**: 5-15 fps
- **CPU Usage**: 45-65% (typical)
- **Accuracy**: Good (85%+ on COCO dataset)

### Data Collection Accuracy

- **Temporal Resolution**: 1 second (1000ms intervals)
- **Inference Time Precision**: 0.01ms (2 decimal places)
- **FPS Precision**: Integer values
- **CPU Usage Precision**: 0.01% (2 decimal places)
- **Timestamp Precision**: Millisecond-level (ISO 8601)

## Limitations and Considerations

### Environmental Factors

1. **Hardware Variation**:
   - Performance varies by device CPU/GPU
   - Results are device-specific
   - Multi-device testing recommended

2. **Browser Differences**:
   - Performance varies across browsers
   - Consistent browser recommended for comparison

3. **System Load**:
   - Background processes affect metrics
   - Isolated testing environment recommended

### Data Quality

1. **Outlier Detection**:
   - Initial data points may show load spikes
   - Consider removing first 5 seconds for analysis

2. **Missing Data**:
   - Network latency may cause gaps
   - System continues recording despite temporary issues

3. **Model Warmup**:
   - First few inferences may be slower
   - Warmup period (~10 seconds) before analysis

## Best Practices

### For Research

1. **Multiple Runs**:
   - Conduct 3-5 test runs
   - Calculate average metrics
   - Report standard deviations

2. **Controlled Environment**:
   - Close unnecessary applications
   - Use consistent browser version
   - Test on same hardware

3. **Data Validation**:
   - Check for anomalies in CSV
   - Verify data point counts
   - Validate timestamp sequences

### For Development

1. **Regular Testing**:
   - Test after code changes
   - Monitor performance regressions
   - Track optimization improvements

2. **Baseline Establishment**:
   - Establish performance baselines
   - Set performance targets
   - Monitor trends over time

## Troubleshooting

### Test Not Starting

- Check camera permissions
- Verify model files are accessible
- Check browser console for errors

### Model Switch Failing

- Verify both models are available
- Check network connection (for COCO SSD)
- Review console logs for errors

### CSV Not Generating

- Verify test completed successfully
- Check browser download permissions
- Review console for error messages

## Future Enhancements

- [ ] Configurable test duration
- [ ] Multiple model testing in single session
- [ ] Real-time CSV streaming
- [ ] Statistical analysis dashboard
- [ ] Export to other formats (JSON, Excel)
- [ ] Batch testing automation
- [ ] Performance regression detection

## Citation

When using this testing system in academic research, please cite:

```
Edge Proctor System - Performance Testing Mode
Automated Object Detection Model Comparison
Real-time Performance Metrics Collection
```

## Contact

For questions or contributions regarding the Performance Testing Mode, please refer to the main project documentation or open an issue on the project repository.

