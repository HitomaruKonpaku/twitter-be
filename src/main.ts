import { ValidationPipe } from '@nestjs/common'
import { NestFactory } from '@nestjs/core'
import { NestExpressApplication } from '@nestjs/platform-express'
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger'
import 'dotenv/config'
import { AppModule } from './app.module'
import { Logger } from './shared/logger'

async function bootstrap() {
  const logger = new Logger('Main')

  const app = await NestFactory.create<NestExpressApplication>(AppModule, {
    logger: new Logger(),
  })

  app.enableCors()
  app.enableShutdownHooks()

  app.set('trust proxy', true)

  app.useGlobalPipes(new ValidationPipe({
    whitelist: true,
    transform: true,
  }))

  const config = new DocumentBuilder()
    .build()
  const document = SwaggerModule.createDocument(app, config)
  SwaggerModule.setup('api', app, document)

  const port = process.env.PORT || 8080

  await app.listen(port, () => {
    const url = `http://localhost:${port}`
    logger.log(`🚀 Server listening on ${url}`)
  })
}

bootstrap()
