// Initialisation de la base : rôles système et leurs permissions, puis le premier super admin.
// Lancement : npx nx run api:seed (sans risque à relancer : rien n'est créé en double).
import 'dotenv/config';
import { PrismaPg } from '@prisma/adapter-pg';
import * as argon2 from 'argon2';
import { PrismaClient } from '../src/generated/prisma/client';
import { RoleKey, SYSTEM_ROLES } from '../src/modules/access/system-roles';

const url = process.env['DATABASE_URL'];
if (!url) throw new Error('DATABASE_URL est obligatoire.');
const prisma = new PrismaClient({
  adapter: new PrismaPg({ connectionString: url }),
});

async function seedRoles() {
  for (const definition of SYSTEM_ROLES) {
    const role = await prisma.role.upsert({
      where: { key: definition.key },
      create: {
        key: definition.key,
        name: definition.name,
        description: definition.description,
        requiresTwoFactor: definition.requiresTwoFactor,
        isSystem: true,
      },
      update: {
        name: definition.name,
        description: definition.description,
        requiresTwoFactor: definition.requiresTwoFactor,
        isSystem: true,
      },
    });
    // Les permissions des rôles système suivent exactement le code.
    await prisma.$transaction([
      prisma.rolePermission.deleteMany({
        where: {
          roleId: role.id,
          permission: { notIn: definition.permissions },
        },
      }),
      prisma.rolePermission.createMany({
        data: definition.permissions.map((permission) => ({
          roleId: role.id,
          permission,
        })),
        skipDuplicates: true,
      }),
    ]);
    console.log(
      `Rôle ${definition.key} : ${definition.permissions.length} permissions`,
    );
  }
}

/** Créé une seule fois, à partir de SEED_SUPER_ADMIN_* ; la double authentification se configure à la première connexion. */
async function seedSuperAdmin() {
  const email = process.env['SEED_SUPER_ADMIN_EMAIL']?.trim().toLowerCase();
  const password = process.env['SEED_SUPER_ADMIN_PASSWORD'];
  if (!email || !password) {
    console.log(
      'SEED_SUPER_ADMIN_EMAIL ou SEED_SUPER_ADMIN_PASSWORD absent : super admin non créé.',
    );
    return;
  }
  if (password.length < 12)
    throw new Error('SEED_SUPER_ADMIN_PASSWORD : 12 caractères minimum.');

  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) {
    console.log('Le super admin existe déjà.');
    return;
  }
  const role = await prisma.role.findUniqueOrThrow({
    where: { key: RoleKey.SUPER_ADMIN },
  });
  await prisma.user.create({
    data: {
      email,
      passwordHash: await argon2.hash(password, { type: argon2.argon2id }),
      firstName: 'Super',
      lastName: 'Administrateur',
      roleId: role.id,
    },
  });
  console.log(
    `Super admin créé : ${email}. Retirez SEED_SUPER_ADMIN_PASSWORD du fichier .env.`,
  );
}

seedRoles()
  .then(seedSuperAdmin)
  .finally(() => prisma.$disconnect())
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
