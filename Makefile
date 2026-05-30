.PHONY: dev prod down test bench bench-ttfb validate validate-verbose

dev:
	docker compose up --build --watch

prod:
	docker compose -f compose.yaml -f compose.prod.yaml up --build

down:
	docker compose down

test:
	cd backend && pnpm test -- --verbose

bench:
	bash bench-chat.sh

bench-ttfb:
	bash bench-chat-ttfb.sh

validate:
	bash validate-stream.sh

validate-verbose:
	bash validate-stream.sh --verbose
