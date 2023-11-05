import serverless from 'serverless-http';
import express from 'express';
import helmet from 'helmet';
// loadEnv should be probably moved to root directory
import cors from 'cors';
import './dataAccess/loadEnv.js';

import secretsRouter from './routes/secrets.js';
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

app.use('/secrets', secretsRouter);
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
