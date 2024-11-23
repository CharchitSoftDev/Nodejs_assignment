# FROM public.ecr.aws/sg/node:18-alpine
# FROM node:lts
FROM public.ecr.aws/studiographene/node:18
WORKDIR /src

ARG NPM_TOKEN

ADD package*.json ./
ADD . /src

COPY .npmrc .npmrc

RUN npm i
RUN npm run build
RUN npx prisma generate

EXPOSE 80
CMD npm run start:prod
