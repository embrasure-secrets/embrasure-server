# Embrasure API Documentation

This documentation provides information on the RESTful API endpoints for manaing secrets and users with the Embrasure Secrets API. Secrets are key-value pairs stored in a database, and users have permissions for accessing and managing secrets.

## Table of Contents

-   [Introduction](#introduction)
-   [Secrets API](#secrets-api)
    -   [Get All Secrets](#get-all-secrets)

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
