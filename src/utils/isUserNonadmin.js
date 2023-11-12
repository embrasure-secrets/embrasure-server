import '../../loadEnv.js';
import { ListGroupsForUserCommand, IAMClient } from '@aws-sdk/client-iam';

async function isUserNonadmin(username) {
    const groupName = 'embrasure-developer';
    const iamClient = new IAMClient({
        // region: process.env.REGION,
        region: 'us-east-1',
        credentials: {
            accessKeyId: process.env.LOGS_WORKER_ACCESS_KEY,
            secretAccessKey: process.env.LOGS_WORKER_SECRET_ACCESS_KEY,
        },
    });

    try {
        const params = { UserName: username };
        console.log('before send - timeout issue here');
        const { Groups: GroupsArr } = await iamClient.send(new ListGroupsForUserCommand(params));
        console.log('after send');

        const groups = GroupsArr.map((group) => group.GroupName);

        return groups.includes(groupName);
    } catch (error) {
        console.error(`Couldn't check if ${username} is in ${groupName}`, error.message);
    }
}

// console.log(await isUserNonadmin('rob'));
export default isUserNonadmin;
