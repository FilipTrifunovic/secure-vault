FROM node:20-alpine AS build
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

FROM nginx:1.27-alpine
RUN addgroup -S appgroup && adduser -S appuser -G appgroup \
    && chown -R appuser:appgroup /usr/share/nginx/html /var/cache/nginx /var/log/nginx \
    && touch /var/run/nginx.pid && chown appuser:appgroup /var/run/nginx.pid
COPY --from=build /app/dist/secure-key-vault-fe/browser /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf
RUN rm /etc/nginx/nginx.conf

# Write a minimal top-level nginx.conf for non-root
RUN printf 'worker_processes auto;\npid /var/run/nginx.pid;\nevents { worker_connections 1024; }\nhttp {\n  include /etc/nginx/mime.types;\n  default_type application/octet-stream;\n  sendfile on;\n  keepalive_timeout 65;\n  include /etc/nginx/conf.d/*.conf;\n}\n' > /etc/nginx/nginx.conf

EXPOSE 8080
USER appuser

CMD ["nginx", "-g", "daemon off;"]
