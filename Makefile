up:
	docker compose up -d --foce-recreate
build:
	docker compose up -d --build
nuxt:
	docker compose exec nuxt sh
dev-f:
	docker compose exec nuxt yarn dev
backend:
	docker compose exec backend sh
test:
	docker compose exec backend yarn test
dev-b:
	docker compose exec backend yarn start:dev
std:
	docker compose exec backend npx prisma studio --browser none
