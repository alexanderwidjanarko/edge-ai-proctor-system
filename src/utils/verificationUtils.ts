/*
  One-shot verification using classical features (no extra ML):
  - pHash (DCT-based perceptual hash)
  - RGB histogram (normalized)
  Stores enrollment in localStorage under key 'proctor:enrollment'
*/

export interface EnrollmentData {
  imageDataUrl: string
  pHash: string
  histogram: number[]
  displayName?: string
}

const ENROLL_KEY = 'proctor:enrollment'

export function saveEnrollment(data: EnrollmentData): void {
  localStorage.setItem(ENROLL_KEY, JSON.stringify(data))
}

export function loadEnrollment(): EnrollmentData | null {
  const raw = localStorage.getItem(ENROLL_KEY)
  if (!raw) return null
  try {
    return JSON.parse(raw)
  } catch {
    return null
  }
}

export async function enrollFromCanvas(faceCanvas: HTMLCanvasElement): Promise<EnrollmentData> {
  const pHash = await computePHash(faceCanvas)
  const histogram = computeRgbHistogram(faceCanvas)
  const imageDataUrl = faceCanvas.toDataURL('image/png')
  const data = { imageDataUrl, pHash, histogram }
  saveEnrollment(data)
  return data
}

export async function verifyOneShot(faceCanvas: HTMLCanvasElement, threshold = 0.78): Promise<{ score: number; match: boolean } | null> {
  const enrolled = loadEnrollment()
  if (!enrolled) return null
  const pHash = await computePHash(faceCanvas)
  const histogram = computeRgbHistogram(faceCanvas)
  const pHashSim = 1 - hammingDistance(enrolled.pHash, pHash) / enrolled.pHash.length
  const histSim = cosineSimilarity(enrolled.histogram, histogram)
  const score = 0.6 * pHashSim + 0.4 * histSim
  return { score, match: score >= threshold }
}

async function computePHash(canvas: HTMLCanvasElement): Promise<string> {
  const size = 32
  const small = document.createElement('canvas')
  small.width = size
  small.height = size
  const ctx = small.getContext('2d') as CanvasRenderingContext2D
  ctx.drawImage(canvas, 0, 0, size, size)
  const img = ctx.getImageData(0, 0, size, size)
  const gray = new Float32Array(size * size)
  for (let i = 0; i < img.data.length; i += 4) {
    const r = img.data[i]
    const g = img.data[i + 1]
    const b = img.data[i + 2]
    gray[i / 4] = 0.299 * r + 0.587 * g + 0.114 * b
  }
  const dct = dct2(gray, size)
  // top-left 8x8 without DC
  const sub = [] as number[]
  for (let y = 0; y < 8; y++) {
    for (let x = 0; x < 8; x++) {
      if (x === 0 && y === 0) continue
      sub.push(dct[y * size + x])
    }
  }
  const median = medianValue(sub)
  let hash = ''
  for (const v of sub) hash += v > median ? '1' : '0'
  return hash
}

function computeRgbHistogram(canvas: HTMLCanvasElement): number[] {
  const bins = 16
  const ctx = canvas.getContext('2d') as CanvasRenderingContext2D
  const img = ctx.getImageData(0, 0, canvas.width, canvas.height)
  const hist = new Array(bins * 3).fill(0)
  for (let i = 0; i < img.data.length; i += 4) {
    const r = img.data[i]
    const g = img.data[i + 1]
    const b = img.data[i + 2]
    hist[(r * bins) >>> 8]++
    hist[bins + ((g * bins) >>> 8)]++
    hist[2 * bins + ((b * bins) >>> 8)]++
  }
  const sum = hist.reduce((a, b) => a + b, 0) || 1
  return hist.map((v) => v / sum)
}

function hammingDistance(a: string, b: string): number {
  const len = Math.min(a.length, b.length)
  let d = 0
  for (let i = 0; i < len; i++) if (a[i] !== b[i]) d++
  d += Math.abs(a.length - b.length)
  return d
}

function cosineSimilarity(a: number[], b: number[]): number {
  const len = Math.min(a.length, b.length)
  let dot = 0, na = 0, nb = 0
  for (let i = 0; i < len; i++) {
    dot += a[i] * b[i]
    na += a[i] * a[i]
    nb += b[i] * b[i]
  }
  return dot / (Math.sqrt(na) * Math.sqrt(nb) || 1)
}

function medianValue(arr: number[]): number {
  const tmp = arr.slice().sort((x, y) => x - y)
  const mid = Math.floor(tmp.length / 2)
  return tmp.length % 2 ? tmp[mid] : (tmp[mid - 1] + tmp[mid]) / 2
}

function dct2(input: Float32Array, size: number): Float32Array {
  const output = new Float32Array(size * size)
  const c: number[] = []
  for (let i = 0; i < size; i++) c[i] = i === 0 ? 1 / Math.sqrt(2) : 1
  for (let u = 0; u < size; u++) {
    for (let v = 0; v < size; v++) {
      let sum = 0
      for (let x = 0; x < size; x++) {
        for (let y = 0; y < size; y++) {
          sum += input[y * size + x] * Math.cos(((2 * x + 1) * u * Math.PI) / (2 * size)) * Math.cos(((2 * y + 1) * v * Math.PI) / (2 * size))
        }
      }
      output[v * size + u] = 0.25 * c[u] * c[v] * sum
    }
  }
  return output
}


