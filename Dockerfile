FROM node

RUN mkdir -p /home/app

WORKDIR /home/app

COPY . /home/app/

RUN npm install

RUN npm run build

# Expose ports for Node.js, Nginx, and MongoDB
EXPOSE 3000
EXPOSE 80
EXPOSE 27017

# Start services using a custom entrypoint script
COPY entrypoint.sh /home/app/entrypoint.sh
RUN chmod +x /home/app/entrypoint.sh
ENTRYPOINT ["/home/app/entrypoint.sh"]