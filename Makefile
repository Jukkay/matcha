create-client:
	docker-compose up -d --force-recreate client

create-server:
	docker-compose up -d --force-recreate server

create-db:
	docker-compose up -d --force-recreate mariadb

create: create-client create-server create-db

up:
	docker-compose up

up-production:
	docker compose -f docker-compose.yml -f production.yml up -d

restart:
	docker-compose up -d

down:
	docker-compose down

clean:
	docker-compose down --remove-orphans
	docker volume rm matcha-data

build:
	docker-compose run --rm client "pnpm build"

install-client:
	docker-compose run --rm client "pnpm install"

install-server:
	docker-compose run --rm server "npm install"

install: install-client install-server

goto-client:
	docker-compose exec client bash

goto-server:
	docker-compose exec server bash

goto-db:
	docker-compose exec mariadb bash

logs:
	docker-compose logs -f

reset-db:
	docker-compose exec server npm run reset-db

create-users:
	docker-compose exec server npm run createusers