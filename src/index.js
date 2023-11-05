import serverless from 'serverless-http';
import express from 'express';
import helmet from 'helmet';
// loadEnv should be probably moved to root directory
import cors from 'cors';
import './dataAccess/loadEnv.js';

import getAllSecrets from './dataAccess/getAllSecrets.js';
import getSecret from './dataAccess/getSecret.js';
import deleteSecret from './dataAccess/deleteSecret.js';
import updateSecret from './dataAccess/updateSecret.js';
import addSecret from './dataAccess/addSecret.js';
import getAllUsers from './dataAccess/getAllUsers.js';
import addUser from './dataAccess/addUser.js';
import getUserPermissions from './dataAccess/getUserPermissions.js';
import editUserPermission from './dataAccess/editUserPermission.js';
import deleteUser from './dataAccess/deleteUser.js';
import client from './dataAccess/dbClient.js';
import Secrets from './dataAccess/model.js';
import syncTable from './dataAccess/syncTable.js';

const app = express();

// Instantiate helmet
app.use(helmet());

// HTTP Strict Transport Security (HSTS) configuration
app.use(
    helmet.hsts({
        maxAge: 31536000, // 1 year in seconds
        includeSubDomains: true,
    })
);

// X-Content-Type-Options configuration
app.use(helmet.noSniff());

// X-Frame-Options configuration
app.use(helmet.frameguard({ action: 'deny' }));

// X-XSS-Protection configuration
app.use(helmet.xssFilter());

// Referrer Policy configuration
app.use(helmet.referrerPolicy({ policy: 'same-origin' }));

// Feature Policy configuration
app.use((req, res, next) => {
    res.setHeader('Feature-Policy', "geolocation 'none'; microphone 'none'");
    next();
});

// Optionally, hide the "X-Powered-By" header
app.disable('x-powered-by');

// Enable CORS
app.use(cors());

// Parse JSON request bodies
app.use(express.json());

// Parse URL-encoded request bodies
app.use(express.urlencoded({ extended: true }));

// Use request headers to connect to database
app.use((req, res, next) => {
    const dbUsername = req.header('db-username');
    const dbAuthToken = req.header('db-auth-token');
    const dbName = req.header('db-name');
    const dbHost = req.header('db-host');
    const dbPort = req.header('db-port');
    const dbClientValues = { dbName, dbHost, dbPort, dbUsername, dbAuthToken };
    const dbClient = client(dbClientValues);
    syncTable(dbClient);
    res.locals.dbClient = dbClient;
    res.locals.secretsTable = Secrets(dbClient);
    next();
});

// Get a single secret by key
app.get('/secrets/:key', async (req, res) => {
    try {
        const secretKey = req.params.key;
        const secret = await getSecret(res.locals.secretsTable, secretKey);
        if (secret === undefined) {
            res.status(404).json({ message: 'Secret not found' });
        } else {
            res.status(200).json(secret);
        }
    } catch (error) {
        res.status(500).json({ message: 'Internal Server Error' });
    }
});

// Get all secrets
app.get('/secrets', async (req, res) => {
    const secrets = await getAllSecrets(res.locals.secretsTable);
    res.json(secrets);
});

// Delete a secret by  key
app.delete('/secrets/:key', async (req, res) => {
    try {
        const secretKey = req.params.key;
        /* 
      deleteSecret returns 1 if a secret was found and deleted, 0 otherwise
      */
        const secretDeleted = !!(await deleteSecret(res.locals.secretsTable, secretKey));

        if (!secretDeleted) {
            res.status(404).json({ message: 'Secret could not be deleted or was not found.' });
        } else {
            res.status(204).send();
        }
    } catch (error) {
        res.status(404).json({ message: error.message });
    }
});

// Delete a secret by  key
app.delete('/users/:username', async (req, res) => {
    try {
        const { username } = req.params;
        /* 
    deleteUser returns 1 if a user was found and deleted, 0 otherwise
    */
        const userDeleted = !!(await deleteUser(res.locals.dbClient, username));

        if (!userDeleted) {
            res.status(404).json({ message: 'User could not be deleted or was not found.' });
        } else {
            res.status(204).send();
        }
    } catch (error) {
        res.status(404).json({ message: error.message });
    }
});

// Get all users
app.get('/users', async (req, res) => {
    const users = await getAllUsers(res.locals.dbClient);
    res.status(200).json(users);
});

// Specify a secret by key and update its value
app.patch('/secrets/:key', async (req, res) => {
    try {
        const secretKey = req.params.key;
        const secretValue = req.body.value;
        const secretUpdated = !!(await updateSecret(
            res.locals.secretsTable,
            secretKey,
            secretValue
        ));

        if (!secretUpdated) {
            res.status(404).json({ message: 'Secret could not be updated or was not found.' });
        } else {
            res.status(204).send();
        }
    } catch (error) {
        res.status(404).json({ message: error.message });
    }
});

// Create a secret
app.post('/secrets', async (req, res) => {
    try {
        const secretKey = req.body.key;
        const secretValue = req.body.value;
        const createdSecret = await addSecret(res.locals.secretsTable, secretKey, secretValue);

        if (!createdSecret) {
            res.status(500).json({ message: "Couldn't create secret." });
        } else {
            res.status(201).json({ key: createdSecret.key });
        }
    } catch (error) {
        res.status(500).json({ message: 'Internal Server Error' });
    }
});

// Create a user
app.post('/users', async (req, res) => {
    try {
        const usersCreated = await addUser(
            res.locals.dbClient,
            req.body.username,
            req.body.hasWritePermissions
        );
        res.status(201).json({ usersCreated });
    } catch (error) {
        res.status(404).json({ message: error.message });
    }
});

// Get a user's permissions by username
app.get('/users/:username', async (req, res) => {
    try {
        const { username } = req.params;

        const userPermissions = await getUserPermissions(res.locals.dbClient, username);

        if (userPermissions.length === 0) {
            res.status(404).json({
                message: 'User was not found',
            });
        } else {
            res.status(200).json(userPermissions);
        }
    } catch (error) {
        res.status(500).json({ message: 'Internal Server Error' });
    }
});

// Edit a user's read/write permission
app.post('/users/:username', async (req, res) => {
    try {
        const editPermissionResult = await editUserPermission(
            res.locals.dbClient,
            req.body.username,
            req.body.setWritePermissionTo
        );

        if (editPermissionResult === undefined) {
            res.status(404).json({
                message: 'User was not found',
            });
        } else {
            res.status(200).json(editPermissionResult);
        }
    } catch (error) {
        res.status(500).json({ message: 'Internal Server Error' });
    }
});

// app.listen(process.env.API_PORT, () => {
//     console.log(`Embrasure server running on port ${process.env.API_PORT}`);
// });

export const handler = serverless(app);
