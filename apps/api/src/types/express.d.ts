import type { AuthenticatedUser } from '../modules/access/authenticated-user';

declare global {
  namespace Express {
    interface Request {
      /** Identifiant de la requête, repris dans les erreurs et les journaux. */
      id: string;
      /** Utilisateur connecté, renseigné par `AccessGuard`. */
      user?: AuthenticatedUser;
    }
  }
}

export {};
