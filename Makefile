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
	docker compose -f docker-compose.yml -f production.yml up

restart:
	docker-compose up -d

down:
	docker-compose down

clean:
	docker-compose down --remove-orphans
	rm -rf client/.next
	docker volume rm matcha-data

clean-modules:
	rm -rf client/node_modules
	rm -rf server/node_modules

build:
	docker-compose run --rm client "pnpm build"

install-client:
	docker-compose run --rm client "pnpm install"

install-client-production:
	docker-compose run --rm client "pnpm i -P"

install-server:
	docker-compose run --rm server "npm install"

install-server-production:
	docker-compose run --rm server "npm install --omit=dev"

install: install-client install-server

install-production: install-client-production install-server-production

goto-client:
	docker-compose exec client bash

goto-server:
	docker-compose exec server bash

goto-db:
	docker-compose exec mariadb bash

logs:
	docker-compose logs -f

reset-db: clean

users:
	docker-compose exec server npm run createusers

production: install-production build up-production users