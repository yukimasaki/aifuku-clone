up:
	docker compose up -d --foce-recreate
build:
	docker compose up -d --build
frontend:
	docker compose exec frontend sh
dev-f:
	docker compose exec frontend yarn dev
backend:
	docker compose exec backend sh
test:
	docker compose exec backend yarn test
dev-b:
	docker compose exec backend yarn start:dev
std:
	docker compose exec backend npx prisma studio --browser none
