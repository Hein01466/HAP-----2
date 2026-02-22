import { diskStorage } from 'multer'
import { extname, join } from 'path'
import { mkdirSync } from 'fs'

type UploadOptions = {
  maxSize?: number
  mimeTypes?: string[]
}

export function uploadConfig(folder: string, options: UploadOptions = {}) {
  const { maxSize = 5 * 1024 * 1024, mimeTypes = ['image/jpeg', 'image/png', 'image/webp'] } =
    options
  return {
    storage: diskStorage({
      destination: (_req, _file, cb) => {
        const dest = join(process.cwd(), 'uploads', folder)
        mkdirSync(dest, { recursive: true })
        cb(null, dest)
      },
      filename: (_req, file, cb) => {
        const unique = `${Date.now()}-${Math.round(Math.random() * 1e9)}`
        cb(null, `${unique}${extname(file.originalname)}`)
      },
    }),
    limits: { fileSize: maxSize },
    fileFilter: (_req: unknown, file: Express.Multer.File, cb: (error: Error | null, accept: boolean) => void) => {
      if (!mimeTypes.includes(file.mimetype)) {
        cb(new Error('Invalid file type'), false)
        return
      }
      cb(null, true)
    },
  }
}
