import { Request, Response, NextFunction } from 'express'
import { z } from 'zod'
import multer from 'multer'
import { Client } from 'minio'
import path from 'path'
import { v4 as uuidv4 } from 'uuid'
import sharp from 'sharp'
import { AuthenticatedRequest } from '../middleware/auth'
import { ApiError } from '../utils/api-error'
import { logger } from '../utils/logger'
import { env } from '../config/env'

// MinIO client configuration
const minioClient = new Client({
  endPoint: env.MINIO_ENDPOINT,
  port: env.MINIO_PORT,
  useSSL: env.MINIO_USE_SSL,
  accessKey: env.MINIO_ACCESS_KEY,
  secretKey: env.MINIO_SECRET_KEY,
})

// Multer configuration for memory storage
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB
    files: 10, // Maximum 10 files
  },
  fileFilter: (req, file, cb) => {
    // Check file type
    const allowedMimes = [
      'image/jpeg',
      'image/jpg',
      'image/png',
      'image/webp',
      'image/gif',
      'application/pdf',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    ]

    if (allowedMimes.includes(file.mimetype)) {
      cb(null, true)
    } else {
      cb(new ApiError(400, 'نوع فایل مجاز نیست'))
    }
  }
})

interface UploadedFile {
  id: string
  filename: string
  originalName: string
  mimeType: string
  size: number
  url: string
  thumbnailUrl?: string
  createdAt: Date
}

export class UploadController {
  // Initialize MinIO bucket
  static async initializeBucket() {
    try {
      const bucketExists = await minioClient.bucketExists(env.MINIO_BUCKET_NAME)
      
      if (!bucketExists) {
        await minioClient.makeBucket(env.MINIO_BUCKET_NAME, 'us-east-1')
        logger.info('MinIO bucket created', { bucket: env.MINIO_BUCKET_NAME })
      }

      // Set bucket policy for public read access to images
      const policy = {
        Version: '2012-10-17',
        Statement: [
          {
            Effect: 'Allow',
            Principal: { AWS: ['*'] },
            Action: ['s3:GetObject'],
            Resource: [`arn:aws:s3:::${env.MINIO_BUCKET_NAME}/images/*`],
          },
        ],
      }

      await minioClient.setBucketPolicy(env.MINIO_BUCKET_NAME, JSON.stringify(policy))
      logger.info('MinIO bucket policy set')

    } catch (error) {
      logger.error('Failed to initialize MinIO bucket', error)
      throw error
    }
  }

  // Upload single file
  static uploadSingle = upload.single('file')

