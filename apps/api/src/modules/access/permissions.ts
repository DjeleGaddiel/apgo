/**
 * Permissions vérifiées par les routes. Les rôles (données en base) regroupent ces codes :
 * ajouter un rôle ne demande pas de changer le code, ajouter une permission oui.
 */
export const Permission = {
  /** Se connecter à l'application d'administration. */
  ADMIN_ACCESS: 'admin.access',
  /** Consulter les comptes. */
  USERS_READ: 'users.read',
  /** Valider, suspendre, réactiver, supprimer des comptes (hors équipe d'administration). */
  USERS_MANAGE: 'users.manage',
  /** Gérer les comptes de l'équipe d'administration. */
  ADMINS_MANAGE: 'admins.manage',
  /** Créer et modifier les rôles et leurs permissions (configuration technique). */
  ROLES_MANAGE: 'roles.manage',
  /** Consulter le journal d'audit. */
  AUDIT_READ: 'audit.read',
  /** Paramètres de la plateforme : prix du certificat, offre de lancement. */
  SETTINGS_MANAGE: 'settings.manage',
  /** Passer de la simulation au paiement réel. */
  PAYMENTS_SWITCH: 'payments.switch',
  /** Consulter le statut des paiements. */
  PAYMENTS_READ: 'payments.read',
  /** Ajouter, modifier, supprimer des contenus de la médiathèque. */
  MEDIA_MANAGE: 'media.manage',
  /** Superviser toutes les formations. */
  COURSES_SUPERVISE: 'courses.supervise',
  /** Créer et publier ses propres formations, suivre ses élèves. */
  COURSES_TEACH: 'courses.teach',
  /** Suivre des formations avec progression, passer l'examen. */
  LEARNING: 'learning.access',
  /** Gérer les versions, textes et audios de la Bible. */
  BIBLE_MANAGE: 'bible.manage',
  /** Traiter les demandes du service client. */
  SUPPORT_HANDLE: 'support.handle',
  /** Renvoyer ou régénérer un certificat. */
  CERTIFICATES_REISSUE: 'certificates.reissue',
} as const;

export type Permission = (typeof Permission)[keyof typeof Permission];

export const ALL_PERMISSIONS: Permission[] = Object.values(Permission);

export function isPermission(value: string): value is Permission {
  return (ALL_PERMISSIONS as string[]).includes(value);
}
