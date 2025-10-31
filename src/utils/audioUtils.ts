/*
  WebAudio-based VAD and whisper detector (low-amplitude speech-range energy)
*/

type WhisperCallback = (event: { timestamp: number; level: number }) => void

let audioContext: AudioContext | null = null
let mediaStream: MediaStream | null = null
let sourceNode: MediaStreamAudioSourceNode | null = null
let analyser: AnalyserNode | null = null
let jsNode: ScriptProcessorNode | null = null
let running = false
let onWhisper: WhisperCallback | null = null

export async function startAudioMonitoring(cb?: WhisperCallback): Promise<void> {
  if (running) return
  onWhisper = cb || null
  audioContext = new (window.AudioContext || (window as any).webkitAudioContext)()
  mediaStream = await navigator.mediaDevices.getUserMedia({ audio: true, video: false })
  sourceNode = audioContext.createMediaStreamSource(mediaStream)
  analyser = audioContext.createAnalyser()
  analyser.fftSize = 2048
  const bufferSize = 2048
  jsNode = audioContext.createScriptProcessor(bufferSize, 1, 1)

  sourceNode.connect(analyser)
  analyser.connect(jsNode)
  jsNode.connect(audioContext.destination)

  running = true

  const freqData = new Uint8Array(analyser.frequencyBinCount)
  const minSpeechHz = 300
  const maxSpeechHz = 3000

  jsNode.onaudioprocess = () => {
    if (!analyser || !running) return
    analyser.getByteFrequencyData(freqData)
    const nyquist = (audioContext as AudioContext).sampleRate / 2
    const binSize = nyquist / freqData.length

    let speechBandEnergy = 0
    let totalEnergy = 0

    for (let i = 0; i < freqData.length; i++) {
      const freq = i * binSize
      const v = freqData[i]
      totalEnergy += v
      if (freq >= minSpeechHz && freq <= maxSpeechHz) speechBandEnergy += v
    }

    const bandRatio = totalEnergy > 0 ? speechBandEnergy / totalEnergy : 0
    const level = totalEnergy / freqData.length / 255 // 0..1

    // Heuristic: whisper if speech band is prominent but level is low
    if (bandRatio > 0.45 && level > 0.02 && level < 0.12) {
      onWhisper?.({ timestamp: Date.now(), level })
    }
  }
}

export function stopAudioMonitoring(): void {
  running = false
  if (jsNode) {
    jsNode.disconnect()
    jsNode.onaudioprocess = null
    jsNode = null
  }
  if (analyser) {
    analyser.disconnect()
    analyser = null
  }
  if (sourceNode) {
    sourceNode.disconnect()
    sourceNode = null
  }
  if (mediaStream) {
    mediaStream.getTracks().forEach((t) => t.stop())
    mediaStream = null
  }
  if (audioContext) {
    audioContext.close()
    audioContext = null
  }
}


