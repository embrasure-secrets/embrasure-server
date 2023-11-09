import express from 'express';
import addUser from '../dataAccess/addUser.js';
import deleteUser from '../dataAccess/deleteUser.js';
import editUserPermission from '../dataAccess/editUserPermission.js';
import getUserPermissions from '../dataAccess/getUserPermissions.js';
import getAllUsers from '../dataAccess/getAllUsers.js';

const usersRouter = express.Router();

// Get a user's permissions by username
usersRouter.get('/:username', async (req, res, next) => {
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
    next();
});

// Get all users
usersRouter.get('/', async (req, res, next) => {
    try {
        const users = await getAllUsers(res.locals.dbClient);
        res.status(200).json(users);
    } catch (error) {
        res.status(500).json({ message: 'Internal Server Error' });
    }
    next();
});

// Create a user
usersRouter.post('/', async (req, res, next) => {
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
    next();
});

// Edit a user's read/write permission
usersRouter.put('/:username', async (req, res, next) => {
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
    next();
});

// Delete a user by username
usersRouter.delete('/:username', async (req, res, next) => {
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
    next();
});

export default usersRouter;
