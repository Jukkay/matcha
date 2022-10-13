FROM node

COPY package.json ./
RUN npm install --loglevel=error

EXPOSE 3000
CMD [ "npm", "start" ]