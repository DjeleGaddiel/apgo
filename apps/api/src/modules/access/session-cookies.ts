/** Noms des cookies de session du site web (jamais de jeton dans `localStorage`). */
export const ACCESS_COOKIE = 'apgo_access';
export const REFRESH_COOKIE = 'apgo_refresh';
/** Le jeton de renouvellement n'est envoyé qu'aux routes d'authentification. */
export const REFRESH_COOKIE_PATH = '/api/auth';
