/*
Given a secretKey and newSecretValue of type string, 
the updateSecret function will update
record in the secrets database
that has the specified value in the key column
and update the data in the value column
to the value of newSecretValue
*/

async function updateSecret(table, secretKey, newSecretValue) {
    try {
        const numberOfRecordsUpdated = await table.update(
            { value: newSecretValue },
            {
                where: {
                    key: secretKey,
                },
                limit: 1,
            }
        );

        return numberOfRecordsUpdated;
    } catch (error) {
        console.error('Error in updating record: ', error);
    }
}

export default updateSecret;
