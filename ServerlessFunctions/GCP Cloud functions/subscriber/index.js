// AWS SDK dependency is required for executing this GCP function in package.json
// Below GCP function is subscribed to the GCP publisher when an event is received
// The function performs the below tasks
// 1. Verifies the params received from the event
// 2. Fetches the users that falls into the admin group using Cognito service provider from aws sdk
// 3. Randomly selects any one admin from the admin list fetched in the 2nd step
// 4. It performs two queries in the supportQueries table(that maintains all the support/conversation history) in the DynamoDb table where partition key is referenceCode and senderId is the GSI
// In the first query, the support request for the particular user with it's message and linked admin is inserted in DynamoDb 
// In the second query, a default reply from the linked admin is generated for the user and inserted in the DynamoDb
// Please note that the DynamoDb table have streams enabled which is used for the real-time conversation between the users and admin/support agents

const functions = require('@google-cloud/functions-framework');
const AWS = require('aws-sdk');

AWS.config.update({
  region: 'us-east-1', // Cognito user pool's region
  accessKeyId: process.env.AWS_ACCESS_KEY_ID, // Stored securely in environment variables
  secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY, // Stored securely in environment variables
  sessionToken: process.env.SESSION_TOKEN // Stored securely in environment variables
});

// Initializing the DynamoDb client
const dynamoDb = new AWS.DynamoDB.DocumentClient();
const USER_POOL_ID = 'us-east-1_POOL_ID'; // The Cognito User Pool ID
const ADMIN_GROUP_NAME = 'admin';
// Initialize the CognitoIdentityServiceProvider
const cognito = new AWS.CognitoIdentityServiceProvider();

// Register a CloudEvent callback with the Functions Framework that will
// be executed when the Pub/Sub trigger topic receives a message.
functions.cloudEvent('helloPubSub',async (cloudEvent) => {
  // The Pub/Sub message is passed as the CloudEvent's data payload.
  const base64Data = cloudEvent.data.message.data;
  const message = base64Data ? JSON.parse(Buffer.from(base64Data, 'base64').toString()) : {};
  console.log('Received message:', message);
  // Validate message format
   if (!message.referenceCode || !message.message || !message.userId) {
      console.error('Invalid message format');
      return;
   }
    const adminUsers = await getAdminUsers();
     if (adminUsers.length === 0) {
      console.error('No admin users found.');
      return;
    }
    console.log(adminUsers);
    const randomAdmin = adminUsers[Math.floor(Math.random() * adminUsers.length)];
    console.log(`Randomly selected admin: ${randomAdmin.Username}`);
    console.log(randomAdmin);
    const adminEmail = randomAdmin.Attributes.find(attr => attr.Name === 'email').Value;
    console.log(adminEmail);
    
   //Inserting the first record for the user and linked support agent in the DynamoDb table supportQueries
   const params = {
      TableName: 'supportQueries',
      Item: {
        referenceCode: message.referenceCode,
        timestamp: Date.now(),
        message: message.message,
        userId: message.userId,
        senderId: message.userId,
        recipientId: adminEmail
      }
    };

    await dynamoDb.put(params).promise();
    console.log('Record inserted into DynamoDB:', params.Item);

    //Inserting one more record for the Admin auto reply and get an admin as sender Entry in the table
    //Because we have added GSI on senderId so this entry will help in fethcing referenceCode for admin
    const params2 = {
      TableName: 'supportQueries',
      Item: {
        referenceCode: message.referenceCode,
        timestamp: Date.now(),
        message: 'Hi Your request will be processed shortly',
        userId: message.userId,
        senderId: adminEmail,
        recipientId: message.userId
      }
    };
    await dynamoDb.put(params2).promise();
    console.log('Record inserted for the admin into DynamoDB:', params2.Item);
});

// Helper function that fetches the users in the group admin
async function getAdminUsers() {
  const params = {
    UserPoolId: USER_POOL_ID,
    GroupName: ADMIN_GROUP_NAME, // Fetch users from admin group
  };

  const adminUsers = [];
  let response;

  do {
    response = await cognito.listUsersInGroup(params).promise();
    adminUsers.push(...response.Users);
    params.NextToken = response.NextToken;
  } while (response.NextToken);

  return adminUsers;
}
