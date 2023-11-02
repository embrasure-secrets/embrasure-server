/*
If user is successfully created and granted permissions, returns 1. 
logs error otherwise.

*/
async function addUser(client, username, hasWritePermissions) {
    console.log('hasWritePermissions', hasWritePermissions);
    // Admin runs embrasure createuser --name bob
    // Http post request made to /users
    // under the hood -
    // some function runs (using sdk)so iam user is created,
    // some function runs (using sdk)to create access key and secret access key
    // NOW:
    // some other function runs so database user is created
    // rds_iam permission is granted
    // secondary permission is given

    // CREATE USER iamuser WITH LOGIN;
    // GRANT rds_iam TO iamuser;
    // GRANT rds_superuser TO iamuser;

    // reject username if it contains anything besides alphanumerics,
    // underscores, or hyphens
    const invalidCharacters = /[^A-Za-z0-9_-]/;
    // untested: what if username is very long, 64 chars+
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
        await client.query(
            `GRANT SELECT ON public."Secrets" TO ${username};`,

            { transaction }
        );

        if (hasWritePermissions) {
            await client.query(
                `GRANT INSERT, UPDATE, DELETE ON public."Secrets" TO ${username};`,

                { transaction }
            );
        }

        await transaction.commit();
        return 1;
    } catch (error) {
        await transaction.rollback();
        console.error('Could not create user:', error.message);
    }
}

export default addUser;
