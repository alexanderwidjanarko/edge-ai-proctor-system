import { enrollFromCanvas } from '@utils/verificationUtils'

export async function enrollFromPublicPath(publicPath: string): Promise<void> {
  const img = new Image()
  img.crossOrigin = 'anonymous'
  const loaded: HTMLImageElement = await new Promise((resolve, reject) => {
    img.onload = () => resolve(img)
    img.onerror = reject
    img.src = publicPath
  })
  const size = 256
  const canvas = document.createElement('canvas')
  canvas.width = size
  canvas.height = size
  const ctx = canvas.getContext('2d') as CanvasRenderingContext2D
  const minSide = Math.min(loaded.naturalWidth, loaded.naturalHeight)
  const sx = (loaded.naturalWidth - minSide) / 2
  const sy = (loaded.naturalHeight - minSide) / 2
  ctx.drawImage(loaded, sx, sy, minSide, minSide, 0, 0, size, size)
  await enrollFromCanvas(canvas)
}


