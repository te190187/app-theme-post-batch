FROM node:18-alpine
RUN apk add --no-cache libc6-compat
WORKDIR /app
COPY package.json package-lock.json  ./
COPY src ./src

RUN npm ci;

ENV NODE_ENV production

CMD ["node", "src/index.js"]