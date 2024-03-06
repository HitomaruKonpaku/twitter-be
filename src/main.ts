import { ValidationPipe } from '@nestjs/common'
import { NestFactory } from '@nestjs/core'
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger'
import 'dotenv/config'
import { AppModule } from './app.module'
import { Logger } from './shared/logger/logger'

async function bootstrap() {
  const logger = new Logger('Main', { timestamp: true })

  const app = await NestFactory.create(AppModule, {
    logger: new Logger(null, { timestamp: true }),
  })

  app.enableCors()

  app.useGlobalPipes(new ValidationPipe({ transform: true }))

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
