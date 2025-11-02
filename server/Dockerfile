FROM node:18-alpine

WORKDIR /app

COPY package*.json ./

ENV NPM_CONFIG_REGISTRY=https://registry.npmmirror.com
RUN npm install --omit=dev

COPY . .

EXPOSE 5000
CMD ["npm", "start"]