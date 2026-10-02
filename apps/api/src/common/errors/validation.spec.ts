import { IsEmail, IsString, MaxLength } from 'class-validator';
import { createValidationPipe } from './validation';
import { ValidationFailedException } from './common.errors';

class SampleDto {
  @IsEmail()
  email!: string;

  @IsString()
  @MaxLength(5)
  name!: string;
}

describe('createValidationPipe', () => {
  const pipe = createValidationPipe();
  const metadata = { type: 'body' as const, metatype: SampleDto };

  it('renvoie une erreur par champ avec un code stable', async () => {
    const error = await pipe
      .transform(
        { email: 'pas-un-email', name: 'beaucoup trop long' },
        metadata,
      )
      .catch((e: unknown) => e);
    expect(error).toBeInstanceOf(ValidationFailedException);
    expect((error as ValidationFailedException).details).toEqual([
      { field: 'email', code: 'IS_EMAIL' },
      { field: 'name', code: 'MAX_LENGTH' },
    ]);
  });

  it('refuse les champs non déclarés', async () => {
    const error = await pipe
      .transform(
        { email: 'a@b.ci', name: 'Ama', role: 'SUPER_ADMIN' },
        metadata,
      )
      .catch((e: unknown) => e);
    expect((error as ValidationFailedException).details).toEqual([
      { field: 'role', code: 'NOT_ALLOWED' },
    ]);
  });
});
