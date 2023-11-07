# Embrasure API Documentation

This documentation provides information on the RESTful API endpoints for manaing secrets and users with the Embrasure Secrets API. Secrets are key-value pairs stored in a database, and users have permissions for accessing and managing secrets.

## Table of Contents

-   [Introduction](#introduction)
-   [Secrets API](#secrets-api)
    -   [Get All Secrets](#get-all-secrets)
    -   [Get a Single Secret](#get-a-single-secret)
    -   [Delete a Secret](#delete-a-secret)

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
    -   `200 OK`: Successfully retrieved the secret. Returns the secret data.
    -   `404 Not Found`: Secret with the provided key does not exist.
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
