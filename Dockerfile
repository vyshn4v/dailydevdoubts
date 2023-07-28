# Stage 1: Build the Node.js application
FROM node AS builder

WORKDIR /app

COPY package.json package-lock.json ./
RUN npm install

COPY . .
RUN npm run build

# Stage 2: Create the final image with NGINX
FROM nginx:alpine

COPY --from=builder /app/build /usr/share/nginx/html
COPY nginx/nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 3000

EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]



# FROM node

# RUN apt-get update && \
#     apt-get install -y nginx

# RUN mkdir -p /home/app

# WORKDIR /home/app

# COPY . /home/app/

# RUN npm install

# RUN npm run build

# EXPOSE 3000
# EXPOSE 80

# ENTRYPOINT ["node", "build/app.js"]