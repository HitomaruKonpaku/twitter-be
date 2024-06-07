# BASE
FROM node:18-alpine AS base

RUN apk add --no-cache tini

WORKDIR /app

COPY package*.json ./

# DEPENDENCIES
FROM base AS dependencies

RUN npm install --omit=dev

# BUILDER
FROM base AS builder

RUN npm install

COPY . .

RUN npm run build

# RELEASE
FROM base AS release

COPY --from=dependencies /app/node_modules ./node_modules
COPY --from=builder      /app/dist ./dist

EXPOSE 8080

CMD [ "/sbin/tini", "--", "node", "dist/main" ]
