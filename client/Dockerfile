FROM node:18-alpine

WORKDIR /app

COPY package*.json ./

ENV NPM_CONFIG_REGISTRY=https://registry.npmmirror.com
RUN npm install

COPY . .

EXPOSE 3000
CMD ["npm", "start"]