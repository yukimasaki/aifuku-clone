up:
	docker compose up -d --force-recreate
build:
	docker compose up -d --build
front:
	docker compose exec frontend sh
dev-f:
	docker compose exec frontend npx yarn start
back:
	docker compose exec backend sh
test:
	docker compose exec backend yarn test
dev-b:
	docker compose exec backend yarn start:dev
std:
	docker compose exec backend npx prisma studio --browser none
redis:
	docker compose exec redis redis-cli
