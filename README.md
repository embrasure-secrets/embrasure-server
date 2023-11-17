# Embrasure API

Welcome to the Embrasure Server API repository! This API allows you to manage secrets and users, providing CRUD operations for key-value pairs and user permissions.

## Getting Started

To get started with the Embrasure API, follow these steps:

1. Clone the repository:

    ```bash
    git clone https://github.com/your-username/embrasure-api.git
    ```

2. Install dependencies:

    ```bash
    cd embrasure-api
    npm install
    ```

3. Set up your environment:

    - Ensure that you have the required credentials from [the core Embrasure repo](https://github.com/embrasure-secrets/embrasure).
    - Review the environment variables in the `.env` file.

4. Run the application:

    ```bash
    serverless deploy
    ```

    The API endpoint logged into the console.

5. In the core Embrasure repo, paste the API endpoint logged into the console, up until "v1", into the `.env` file.

    Example:

    ```text
    API_ENDPOINT=https://example.execute-api.us-east-2.amazonaws.com/v1
    ```

## API Documentation

For detailed information on how to use the API, please refer to the [API Documentation](./src/documentation/api.md).

## Issues

If you encounter any issues or have suggestions, please open an [issue](https://github.com/embrasure-secrets/embrasure-server/issues).

## License

[MIT](https://choosealicense.com/licenses/mit/)
