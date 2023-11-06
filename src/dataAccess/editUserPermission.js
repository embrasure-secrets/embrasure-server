/*
Function sets the write permission
of a database user.

If setting the write permission was 
successful an object with a writePermission
property is returned, otherwise it logs an error
*/

async function editUserPermission(client, username, hasWritePermissions) {
    const transaction = await client.transaction();

    try {
        if (hasWritePermissions) {
            await client.query(
                `GRANT INSERT, UPDATE, DELETE, SELECT ON public."Secrets" TO ${username};`,
                { transaction }
            );

            await client.query(`GRANT USAGE ON SEQUENCE "Secrets_id_seq" TO ${username}`, {
                transaction,
            });

            await transaction.commit();
            return { writePermission: true };
        } else {
            await client.query(
                `REVOKE INSERT, UPDATE, DELETE, SELECT ON public."Secrets" FROM ${username}`,
                { transaction }
            );

            await client.query(`REVOKE USAGE ON SEQUENCE "Secrets_id_seq" FROM ${username}`, {
                transaction,
            });

            await client.query(`GRANT SELECT ON public."Secrets" TO ${username};`, { transaction });

            await transaction.commit();
            return { writePermission: false };
        }
    } catch (error) {
        await transaction.rollback();
        console.error('Could not edit user permissions:', error.message);
    }
}

export default editUserPermission;
