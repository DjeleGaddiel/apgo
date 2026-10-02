/**
 * `web` : jetons en cookies `HttpOnly`, jamais visibles par le JavaScript de la page.
 * `mobile` : jetons dans la réponse, rangés par l'application dans le stockage sécurisé du téléphone.
 */
export const CLIENT_KINDS = ['web', 'mobile'] as const;
export type ClientKind = (typeof CLIENT_KINDS)[number];
