import { HttpStatus, NotFoundException } from '@nestjs/common';
import { ThrottlerException } from '@nestjs/throttler';
import { ApiException } from './api.exception';
import { AllExceptionsFilter } from './all-exceptions.filter';

describe('AllExceptionsFilter', () => {
  const filter = new AllExceptionsFilter();

  it('conserve le code et les détails d’une erreur métier', () => {
    const body = filter.toBody(
      new ApiException(
        HttpStatus.CONFLICT,
        'AUTH_EMAIL_TAKEN',
        'Déjà utilisé.',
        [{ field: 'email', code: 'TAKEN' }],
      ),
      'req-1',
    );
    expect(body).toEqual({
      statusCode: 409,
      code: 'AUTH_EMAIL_TAKEN',
      message: 'Déjà utilisé.',
      details: [{ field: 'email', code: 'TAKEN' }],
      requestId: 'req-1',
    });
  });

  it('traduit les erreurs de Nest dans le format unique', () => {
    expect(filter.toBody(new NotFoundException(), 'r').code).toBe('NOT_FOUND');
    expect(filter.toBody(new ThrottlerException(), 'r')).toMatchObject({
      statusCode: 429,
      code: 'TOO_MANY_REQUESTS',
    });
  });

  it('ne révèle jamais le détail d’une erreur inattendue', () => {
    const body = filter.toBody(
      new Error('connect ECONNREFUSED 127.0.0.1:5432 SELECT * FROM users'),
      'r',
    );
    expect(body.statusCode).toBe(500);
    expect(body.code).toBe('INTERNAL_ERROR');
    expect(JSON.stringify(body)).not.toContain('ECONNREFUSED');
  });
});
