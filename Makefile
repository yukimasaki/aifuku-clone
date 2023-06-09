up:
	docker compose up -d
build:
	docker compose build
sh:
	docker compose exec aifuku-clone sh
rm:
	docker rm aifuku-test