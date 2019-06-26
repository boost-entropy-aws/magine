const AWS = require('aws-sdk');
const sns = new AWS.SNS({
  apiVersion: '2010-03-31'
});
const { TOPIC_ARN } = process.env;

exports.pub = async (message, response) => {
  const decoratedMessage = Object.assign({}, message, { response });
  const params = {
    Message: decoratedMessage,
    TopicArn: TOPIC_ARN
  };

  const snsPromise = sns.publish(params).promise();

  const messaged = await snsPromise;
  return messaged;
};
