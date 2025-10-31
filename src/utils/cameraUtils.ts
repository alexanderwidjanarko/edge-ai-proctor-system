/*
  Camera utilities: start/stop camera stream and capture frames to canvas
*/

let currentStream: MediaStream | null = null
let videoElement: HTMLVideoElement | null = null

export async function initializeCamera(constraints: MediaStreamConstraints = { video: { facingMode: 'user' }, audio: false }): Promise<HTMLVideoElement> {
  if (currentStream) return ensureVideoElement()
  const stream = await navigator.mediaDevices.getUserMedia(constraints)
  currentStream = stream
  const video = ensureVideoElement()
  video.srcObject = stream
  await video.play()
  return video
}

export function cleanupCamera(): void {
  if (currentStream) {
    currentStream.getTracks().forEach((t) => t.stop())
    currentStream = null
  }
  if (videoElement) {
    videoElement.srcObject = null
  }
}

export async function getAvailableDevices(): Promise<MediaDeviceInfo[]> {
  const devices = await navigator.mediaDevices.enumerateDevices()
  return devices.filter((d) => d.kind === 'videoinput')
}

export async function switchCameraDevice(deviceId: string): Promise<void> {
  cleanupCamera()
  await initializeCamera({ video: { deviceId }, audio: false })
}

export async function getCurrentFrame(): Promise<HTMLCanvasElement | null> {
  if (!videoElement || videoElement.readyState < 2) return null
  const canvas = document.createElement('canvas')
  canvas.width = videoElement.videoWidth
  canvas.height = videoElement.videoHeight
  const ctx = canvas.getContext('2d')
  if (!ctx) return null
  ctx.drawImage(videoElement, 0, 0, canvas.width, canvas.height)
  return canvas
}

function ensureVideoElement(): HTMLVideoElement {
  if (videoElement) return videoElement
  videoElement = document.createElement('video')
  videoElement.setAttribute('playsinline', 'true')
  videoElement.muted = true
  return videoElement
}

export function getVideoElement(): HTMLVideoElement | null {
  return videoElement
}


