up:
	docker compose up -d
build:
	docker compose up -d --build
nuxt:
	docker compose exec nuxt sh
dev-f:
	docker compose exec nuxt yarn dev
express:
	docker compose exec express sh
test:
	docker compose exec express yarn test
dev-b:
	docker compose exec express yarn dev
std:
	docker compose exec express npx prisma studio --browser none
