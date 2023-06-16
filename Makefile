up:
	docker compose up -d
build:
	docker compose up -d --build
express:
	docker compose exec express sh
dev:
	docker compose exec express yarn dev
std:
	docker compose exec express npx prisma studio --browser none