# APGO

Plateforme web et mobile de l'Association du Peuple Gouro.

## Démarrage

```bash
npm install
cp .env.example .env
docker compose -f infra/docker-compose.yml up -d
npx nx serve api      # http://localhost:3000/api
npx nx serve web      # http://localhost:4200
npx nx serve admin    # http://localhost:4300
```

Application mobile : voir [apps/mobile/README.md](apps/mobile/README.md).

## Documentation

- [Cahier des charges](docs/cadrage/01-cahier-des-charges.pdf)
- [Architecture](docs/architecture/architecture-monorepo.pdf)
- Conventions de code : [CLAUDE.md](CLAUDE.md)
