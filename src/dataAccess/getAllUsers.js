async function getAllUsers(client) {
    try {
        const [result] = await client.query(
            "SELECT rolname FROM pg_roles WHERE rolcanlogin = true AND rolname != 'postgres' AND rolname != 'rdstopmgr' AND rolname != 'rdsadmin';"
        );

        const users = result.map((row) => row.rolname);
        return users;
    } catch (error) {
        console.error('Error getting all users:', error.message);
    }
}

export default getAllUsers;
