FROM node

RUN apt-get update && \
    apt-get install -y nginx

RUN mkdir -p /home/app

WORKDIR /home/app

COPY . /home/app/

RUN npm install

RUN npm run build

EXPOSE 3000
EXPOSE 80

ENTRYPOINT ["node", "build/app.js"]