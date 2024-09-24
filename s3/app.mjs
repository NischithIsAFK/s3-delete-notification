import { SESClient, SendEmailCommand } from "@aws-sdk/client-ses";

const sesClient = new SESClient({ region: "us-east-1" }); // Change the region if necessary

export const handler = async (event) => {
  const { Records } = event;

  for (const record of Records) {
    const bucketName = record.s3.bucket.name;
    const objectKey = record.s3.object.key;

    // Construct the email parameters
    const params = {
      Destination: {
        ToAddresses: [process.env.DEST_EMAIL],
      },
      Message: {
        Body: {
          Text: {
            Data: `An object with key ${objectKey} was deleted from bucket ${bucketName}.`,
          },
        },
        Subject: { Data: "S3 Object Deleted Notification" },
      },
      Source: "nischith.212@gmail.com", // Use a verified email in SES
    };

    try {
      const command = new SendEmailCommand(params);
      await sesClient.send(command);
      console.log(`Email sent for deleted object: ${objectKey}`);
    } catch (error) {
      console.error(`Error sending email: ${error.message}`);
    }
  }

  return {
    statusCode: 200,
    body: JSON.stringify("Email notifications sent."),
  };
};
