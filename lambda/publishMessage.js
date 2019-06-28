const AWS = require('aws-sdk');
const { TOPIC_ARN, REGION } = process.env;
AWS.config.update({ region: REGION });
const sns = new AWS.SNS({
  apiVersion: '2010-03-31'
});


exports.pub = async (message, response) => {
  const messageObject = JSON.parse(message);
  const decoratedMessage = Object.assign({}, messageObject, { response });
  console.log('decoratedMessage', decoratedMessage);
  const params = {
    Message: JSON.stringify(decoratedMessage),
    TopicArn: TOPIC_ARN
  };

  const snsPromise = sns.publish(params).promise();

  const messaged = await snsPromise;
  return messaged;
};
