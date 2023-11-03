/*
Given a username of type string, 
the deleteUser function will drop the
database-level user from the database 
with the specified name.
*/

async function deleteUser(client, username) {
    const invalidCharacters = /[^A-Za-z0-9_-]/;
    if (invalidCharacters.test(username)) {
        throw new Error(
            'Username may only contain alphanumeric characters, underscores, and hyphens.'
        );
    }

    const transaction = await client.transaction();

    try {
        const revokeQuery = await client.query(
            `REVOKE INSERT, UPDATE, DELETE, SELECT ON public."Secrets" FROM ${username};`
        );

        console.log('revoke query', revokeQuery);

        const dropQuery = await client.query(`DROP ROLE ${username}`);
        console.log('drop query', dropQuery);

        await transaction.commit();
        return 1;
    } catch (error) {
        await transaction.rollback();
        console.error('Error in deleting user: ', error);
    }
}

export default deleteUser;
