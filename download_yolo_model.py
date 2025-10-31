#!/usr/bin/env python3
"""
Script to download and convert YOLOv8n to ONNX format
"""

import os
import sys
from pathlib import Path

def download_yolo_onnx():
    """Download YOLOv8n ONNX model using ultralytics"""
    try:
        print("📥 Installing/updating ultralytics...")
        os.system(f"{sys.executable} -m pip install --upgrade ultralytics --quiet")
        
        print("🔄 Downloading and converting YOLOv8n to ONNX...")
        from ultralytics import YOLO
        
        # Download YOLOv8n (will auto-download if not exists)
        model = YOLO('yolov8n.pt')
        print(f"✅ YOLOv8n PyTorch model loaded")
        
        # Export to ONNX
        print("🔄 Converting to ONNX format...")
        model.export(format='onnx', imgsz=640, simplify=True, dynamic=False)
        print("✅ ONNX export completed")
        
        # Find the exported ONNX file
        onnx_file = Path('yolov8n.onnx')
        if not onnx_file.exists():
            # Try in runs directory
            runs_dir = Path('runs')
            if runs_dir.exists():
                for path in runs_dir.rglob('yolov8n.onnx'):
                    onnx_file = path
                    break
        
        if not onnx_file.exists():
            raise FileNotFoundError("ONNX file not found after export")
        
        # Copy to public/models/
        target_dir = Path('public/models')
        target_dir.mkdir(parents=True, exist_ok=True)
        
        target_file = target_dir / 'yolov8n.onnx'
        
        print(f"📋 Copying {onnx_file} to {target_file}...")
        import shutil
        shutil.copy2(onnx_file, target_file)
        
        file_size = target_file.stat().st_size / (1024 * 1024)
        print(f"✅ YOLOv8n ONNX model saved to: {target_file}")
        print(f"   File size: {file_size:.2f} MB")
        
        return True
        
    except ImportError:
        print("❌ ultralytics not installed. Installing...")
        os.system(f"{sys.executable} -m pip install ultralytics")
        return download_yolo_onnx()
    except Exception as e:
        print(f"❌ Error: {e}")
        return False

if __name__ == '__main__':
    print("=" * 60)
    print("YOLOv8n ONNX Model Downloader")
    print("=" * 60)
    print()
    
    success = download_yolo_onnx()
    
    if success:
        print()
        print("=" * 60)
        print("✅ SUCCESS! Model ready at: public/models/yolov8n.onnx")
        print("=" * 60)
    else:
        print()
        print("=" * 60)
        print("❌ FAILED! Please check the error above")
        print("=" * 60)
        sys.exit(1)

