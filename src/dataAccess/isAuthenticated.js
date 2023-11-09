async function isAuthenticated(client) {
    try {
        await client.authenticate();
        return true;
    } catch (error) {
        return false;
    }
}

export default isAuthenticated;
