.PHONY: dev prod down test

dev:
	docker compose up --build --watch

prod:
	docker compose -f compose.yaml -f compose.prod.yaml up --build

down:
	docker compose down

test:
	cd backend && pnpm test -- --verbose
