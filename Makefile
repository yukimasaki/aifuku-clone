up:
	docker compose up -d --force-recreate
build:
	docker compose up -d --build
front:
	docker compose exec frontend sh
dev-f:
	docker compose exec frontend npx ng serve --host=0.0.0.0 --disable-host-check --ssl
back:
	docker compose exec backend sh
test:
	docker compose exec backend yarn test
dev-b:
	docker compose exec backend yarn start:dev
std:
	docker compose exec backend npx prisma studio --browser none
