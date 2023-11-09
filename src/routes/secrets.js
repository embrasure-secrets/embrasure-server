import express from 'express';
import getSecret from '../dataAccess/getSecret.js';
import getAllSecrets from '../dataAccess/getAllSecrets.js';
import deleteSecret from '../dataAccess/deleteSecret.js';
import updateSecret from '../dataAccess/updateSecret.js';
import addSecret from '../dataAccess/addSecret.js';

const secretsRouter = express.Router();

// Get a single secret by key
secretsRouter.get('/:key', async (req, res, next) => {
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
    next();
});

// Get all secrets
secretsRouter.get('/', async (req, res, next) => {
    try {
        const secrets = await getAllSecrets(res.locals.secretsTable);
        res.json(secrets);
    } catch (error) {
        res.status(404).json({ message: error.message });
    }
    next();
});

// Delete a secret by  key
secretsRouter.delete('/:key', async (req, res, next) => {
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
    next();
});

// Specify a secret by key and update its value
secretsRouter.patch('/:key', async (req, res, next) => {
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
    next();
});

// Create a secret
secretsRouter.post('/', async (req, res, next) => {
    console.log('req body', req.body);
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
    next();
});

export default secretsRouter;
