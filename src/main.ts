import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { SwaggerModule, DocumentBuilder } from "@nestjs/swagger";
import helmet from "helmet";

async function bootstrap() {
  const app = await NestFactory.create(AppModule, {abortOnError: false});

  const config = new DocumentBuilder()
      .setTitle("A-Team API — Interactive Documentation")
      .setDescription("")
      .setVersion("1.0")
      .build()

  const document = SwaggerModule.createDocument(app, config);

  const customOptions = {
    customSiteTitle: "A-Team API — Interactive Documentation"
  }
  SwaggerModule.setup('interactive', app, document, customOptions);

  app.use(helmet());

  await app.listen(3000);
}
bootstrap();
