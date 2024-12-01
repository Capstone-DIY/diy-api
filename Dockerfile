FROM node:18
WORKDIR /usr/src/app
COPY package*.json ./
RUN npm install
COPY . .
RUN npx prisma init
RUN npx prisma generate
EXPOSE 8080
CMD ["npm", "start"]