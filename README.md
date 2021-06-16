# Squawk

This project is a communication platform leveraging Socket.io and webRTC to allow users to communicate effectively and securely whenever they wish. This app is free to use.

## Live Demo

To see this app in action, click [here](https://squawk-client.vercel.app/)

## Squawk Client

For more information on the Squawk Client delivering the user experience, click [here](https://github.com/gregjohle/squawk-client/blob/main/README.md)

## Squawk API Endpoints

### /api/users/register

This api accespts JSON data, with the maditory keys of "name", "email" and "password". Upon a successful AJAX request, it will return a status "201" and "user created".

This endpoint will register a new user into the user database, assuming the email address is not associated with another account. The password is hashed and stored securely for data security.

### /api/users/login

This api accespts JSON data, with the maditory keys of "email" and "password". Upon a successful AJAX request, it will return a status "200" and some of the user data in JSON format. The data returned includes the user ID, name, and email address.

This endpoint compares the stored user password associated with the supplied email address with the email address supplied with the request. If they match, then the user data is returned to the client.

## Technology Used

### Front-End

The front-end uses React, webRTC, and a socket.io-client package to connect users for communication.

### API

This API uses Node.js and Express to provide the endpoints. PostgreSQL and Knex are used to store and access user data in the database. Socket.io is used as a wrapper for websockets to allow users to connect.

## Contact

If there are any questions, concerns, or issues, please feel free to contact Greg at greg.johle@gmail.com
