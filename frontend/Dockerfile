FROM node:20-alpine as build
WORKDIR /app
COPY package.json yarn.lock ./
RUN yarn config set strict-ssl false
RUN yarn install && chmod -R +x node_modules/.bin
COPY . .
RUN yarn build

FROM nginx:alpine
COPY --from=build /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"] 