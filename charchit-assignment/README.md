# README

# NestJS Project

## Installing dependencies

Use `npm install <Dependency-Name>` to add new package to the project
Otherwise Use `npm ci` to install the project dependencies

## This covers

- JWT Token configuration
  - login & refresh token
- Postgres
- Eslint & Prettier
- Forgot Password
- Validation with joi

## File and folder naming conventions

- Classes and interfaces Names will be singular and follow `PascalCasing`
- Any global constants or environment variables are in `all-caps` and follow `SNAKE_CASE`
- Variable name should be `camelCase`
- Folder and file name will be singular and follow `kebab-case`
- Exceptions:
  - Module files should follow this pattern: `<name>.module.ts`
  - Controller files should follow this pattern: `<name>.controller.ts`
  - Service files should follow this pattern: `<name>.service.ts`

## Project directory structure

Nestjs architecture is based into modules, controllers and services. This boilerplate have the following core files:

```bash
src
|-...
|- app.module.ts
|- app.controller.ts
|- app.service.ts
|- main.ts
|- ...
```

### app.module.ts

- This is the most important file in this application. This module file essentially bundles all the controllers and providers of our application together.

### app.controller.ts

- In this file you will find all the routes related to our application itself, like a `/health` route to check application status.

### app.service.ts

- This service will include methods that will perform a certain operation. For example, a service to find all users.

### main.ts

- The entry file of our application, here you find the configs for our server and application in general like cors, ports, validation pipes and etc.

## Secret management

For store database configurations, jwt secrets and ports, this boilerplate uses a `.env` file with the following variables:

```
# Config
PORT=...
PORT_DATABASE=...

# Postgres
PG_USER="..."
PG_PASSWORD="..."
PG_DATABASE_NAME="..."

# JWT
JWT_ACCESS_TOKEN_SECRET="..."
JWT_REFRESH_TOKEN_SECRET="..."

DATABASE_URL="..."
```
