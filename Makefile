create-app:
	docker-compose up -d --force-recreate app

create-server:
	docker-compose up -d --force-recreate server

create-db:
	docker-compose up -d --force-recreate mariadb

create: create-app create-server create-db

up:
	docker-compose up

restart:
	docker-compose up -d

down:
	docker-compose down

clean:
	docker-compose down --remove-orphans

install-app:
	docker-compose run --rm app "npm install"

install-server:
	docker-compose run --rm server "npm install"

install: install-app install-server

goto-app:
	docker-compose exec app bash

goto-server:
	docker-compose exec server bash

goto-db:
	docker-compose exec mariadb bash

logs:
	docker-compose logs -f

reset-db:
	docker-compose exec server npm run reset-db