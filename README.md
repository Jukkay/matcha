# 42 Dates / Matcha
![Matcha](https://img.shields.io/github/languages/top/Jukkay/matcha)

## Description

42 Dates is a dating app I built for a project called Matcha at
Hive Helsinki Coding School. The app is built with React
on Next.js create-next-app. Backend is using Node and
Express with MariaDB database. Userbase has about 3800
dummy users created using Random User Generator API and
Node script, so unfortunately this is not the place to
find real love.

You&apos;re free to try it out, but
it requires registration with working email address.
Unfortunately matches cannot be simulated unless you
create two users that like each other. The accounts can
be removed after testing.

## Features

* Authentication with email and password
* Email validation
* Authorization with JWT
* Dating profiles
* Profile search
* Suggested matches based on user preferences
* Profile visit history
* Like / Unlike
* Match / Unmatch
* Instant notifications (sockets)
* Instant messaging between matched users (sockets)
* Calculate distance between users
* Report / block user
* Change screen name / email address / password / profile picture
* Upload / delete images
* Remove profile / user
* Users are located using Geolocation API and it falls back on IP location with
Fast-geoip library. 

## Technologies
				
* [React.js](https://reactjs.org/)
* [Next.js](https://nextjs.org/)
* [Typescript](https://www.typescriptlang.org/)
* [Node.js](https://nodejs.org)
* [Express](https://expressjs.com/)
* [MariaDB](https://mariadb.com/)
* [Socket.io](https://socket.io)
* [JSON web tokens](https://jwt.io/)
* [Axios](https://axios-http.com/)
* [Geolocation API](https://developer.mozilla.org/en-US/docs/Web/API/Geolocation_API)
* [Fast-geoip](https://github.com/onramper/fast-geoip)
* [Random User Generator API](https://randomuser.me/documentation)
* [Docker](https://docker.com)
			
Next.js is used mainly as a create-react-app
replacement. No server-side rendering is used for this
project and API is done with Node and Express. API
authorization is done with JSON web tokens. Axios
interceptor tries to refresh access tokens automatically
if response status is 401. Socket.io is used for
handling websocket connections for notifications and
instant messaging.
				
Development environment runs in Docker containers and the Docker files are included in the repository.

## Where can I try it?

The app is deployed at:
https://matcha-app.fly.dev/

Registration is fully functional and requires email verification. If you'd rather not register, you can try it out using these ready test users

Username: ```testuser1``` OR ```testuser2```
Password: ```Password1```

## How can I run it locally?

If you'd prefer to run it locally, follow these instructions:

1. Go to config/secrets folder and create secrets with:
```
printf "%s" "$(openssl rand -base64 20)" > mysql_password.secret
printf "%s" "$(openssl rand -base64 20)" > mysql_root_password.secret
printf "%s" "$(openssl rand -base64 10)" > server_token.secret
```
2. Add your outlook password to outlook_password.secret file
3. Add you outlook email address to MAIL_USER environment variable in docker-compose.yml
4. Build the project with ```make production```
5. Create dummy users with ```make users```
6. Browse to [http://localhost:3000](http://localhost:3000)
7. Create your test users. (Email validation is required)

