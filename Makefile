up:
	docker compose up -d
build:
	docker compose up -d --build
express:
	docker compose exec express sh
nuxt:
	docker compose exec nuxt sh
dev-b:
	docker compose exec express yarn dev
dev-f:
	docker compose exec nuxt yarn dev
std:
	docker compose exec express npx prisma studio --browser none
