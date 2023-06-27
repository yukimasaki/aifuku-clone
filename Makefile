up:
	docker compose up -d
build:
	docker compose up -d --build
nuxt:
	docker compose exec nuxt sh
dev:
	docker compose exec nuxt yarn dev
std:
	docker compose exec nuxt npx prisma studio --browser none