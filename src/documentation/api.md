# Embrasure API Documentation

This documentation provides information on the RESTful API endpoints for manaing secrets and users with the Embrasure Secrets API. Secrets are key-value pairs stored in a database, and users have permissions for accessing and managing secrets.

## Table of Contents

-   [Introduction](#introduction)
-   [Secrets API](#secrets-api)
    -   [Get All Secrets](#get-all-secrets)
    -   [Get a Single Secret](#get-a-single-secret)
    -   [Delete a Secret](#delete-a-secret)
    -   [Update a Secret](#update-a-secret)
    -   [Create a Secret](#create-a-secret)
-   [Users API](#users-api)
    -   [Get All Users](#get-all-users)
    -   [Get User Permissions](#get-user-permissions)
    -   [Delete User](#delete-user)
    -   [Edit User Permissions](#edit-user-permissions)
    -   [Create User](#create-user)

## Introduction

This API allows you to interact with secrets and users, providing CRUD (Create, Read, Update, Delete) operations for managing key-value pairs and user permissions.

Base URLs:

-   Secrets: `/secrets`
-   Users: `/users`

## Secrets API

### Get All Secrets

-   **Endpoint:** `GET /secrets`
-   **Description:** Retrieve a list of all secrets.
-   **Responses:**
    -   `200 OK`: Successfully retrieved the list of secrets.
    -   `500 Internal Server Error`: An error occurred on the server.

**Example Request:**

```http
GET /secrets
```

**Example Response (200 OK):**

```json
[
    {
        "key": "spotify",
        "value": "asdv234asdv4"
    },
    {
        "key": "github",
        "value": "ac!@#$WDSca"
    }
]
```

### Get a Single Secret

-   **Endpoint:** `GET /secrets/:key`
-   **Description:** Retrieve a single secret by providing its key.
-   **Request Parameters:**
    -   `key`: The key of the secret to retrieve.
-   **Responses:**
    -   `200 OK`: Successfully retrieved the secret. Returns the secret data.
    -   `404 Not Found`: Secret with the provided key does not exist.
    -   `500 Internal Server Error`: An error occurred on the server.

**Example Request:**

```http
GET /secrets/mySecretKey
```

**Example Response (200 OK):**

```json
{
    "key": "mySecretKey",
    "value": "My Secret Value"
}
```

### Delete a Single Secret

-   **Endpoint:** `DELETE /secrets/:key`
-   **Description:** Delete a secret by providing its key.
-   **Request Parameters:**
    -   `key`: The key of the secret to retrieve.
-   **Responses:**
    -   `204 No Content`: Secret successfully deleted.
    -   `404 Not Found`: Secret with the provided key does not exist.
    -   `500 Internal Server Error`: An error occurred on the server.

**Example Request:**

```http
DELETE /secrets/mySecretKey
```

**Example Response (204 No Content):**

No content in the response body.

### Update a Secret

-   **Endpoint:** `PATCH /secrets/:key`
-   **Description:** Update the value of a secret by providing its key.
-   **Request Parameters:**
    -   `key`: The key of the secret to retrieve.
-   **Request Body:**
    -   `value`: The new value for the secret.
-   **Responses:**
    -   `204 No Content`: Secret successfully updated.
    -   `404 Not Found`: Secret with the provided key does not exist.
    -   `500 Internal Server Error`: An error occurred on the server.

**Example Request:**

```http
PATCH /secrets/mySecretKey
```

**Example Request Body:**

```json
{
    "value": "Updated Value"
}
```

**Example Response (204 No Content):**

No content in the response body.

### Create a Secret

-   **Endpoint:** `POST /secrets`
-   **Description:** Create a new secret.
-   **Request Body:**
    -   `key`: The key of the new secret.
    -   `value`: The new value for the secret.
-   **Responses:**
    -   `201 Created`: Secret successfully created. Returns the key of the created secret.
    -   `500 Internal Server Error`: An error occurred on the server.

**Example Request:**

```http
POST /secrets
```

**Example Request Body:**

```json
{
    "key": "NewSecretKey",
    "value": "New Secret Value"
}
```

**Example Response (201 Created):**

```json
{
    "key": "NewSecretKey"
}
```

## Users API

### Get All Users

-   **Endpoint:** `GET /users`
-   **Description:** Retrieve a list of all users.
-   **Responses:**
    -   `200 OK`: Successfully retrieved the list of users.
    -   `500 Internal Server Error`: An error occurred on the server.

**Example Request:**

```http
GET /users
```

**Example Response (200 OK):**

```json
[
    {
        "username": "johndoe",
        "hasWritePermissions": true
    },
    {
        "username": "janedoe",
        "hasWritePermissions": false
    }
]
```

### Get User Permissions

-   **Endpoint:** `GET /users/:username`
-   **Description:** Retrieve a user's permissions by providing their username.
-   **Request Parameters:**
    -   `username`: The username of the user to retrieve permissions for.
-   **Responses:**
    -   `200 OK`: Successfully retrieved the user's permissions. Returns an array of permissions.
    -   `404 Not Found`: User with the provided username does not exist.
    -   `500 Internal Server Error`: An error occurred on the server.

**Example Request:**

```http
GET /users/johndoe
```

**Example Response (200 OK):**

```json
["SELECT"]
```

### Delete user

-   **Endpoint:** `DELETE /users/:username`
-   **Description:**Delete a user by providing their username.
-   **Request Parameters:**
    -   `username`: The username of the user to delete.
-   **Responses:**
    -   `204 No Content`: User successfully deleted.
    -   `404 Not Found`: User with the provided username does not exist.
    -   `500 Internal Server Error`: An error occurred on the server.

**Example Request:**

```http
DELETE /users/johndoe
```

**Example Response (204 No Content):**

No content in the response body.

### Edit User Permissions

-   **Endpoint:** `PUT /users/:username`
-   **Description:** Edit a user's read/write permission by providing their username.
-   **Request Parameters:**
    -   `setWritePermissionTo`: A boolean indicating whether to set the write permission to `true` or `false`.
-   **Responses:**
    -   `200 OK`: User's permission successfully updated. Returns the updated user data.
    -   `404 Not Found`: User with the provided username does not exist.
    -   `500 Internal Server Error`: An error occurred on the server.

**Example Request:**

```http
PUT /users/johndoe
```

**Example Request Body:**

```json
{
    "setWritePermissionTo": true
}
```

**Example Response (200 OK):**

```json
{ "writePermission": true }
```

### Create User

-   **Endpoint:** `POST /users`
-   **Description:** Create a new user.
-   **Request Body:**

    -   `username`: The username of the new user.
    -   `hasWritePermissions`: A boolean indicating whether the user has write permissions.

-   **Responses:**
    -   `201 Created`: User successfully created. Returns the username of the created user.
    -   `500 Internal Server Error`: An error occurred on the server.

**Example Request:**

```http
POST /users
```

**Example Request Body:**

```json
{
    "username": "newuser",
    "hasWritePermissions": true
}
```

**Example Response (201 Created):**

```json
{
    "username": "newuser"
}
```
