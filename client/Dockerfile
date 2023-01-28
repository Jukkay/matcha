FROM node

WORKDIR /client
ADD package.json ./
RUN npm install
EXPOSE 3000
CMD [ "npm", "run", "dev" ]