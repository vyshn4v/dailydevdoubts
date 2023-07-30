FROM node

RUN mkdir -p /home/app

WORKDIR /home/app

COPY . /home/app/

RUN npm install

RUN npm run build

EXPOSE 3000

ENTRYPOINT ["node", "build/app.js"]

# FROM node

# RUN mkdir -p /home/app/ chown -R node:node /home/app

# WORKDIR /home/app

# COPY . /home/app/

# RUN npm install

# RUN npm run build

# COPY --chown=node:node . .

# EXPOSE 3000

# ENTRYPOINT ["node", "build/app.js"]