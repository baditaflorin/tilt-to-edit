FROM node:22-alpine AS build
WORKDIR /app

COPY package.json package-lock.json tsconfig.base.json tsconfig.json vite.workspace.ts ./
COPY apps ./apps
COPY packages ./packages
COPY examples ./examples
COPY test ./test

RUN npm ci
RUN npm run build:demo

FROM nginx:1.27-alpine

COPY apps/demo/nginx.conf /etc/nginx/conf.d/default.conf
COPY --from=build /app/apps/demo/dist /usr/share/nginx/html

EXPOSE 8080

CMD ["nginx", "-g", "daemon off;"]

