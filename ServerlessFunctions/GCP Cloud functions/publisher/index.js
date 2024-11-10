// AWS SDK,Cloud GCP pubsub,jsonwebtoken dependencies are required for executing this GCP function in package.json
// Below GCP cloud function receives the support request for a reference code checks if it exists or not
// If the support request is new the request is pushed to the pub sub topic named support where it will be consumed for further processing by the subscriber

const functions = require('@google-cloud/functions-framework');
const { PubSub } = require('@google-cloud/pubsub');
const AWS = require('aws-sdk');
const pubsub = new PubSub();
const jwt = require('jsonwebtoken');

AWS.config.update({
  region: 'us-east-1', // Cognito user pool's region
  accessKeyId: process.env.AWS_ACCESS_KEY_ID, // Stored securely in environment variables
  secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY, // Stored securely in environment variables
  sessionToken: process.env.SESSION_TOKEN // Stored securely in environment variables
});

// Initializing the DynamoDb client
const dynamoDb = new AWS.DynamoDB.DocumentClient();
exports.publishMessage = async (req, res) => {
  
  //CORS configuration
  res.set('Access-Control-Allow-Origin', '*');
  res.set('Access-Control-Allow-Methods', 'POST');
  res.set('Access-Control-Allow-Headers', 'Authorization, Content-Type');
  console.log('The Request is:');
  console.log(req);
  console.log(req.body);
  if (req.method === 'OPTIONS') {
    res.status(204).send('');
    return;
  }

  // Extract Authorization header
  const authHeader = req.get('Authorization');
  if (!authHeader) {
    return res.status(401).send('Authorization header is missing');
  }
  console.log(authHeader);
  //Note:- If the token is of type "Bearer <token>" Then this will be applicable >> authHeader.split(' ')[1];
  const token = authHeader; // Assuming "<token>"
  let userId;
  
  // Proceed with your Cloud Function logic
  // Topic in which the message will be pushed
  const topicName = 'support';

  //Checking if there is a message present or not in the request body
  if (!req.body) {
    return res.status(400).send('Message is required');
  }

  // Getting the reference Code from the body
  const referenceCode = req.body.referenceCode;
  console.log(referenceCode);

  // Preparing the query to check if there is already an support request submitted for the received referenceCode
  const checkParams = {
    TableName: 'supportQueries',
    KeyConditionExpression: 'referenceCode = :referenceCodeVal',
    ExpressionAttributeValues: {
      ':referenceCodeVal': referenceCode,
    },
    Limit: 1
  };

  try {
    // Decoding the token 
    const decodedToken = jwt.decode(token);
    console.log('Decoded token is:')
    console.log(decodedToken);

    //Fetching the email from the token principle
    userId = decodedToken?.email;
    if (!userId) {
      throw new Error('User ID not found in token');
    }
    
    // Performing the query based on the params condition defined above in checkParams
    const recordForReferenceCode = await dynamoDb.query(checkParams).promise();
    console.log(recordForReferenceCode);

    if (recordForReferenceCode.Items && recordForReferenceCode.Items.length > 0) {
      //If the support request is already submitted for the referenceCode  
      console.log(`Record with referenceCode ${referenceCode} already exists. Skipping insertion.`);
      return res.status(400).send(`Support already in progress for reference Code ${referenceCode}`);
    }

    // Initializing the topic of the GCP pub-sub
    const topic = pubsub.topic(topicName);

    // Preparing the message payload with the request body and the userId
    const messagePayload = {
      ...req.body,
      userId // Add the extracted userId (email) to the message
    };

    console.log('The message body that will be published is:');
    console.log(messagePayload);
    const messageBuffer = Buffer.from(JSON.stringify(messagePayload));

    //Publishing the message to the defined topic
    await topic.publish(messageBuffer);
    console.log("Successfully published the message to the topic");
    return res.status(200).send(`Message published to ${topicName}`);
  } catch (error) {
    //If there is an error while publishing the topic
    console.error('Error publishing message:', error);
    return res.status(500).send('Error publishing message');
  }
};

