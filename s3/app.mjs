// Import AWS SDK v3 clients
const { SESClient, SendEmailCommand } = require("@aws-sdk/client-ses");
const { S3Client, GetObjectCommand } = require("@aws-sdk/client-s3");

const sesClient = new SESClient({ region: "us-east-1" });
const s3Client = new S3Client({ region: "us-east-1" });

exports.handler = async (event) => {
  console.log("S3 delete event: ", JSON.stringify(event, null, 2));

  const bucketName = process.env.BUCKET_NAME;
  const destinationEmail = process.env.DEST_EMAIL;
  
  try {
    const s3Record = event.Records[0].s3;
    const objectKey = s3Record.object.key;

    // Check if the file deleted has the `/img` prefix
    if (!objectKey.startsWith('img/')) {
      console.log(`Object ${objectKey} does not match the '/img' prefix.`);
      return;
    }

    // Prepare SES email content
    const emailParams = {
      Destination: {
        ToAddresses: [destinationEmail],
      },
      Message: {
        Body: {
          Text: {
            Data: `An object with key ${objectKey} was deleted from the S3 bucket ${bucketName}.`,
          },
        },
        Subject: {
          Data: "S3 Object Deleted",
        },
      },
      Source: "nischith.212@gmail.com", 
    };

    // Send email using SES
    const sendEmailCommand = new SendEmailCommand(emailParams);
    const response = await sesClient.send(sendEmailCommand);
    console.log("Email sent successfully: ", response);

  } catch (error) {
    console.error("Error processing S3 delete event: ", error);
  }
};
