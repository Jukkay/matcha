FROM node

RUN npm install --location=global pnpm

# pnpm fetch does require only lockfile
COPY pnpm-lock.yaml ./

RUN pnpm fetch

ADD . ./
RUN pnpm install

EXPOSE 3000
CMD [ "pnpm", "dev" ]