  static async uploadFile(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      if (!req.file) {
        throw new ApiError(400, 'فایل انتخاب نشده است')
      }

      const file = req.file
      const userId = req.user!.id
      const fileType = req.body.type || 'image'

      // Generate unique filename
      const fileExtension = path.extname(file.originalname)
      const filename = `${uuidv4()}${fileExtension}`
      const filePath = `${fileType}s/${filename}`

      let processedBuffer = file.buffer
      let thumbnailBuffer: Buffer | null = null

      // Process image files
      if (file.mimetype.startsWith('image/')) {
        // Optimize image
        processedBuffer = await sharp(file.buffer)
          .resize(1920, 1080, { 
            fit: 'inside', 
            withoutEnlargement: true 
          })
          .jpeg({ 
            quality: 85,
            progressive: true 
          })
          .toBuffer()

        // Generate thumbnail
        thumbnailBuffer = await sharp(file.buffer)
          .resize(300, 300, { 
            fit: 'cover' 
          })
          .jpeg({ 
            quality: 80 
          })
          .toBuffer()
      }

      // Upload main file to MinIO
      await minioClient.putObject(
        env.MINIO_BUCKET_NAME,
        filePath,
        processedBuffer,
        processedBuffer.length,
        {
          'Content-Type': file.mimetype,
          'Content-Disposition': `inline; filename="${file.originalname}"`,
        }
      )

      // Upload thumbnail if exists
      let thumbnailPath: string | null = null
      if (thumbnailBuffer) {
        thumbnailPath = `thumbnails/${filename}`
        await minioClient.putObject(
          env.MINIO_BUCKET_NAME,
          thumbnailPath,
          thumbnailBuffer,
          thumbnailBuffer.length,
          {
            'Content-Type': 'image/jpeg',
          }
        )
      }

      // Generate URLs
      const fileUrl = `${env.MINIO_USE_SSL ? 'https' : 'http'}://${env.MINIO_ENDPOINT}:${env.MINIO_PORT}/${env.MINIO_BUCKET_NAME}/${filePath}`
      const thumbnailUrl = thumbnailPath 
        ? `${env.MINIO_USE_SSL ? 'https' : 'http'}://${env.MINIO_ENDPOINT}:${env.MINIO_PORT}/${env.MINIO_BUCKET_NAME}/${thumbnailPath}`
        : undefined

      const uploadedFile: UploadedFile = {
        id: uuidv4(),
        filename,
        originalName: file.originalname,
        mimeType: file.mimetype,
        size: processedBuffer.length,
        url: fileUrl,
        thumbnailUrl,
        createdAt: new Date(),
      }

      logger.info('File uploaded', {
        fileId: uploadedFile.id,
        filename: uploadedFile.filename,
        size: uploadedFile.size,
        userId
      })

      res.status(201).json({
        message: 'فایل با موفقیت آپلود شد',
        data: uploadedFile
      })

    } catch (error) {
      next(error)
    }
  }

  // Upload multiple files
  static uploadMultiple = upload.array('files', 10)

  static async uploadFiles(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const files = req.files as Express.Multer.File[]
      
      if (!files || files.length === 0) {
        throw new ApiError(400, 'فایل انتخاب نشده است')
      }

      const userId = req.user!.id
      const fileType = req.body.type || 'image'

      const uploadedFiles: UploadedFile[] = []
      const failedFiles: { filename: string; error: string }[] = []

      // Process each file
      for (const file of files) {
        try {
          // Generate unique filename
          const fileExtension = path.extname(file.originalname)
          const filename = `${uuidv4()}${fileExtension}`
          const filePath = `${fileType}s/${filename}`

          let processedBuffer = file.buffer
          let thumbnailBuffer: Buffer | null = null

          // Process image files
          if (file.mimetype.startsWith('image/')) {
            // Optimize image
            processedBuffer = await sharp(file.buffer)
              .resize(1920, 1080, { 
                fit: 'inside', 
                withoutEnlargement: true 
              })
              .jpeg({ 
                quality: 85,
                progressive: true 
              })
              .toBuffer()

            // Generate thumbnail
            thumbnailBuffer = await sharp(file.buffer)
              .resize(300, 300, { 
                fit: 'cover' 
              })
              .jpeg({ 
                quality: 80 
              })
              .toBuffer()
          }

          // Upload main file to MinIO
          await minioClient.putObject(
            env.MINIO_BUCKET_NAME,
            filePath,
            processedBuffer,
            processedBuffer.length,
            {
              'Content-Type': file.mimetype,
              'Content-Disposition': `inline; filename="${file.originalname}"`,
            }
          )

          // Upload thumbnail if exists
          let thumbnailPath: string | null = null
          if (thumbnailBuffer) {
            thumbnailPath = `thumbnails/${filename}`
            await minioClient.putObject(
              env.MINIO_BUCKET_NAME,
              thumbnailPath,
              thumbnailBuffer,
              thumbnailBuffer.length,
              {
                'Content-Type': 'image/jpeg',
              }
            )
          }

          // Generate URLs
          const fileUrl = `${env.MINIO_USE_SSL ? 'https' : 'http'}://${env.MINIO_ENDPOINT}:${env.MINIO_PORT}/${env.MINIO_BUCKET_NAME}/${filePath}`
          const thumbnailUrl = thumbnailPath 
            ? `${env.MINIO_USE_SSL ? 'https' : 'http'}://${env.MINIO_ENDPOINT}:${env.MINIO_PORT}/${env.MINIO_BUCKET_NAME}/${thumbnailPath}`
            : undefined

          const uploadedFile: UploadedFile = {
            id: uuidv4(),
            filename,
            originalName: file.originalname,
            mimeType: file.mimetype,
            size: processedBuffer.length,
            url: fileUrl,
            thumbnailUrl,
            createdAt: new Date(),
          }

          uploadedFiles.push(uploadedFile)

        } catch (error) {
          failedFiles.push({
            filename: file.originalname,
            error: error instanceof Error ? error.message : 'خطای نامشخص'
          })
        }
      }

      logger.info('Multiple files uploaded', {
        successCount: uploadedFiles.length,
        failedCount: failedFiles.length,
        userId
      })

      res.status(201).json({
        message: `${uploadedFiles.length} فایل با موفقیت آپلود شد`,
        data: uploadedFiles,
        failed: failedFiles
      })

    } catch (error) {
      next(error)
    }
  }

  // Delete file
  static async deleteFile(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const { filename } = req.params
      const userId = req.user!.id

      if (!filename) {
        throw new ApiError(400, 'نام فایل الزامی است')
      }

      // Try to delete from different paths
      const possiblePaths = [
        `images/${filename}`,
        `documents/${filename}`,
        filename
      ]

      let deleted = false
      for (const filePath of possiblePaths) {
        try {
          await minioClient.removeObject(env.MINIO_BUCKET_NAME, filePath)
          deleted = true
          break
        } catch (error) {
          // Continue to next path
        }
      }

      // Try to delete thumbnail
      try {
        await minioClient.removeObject(env.MINIO_BUCKET_NAME, `thumbnails/${filename}`)
      } catch (error) {
        // Thumbnail might not exist
      }

      if (!deleted) {
        throw new ApiError(404, 'فایل یافت نشد')
      }

      logger.info('File deleted', { filename, userId })

      res.json({
        message: 'فایل با موفقیت حذف شد'
      })

    } catch (error) {
      next(error)
    }
  }

  // Get file info
  static async getFileInfo(req: Request, res: Response, next: NextFunction) {
    try {
      const { filename } = req.params

      if (!filename) {
        throw new ApiError(400, 'نام فایل الزامی است')
      }

      // Try to get file info from different paths
      const possiblePaths = [
        `images/${filename}`,
        `documents/${filename}`,
        filename
      ]

      let fileInfo = null
      for (const filePath of possiblePaths) {
        try {
          const stat = await minioClient.statObject(env.MINIO_BUCKET_NAME, filePath)
          fileInfo = {
            filename,
            size: stat.size,
            lastModified: stat.lastModified,
            contentType: stat.metaData['content-type'],
            url: `${env.MINIO_USE_SSL ? 'https' : 'http'}://${env.MINIO_ENDPOINT}:${env.MINIO_PORT}/${env.MINIO_BUCKET_NAME}/${filePath}`
          }
          break
        } catch (error) {
          // Continue to next path
        }
      }

      if (!fileInfo) {
        throw new ApiError(404, 'فایل یافت نشد')
      }

      res.json({
        data: fileInfo
      })

    } catch (error) {
      next(error)
    }
  }

  // Generate presigned URL for direct upload
  static async generatePresignedUrl(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const { filename, contentType, expiresIn = 3600 } = req.body
      const userId = req.user!.id

      if (!filename || !contentType) {
        throw new ApiError(400, 'نام فایل و نوع محتوا الزامی است')
      }

      // Generate unique filename
      const fileExtension = path.extname(filename)
      const uniqueFilename = `${uuidv4()}${fileExtension}`
      const filePath = `uploads/${uniqueFilename}`

      // Generate presigned URL
      const presignedUrl = await minioClient.presignedPutObject(
        env.MINIO_BUCKET_NAME,
        filePath,
        expiresIn
      )

      logger.info('Presigned URL generated', {
        filename: uniqueFilename,
        userId,
        expiresIn
      })

      res.json({
        data: {
          uploadUrl: presignedUrl,
          filename: uniqueFilename,
          filePath,
          expiresIn,
          finalUrl: `${env.MINIO_USE_SSL ? 'https' : 'http'}://${env.MINIO_ENDPOINT}:${env.MINIO_PORT}/${env.MINIO_BUCKET_NAME}/${filePath}`
        }
      })

    } catch (error) {
      next(error)
    }
  }

  // Get upload statistics
  static async getUploadStats(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const userId = req.user!.id

      // This is a simplified version - in a real app, you'd track uploads in the database
      const stats = {
        totalUploads: 0,
        totalSize: 0,
        imageCount: 0,
        documentCount: 0,
        lastUpload: null,
      }

      res.json({
        data: stats
      })

    } catch (error) {
      next(error)
    }
  }
}