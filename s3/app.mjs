const AWS = require("aws-sdk");
const ses = new AWS.SES();

exports.handler = async (event) => {
  const bucketName = process.env.BUCKET_NAME;
  const destEmail = process.env.DEST_EMAIL;

  // Extract object information from the event
  const records = event.Records;
  const deletedFiles = records.map((record) => record.s3.object.key);

  // Email subject and body
  const emailSubject = `Object Deleted from S3 Bucket: ${bucketName}`;
  const emailBody =
    `The list of objects were deleted in bucket ${bucketName} with the prefix /img are:\n\n` +
    deletedFiles.join("\n");

  // SES Email parameters
  const params = {
    Destination: {
      ToAddresses: [destEmail],
    },
    Message: {
      Body: {
        Text: { Data: emailBody },
      },
      Subject: { Data: emailSubject },
    },
    Source: destEmail,
  };

  try {
    await ses.sendEmail(params).promise();
    console.log("Email sent successfully.");
  } catch (error) {
    console.error("Error sending email:", error);
    throw new Error("Failed to send email");
  }

  return {
    statusCode: 200,
    body: JSON.stringify({ message: "Email sent successfully" }),
  };
};
