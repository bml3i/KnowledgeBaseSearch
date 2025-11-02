FROM node:18-alpine

WORKDIR /app

COPY package*.json ./

RUN npm config set registry https://registry.npmmirror.com
RUN npm install --omit=dev

COPY . .

EXPOSE 5000
CMD ["npm", "start"]