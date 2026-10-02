import { INestApplication } from '@nestjs/common';
import { DocumentBuilder, OpenAPIObject, SwaggerModule } from '@nestjs/swagger';
import { ACCESS_COOKIE } from '../modules/access/session-cookies';

/** Schéma OpenAPI : source des clients générés pour le web et le mobile (skill `sync-api`). */
export function createOpenApiDocument(app: INestApplication): OpenAPIObject {
  const config = new DocumentBuilder()
    .setTitle('API APGO')
    .setDescription(
      'API unique du site, de l’administration et de l’application mobile APGO. ' +
        'Les erreurs suivent toutes le même format : statusCode, code, message, details, requestId.',
    )
    .setVersion('1.0')
    .addCookieAuth(ACCESS_COOKIE)
    .addBearerAuth()
    .build();
  return SwaggerModule.createDocument(app, config, {
    operationIdFactory: (controller, method) =>
      `${controller.replace(/Controller$/, '')}_${method}`,
  });
}
