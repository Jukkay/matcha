create-client:
	docker-compose up -d --force-recreate client

create-server:
	docker-compose up -d --force-recreate server

create-db:
	docker-compose up -d --force-recreate mariadb

create: create-client create-server create-db

up:
	docker-compose up

up-detached:
	docker-compose up -d

up-production-detached:
	docker compose -f docker-compose.yml -f production.yml up

restart:
	docker-compose up -d

down:
	docker-compose down

clean:
	docker-compose down --remove-orphans
	sudo rm -rf client/.next

clean-modules:
	sudo rm -rf client/.next
	sudo rm -rf client/.pnpm-store
	sudo rm -rf client/node_modules
	sudo rm -rf server/node_modules

build:
	docker-compose run --rm client "npm run build"

install-client:
	docker-compose run --rm client "npm install"

install-client-production:
	docker-compose run --rm client "npm install --omit=dev"

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

reset-db:
	docker volume rm matcha-data

fclean: clean reset-db

users:
	docker-compose exec server npm run createusers

production: install build up-production-detached users logs

clean-docker:
	docker rm -f matcha_client
	docker rm -f matcha_server
	docker rm -f matcha_db
	docker image rm -f matcha-client
	docker image rm -f matcha-server
	docker image rm -f mariadb
	docker container prune -f
	docker volume prune -f
	docker image prune -f

re: clean-docker up