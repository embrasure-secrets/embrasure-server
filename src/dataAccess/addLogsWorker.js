async function addLogsWorker(client) {
    const username = 'logsworker';
    const transaction = await client.transaction();
    try {
        const logsWorkerExistsQuery = await client.query(
            `SELECT FROM pg_catalog.pg_roles WHERE  rolname = 'logsworker'`,
            {
                transaction,
            }
        );
        const logsWorkerExists = logsWorkerExistsQuery[0].length > 0;
        console.log('logsWorkerExists results : ', logsWorkerExists);
        if (!logsWorkerExists) {
            await client.query(
                `CREATE USER ${username} WITH LOGIN`,

                { transaction }
            );

            await client.query(
                `GRANT rds_iam TO ${username};`,

                { transaction }
            );

            await client.query(
                `GRANT rds_superuser TO ${username};`,

                { transaction }
            );
        }

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
