FROM node:12
WORKDIR /usr/src/app
RUN npm install @google/clasp -g