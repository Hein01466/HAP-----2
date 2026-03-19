import { ValidationPipe } from '@nestjs/common'
import { NestFactory } from '@nestjs/core'
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger'
import { NestExpressApplication } from '@nestjs/platform-express'
import { join } from 'path'
import { AppModule } from './app.module'

function getCorsOrigins() {
  const raw = process.env.CORS_ORIGINS?.trim()
  if (!raw || raw === '*') {
    return true
  }
  return raw
    .split(',')
    .map((origin) => origin.trim())
    .filter(Boolean)
}

async function bootstrap() {
  const isProduction = process.env.NODE_ENV === 'production'
  const jwtSecret = process.env.JWT_SECRET

  if (isProduction && (!jwtSecret || jwtSecret === 'change-me')) {
    throw new Error('JWT_SECRET must be set to a secure value in production')
  }

  const app = await NestFactory.create<NestExpressApplication>(AppModule)
  app.enableShutdownHooks()
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  )
  app.enableCors({
    origin: getCorsOrigins(),
    credentials: true,
  })
  app.useStaticAssets(join(process.cwd(), 'uploads'), { prefix: '/uploads' })

  if (process.env.SWAGGER_ENABLED !== 'false') {
    const config = new DocumentBuilder()
      .setTitle('HAP Management System API')
      .setDescription('Production API documentation for HAP backend services.')
      .setVersion('1.0')
      .addBearerAuth()
      .build()
    const document = SwaggerModule.createDocument(app, config)
    SwaggerModule.setup(process.env.SWAGGER_PATH || 'docs', app, document, {
      swaggerOptions: { persistAuthorization: true },
    })
  }

  const port = process.env.PORT || 3000
  await app.listen(port)
}

bootstrap()
