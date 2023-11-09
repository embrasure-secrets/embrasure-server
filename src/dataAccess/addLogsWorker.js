async function addLogsWorker(client) {
    const username = 'logsworker';
    const transaction = await client.transaction();

    try {
        await client.query(
            `CREATE USER ${username} WITH LOGIN`,

            { transaction }
        );

        await client.query(
            `GRANT rds_iam TO ${username};`,

            { transaction }
        );

        await client.query(
            `GRANT INSERT, UPDATE, DELETE, SELECT ON public."Logs" TO ${username};`,
            { transaction }
        );

        await client.query(`GRANT USAGE ON SEQUENCE "Logs_id_seq" TO ${username}`, {
            transaction,
        });

        await transaction.commit();
        return 1;
    } catch (error) {
        await transaction.rollback();
        throw error;
    }
}

export default addLogsWorker;
