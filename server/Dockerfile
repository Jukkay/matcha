FROM node

WORKDIR /server
ADD package.json ./
RUN npm install
ADD . ./
RUN npx tsc
RUN npm install --omit=dev
EXPOSE 4000
CMD [ "npm", "start" ]