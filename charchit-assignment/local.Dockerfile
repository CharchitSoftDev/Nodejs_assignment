FROM public.ecr.aws/sg/node:18-alpine
# FROM node:lts
WORKDIR /src
ADD package*.json ./
ADD . /src
RUN npm i --silent
RUN npm run build

CMD npm run start:dev