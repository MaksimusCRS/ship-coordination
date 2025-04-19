FROM node:18

WORKDIR /app

COPY package*.json ./
RUN npm install

COPY . .

# Add crypto polyfill for ESM (optional step if needed)
ENV NODE_OPTIONS=--experimental-global-webcrypto

RUN npm run build

CMD ["node", "dist/main"]
