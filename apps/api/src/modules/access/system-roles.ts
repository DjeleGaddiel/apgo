import { ALL_PERMISSIONS, Permission } from './permissions';

/** Clés des rôles livrés avec l'application (cahier des charges, section 2). */
export const RoleKey = {
  SUPER_ADMIN: 'SUPER_ADMIN',
  ADMIN: 'ADMIN',
  CONTENT_MANAGER: 'CONTENT_MANAGER',
  SUPPORT: 'SUPPORT',
  TRAINER: 'TRAINER',
  LEARNER: 'LEARNER',
} as const;

export type RoleKey = (typeof RoleKey)[keyof typeof RoleKey];

export interface SystemRole {
  key: RoleKey;
  name: string;
  description: string;
  requiresTwoFactor: boolean;
  permissions: Permission[];
}

/** Rôles créés ou mis à jour par le script d'initialisation (`nx run api:seed`). */
export const SYSTEM_ROLES: SystemRole[] = [
  {
    key: RoleKey.SUPER_ADMIN,
    name: 'Super administrateur',
    description: 'Accès total et configuration technique.',
    requiresTwoFactor: true,
    permissions: ALL_PERMISSIONS,
  },
  {
    key: RoleKey.ADMIN,
    name: 'Administrateur APGO',
    description:
      'Gère les comptes, les admins, les paramètres, la médiathèque, la Bible et supervise les formations.',
    requiresTwoFactor: true,
    permissions: ALL_PERMISSIONS.filter(
      (p) => p !== Permission.ROLES_MANAGE && p !== Permission.PAYMENTS_SWITCH,
    ),
  },
  {
    key: RoleKey.CONTENT_MANAGER,
    name: 'Gestionnaire de contenu',
    description: 'Ajoute et gère les contenus de la médiathèque.',
    requiresTwoFactor: false,
    permissions: [Permission.ADMIN_ACCESS, Permission.MEDIA_MANAGE],
  },
  {
    key: RoleKey.SUPPORT,
    name: 'Service client',
    description:
      'Répond aux demandes, consulte le statut des paiements, renvoie ou régénère un certificat.',
    requiresTwoFactor: false,
    permissions: [
      Permission.ADMIN_ACCESS,
      Permission.USERS_READ,
      Permission.SUPPORT_HANDLE,
      Permission.PAYMENTS_READ,
      Permission.CERTIFICATES_REISSUE,
    ],
  },
  {
    key: RoleKey.TRAINER,
    name: 'Formateur',
    description:
      'Crée et publie ses cours, suit ses élèves. Compte soumis à validation.',
    requiresTwoFactor: false,
    permissions: [Permission.COURSES_TEACH, Permission.LEARNING],
  },
  {
    key: RoleKey.LEARNER,
    name: 'Apprenant',
    description:
      'Suit les formations, garde sa progression, passe l’examen et obtient son certificat.',
    requiresTwoFactor: false,
    permissions: [Permission.LEARNING],
  },
];
