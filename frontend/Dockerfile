# frontend/Dockerfile

# frontend/Dockerfile

FROM node:16 as builder

WORKDIR /app
COPY . /app
RUN npm install && npm run build

# Final stage without unnecessary dependencies
FROM nginx:alpine
COPY --from=builder /app/build /usr/share/nginx/html
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
