/*
If user is successfully created and granted permissions, returns 1. 
logs error otherwise.
*/

async function addUser(client, username, hasWritePermissions) {
    // reject username if it contains anything besides alphanumerics,
    // underscores, or hyphens
    const invalidCharacters = /[^A-Za-z0-9_-]/;

    if (invalidCharacters.test(username)) {
        throw new Error(
            'Username may only contain alphanumeric characters, underscores, and hyphens.'
        );
    }

    const transaction = await client.transaction();

    try {
        await client.query(
            `CREATE USER ${username} WITH LOGIN;`,

            { transaction }
        );

        await client.query(
            `GRANT rds_iam TO ${username};`,

            { transaction }
        );

        if (hasWritePermissions) {
            await client.query(
                `GRANT INSERT, UPDATE, DELETE, SELECT ON public."Secrets" TO ${username};`,
                { transaction }
            );

            await client.query(`GRANT USAGE ON SEQUENCE "Secrets_id_seq" TO ${username}`, {
                transaction,
            });
        } else {
            await client.query(`GRANT SELECT ON public."Secrets" TO ${username};`, { transaction });
        }

        await transaction.commit();
        return 1;
    } catch (error) {
        await transaction.rollback();
        console.error('Could not create user:', error.message);
    }
}

export default addUser;
