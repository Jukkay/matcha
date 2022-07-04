up-app:
	docker-compose up -d --force-recreate app

up-server:
	docker-compose up -d --force-recreate server

up: up-app up-server

install-app:
	docker-compose run --rm app "npm install"

install-server:
	docker-compose run --rm server "npm install"

install: install-app install-server

goto-app:
	docker-compose exec app bash

goto-server:
	docker-compose exec server bash

logs:
	docker-compose logs -f