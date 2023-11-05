/*
Given a username of type string, 
the getUserPermissions function will return 
an object from the secrets database 
that shows the privileges granted
to the user for the Secrets table 
*/

async function getUserPermissions(client, username) {
    try {
        const queryResponse = await client.query(
            `SELECT grantee, privilege_type FROM information_schema.role_table_grants where grantee = '${username}' and table_name = 'Secrets'`
        );

        const permissionsArr = queryResponse[0].map((privilege) => privilege.privilege_type);
        return permissionsArr;
    } catch (error) {
        console.error('Error in getting user permissions: ', error);
    }
}

export default getUserPermissions;
