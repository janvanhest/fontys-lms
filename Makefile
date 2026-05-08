.PHONY: dev prod down

dev:
	docker compose up --watch

prod:
	docker compose -f compose.yaml -f compose.prod.yaml up --build

down:
	docker compose down
