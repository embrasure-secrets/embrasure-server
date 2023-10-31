import serverless from 'serverless-http';
import express from 'express';
// loadEnv should be probably moved to root directory
import cors from 'cors';
import '../utils/rds/loadEnv.js';

import getAllSecrets from '../utils/rds/getAllSecrets.js';
import getSecret from '../utils/rds/getSecret.js';
import deleteSecret from '../utils/rds/deleteSecret.js';
import updateSecret from '../utils/rds/updateSecret.js';
import addSecret from '../utils/rds/addSecret.js';
import addUser from '../utils/rds/addUser.js';
import client from '../utils/rds/dbClient.js';
import Secrets from '../utils/rds/model.js';

const app = express();

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use((req, res, next) => {
    // console.log('req.headers is: ', req.headers);
    const dbUsername = req.header('db-username');
    const dbAuthToken = req.header('db-auth-token');
    const dbName = req.header('db-name');
    const dbHost = req.header('db-host');
    const dbPort = req.header('db-port');
    const dbClientValues = { dbName, dbHost, dbPort, dbUsername, dbAuthToken };
    const dbClient = client(dbClientValues);
    res.locals.dbClient = dbClient;
    res.locals.secretsTable = Secrets(dbClient);
    next();
});

app.get('/secret', async (req, res) => {
    try {
        const secretKey = req.query.key;
        const secret = await getSecret(res.locals.secretsTable, secretKey);
        if (secret === undefined) {
            throw new Error('Secret not found');
        }
        res.json(secret);
    } catch (error) {
        res.status(404).json({ message: error.message });
    }
});

app.get('/secrets', async (req, res) => {
    const secrets = await getAllSecrets(res.locals.secretsTable);
    res.json(secrets);
});

app.delete('/secret', async (req, res) => {
    try {
        const secretKey = req.body.key;
        /* 
        deleteSecret returns 1 if a secret was found and deleted, 0 otherwise
        */
        const secretDeleted = !!(await deleteSecret(res.locals.secretsTable, secretKey));
        if (!secretDeleted) {
            throw new Error('Secret could not be deleted or was not found.');
        }
        res.status(204).json({});
    } catch (error) {
        res.status(404).json({ message: error.message });
    }
});

/*
https://sequelize.org/docs/v7/querying/update/#updating-a-row-using-modelupdate
According to this link, `Model#update` only updates the fields that you specify, so it's more appropriate to use `PATCH` than `PUT`.

Secret key and value are sent in JSON request body.
*/
app.patch('/secret', async (req, res) => {
    try {
        const secretKey = req.body.key;
        const secretValue = req.body.value;
        const secretUpdated = !!(await updateSecret(
            res.locals.secretsTable,
            secretKey,
            secretValue
        ));

        if (!secretUpdated) {
            throw new Error('Secret could not be updated or was not found.');
        }
        // returns no content
        res.status(204).json({});
    } catch (error) {
        res.status(404).json({ message: error.message });
    }
});

// Returns secret key. Does not return secret value
app.post('/secrets', async (req, res) => {
    try {
        const secretKey = req.body.key;
        const secretValue = req.body.value;

        const createdSecret = await addSecret(res.locals.secretsTable, secretKey, secretValue);
        if (!createdSecret) throw new Error("Couldn't create secret.");

        res.status(201).json({ key: createdSecret.key });
    } catch (error) {
        res.status(404).json({ message: error.message });
    }
});

app.post('/users', async (req, res) => {
    try {
        const usersCreated = await addUser(res.locals.dbClient, req.body.username);
        res.status(201).json({ usersCreated });
    } catch (error) {
        res.status(404).json({ message: error.message });
    }
});

// app.listen(process.env.API_PORT, () => {
//     console.log(`Embrasure server running on port ${process.env.API_PORT}`);
// });

// module.exports.handler = serverless(app);

export const handler = serverless(app);
