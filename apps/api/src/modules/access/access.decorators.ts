import {
  createParamDecorator,
  ExecutionContext,
  SetMetadata,
} from '@nestjs/common';
import type { Request } from 'express';
import type { Permission } from './permissions';

export const ACCESS_RULE = 'apgo:access';

export type AccessRule =
  | { kind: 'public' }
  | { kind: 'authenticated' }
  | { kind: 'permissions'; permissions: Permission[] };

/**
 * Chaque route déclare qui peut l'appeler ; sans déclaration, elle est refusée.
 */
/** Accessible sans compte (médiathèque, Bible, catalogue, connexion). */
export const Public = () => SetMetadata(ACCESS_RULE, { kind: 'public' });

/** Accessible à tout utilisateur connecté. */
export const Authenticated = () =>
  SetMetadata(ACCESS_RULE, { kind: 'authenticated' });

/** Réservé aux utilisateurs qui ont toutes les permissions indiquées. */
export const RequirePermissions = (...permissions: Permission[]) =>
  SetMetadata(ACCESS_RULE, { kind: 'permissions', permissions });

/** Utilisateur connecté (défini sur les routes `Authenticated` ou `RequirePermissions`). */
export const CurrentUser = createParamDecorator(
  (_: unknown, context: ExecutionContext) =>
    context.switchToHttp().getRequest<Request>().user,
);
