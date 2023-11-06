const syncTable = async (dbClient) => {
    try {
        await dbClient.sync();
        console.log('Secrets table and audit log table are ready!');
    } catch (error) {
        console.error('Error in creating table: ', error);
    }
};

export default syncTable;
