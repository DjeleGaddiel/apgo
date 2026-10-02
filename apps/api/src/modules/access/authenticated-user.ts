import type { Permission } from './permissions';

/** Utilisateur connecté, rechargé depuis la base à chaque requête. */
export interface AuthenticatedUser {
  id: string;
  email: string;
  roleKey: string;
  permissions: ReadonlySet<Permission>;
}
