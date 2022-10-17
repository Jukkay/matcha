# 42 Dates / Matcha

42 Dates is a dating app I built for a project called Matcha at
Hive Helsinki Coding School. The app is built with React
on Next.js create-next-app. Backend is using Node and
Express with MariaDB database. Userbase has about 3800
dummy users created using Random User Generator API and
Node script, so unfortunately this is not the place to
find real love.

The app has basic functionality including dating
profile, suggested matches based on preferences, profile
search, instant notifications, and instant messaging
between matched users. Users are located using
Geolocation API and it falls back on IP location with
Fast-geoip library. You&apos;re free to try it out, but
it requires registration with working email address.
Unfortunately matches cannot be simulated unless you
create two users that like each other. The accounts can
be removed after testing.

## Technologies
				
* React
* Next.js
* Typescript
* Node
* Express
* MariaDB
* Socket.io
* JSON web tokens
* Axios
* Geolocation API
* Random User Generator API
* Docker
			
Next.js is used mainly as a create-react-app
replacement. No server-side rendering is used for this
project and API is done with Node and Express. API
authentication is done with JSON web tokens. Axios
interceptor tries to refresh access tokens automatically
if response status is 401. Socket.io is used for
handling websocket connections for notifications and
instant messaging.
				
Development environment runs in Docker containers and the Docker files are included in the repository.
				
