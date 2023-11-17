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
            const grantQuery = await client.query(
                `GRANT INSERT, UPDATE, DELETE, SELECT ON public."Secrets" TO ${username};`,
                { transaction }
            );
            console.log('grantQuery is: ', grantQuery);
            const grantSeqPrivel = await client.query(
                `GRANT USAGE ON SEQUENCE "Secrets_id_seq" TO ${username}`,
                {
                    transaction,
                }
            );
            console.log('grantSeqPrivel is: ', grantSeqPrivel);
            await transaction.commit();
            return { writePermission: true };
        } else {
            const revokeQuery = await client.query(
                `REVOKE INSERT, UPDATE, DELETE, SELECT ON public."Secrets" FROM ${username}`,
                { transaction }
            );
            console.log('revokeQuery is: ', revokeQuery);
            const revokeSeqPrivel = await client.query(
                `REVOKE USAGE ON SEQUENCE "Secrets_id_seq" FROM ${username}`,
                {
                    transaction,
                }
            );
            console.log('revokeSeqPrivel is: ', revokeSeqPrivel);
            const grantSecPrivel = await client.query(
                `GRANT SELECT ON public."Secrets" TO ${username};`,
                { transaction }
            );
            console.log('grantSeqPrivel is: ', grantSecPrivel);
            await transaction.commit();
            return { writePermission: false };
        }
    } catch (error) {
        await transaction.rollback();
        console.error('Could not edit user permissions:', error.message);
    }
}

export default editUserPermission;
