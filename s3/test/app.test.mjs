const { handler } = require('../app.js');
const { SESClient, SendEmailCommand } = require('@aws-sdk/client-ses');

jest.mock('@aws-sdk/client-ses', () => {
  return {
    SESClient: jest.fn(() => ({
      send: jest.fn().mockResolvedValue({}),
    })),
    SendEmailCommand: jest.fn(),
  };
});

describe('Lambda Handler', () => {
  it('should send an email when an S3 object is deleted', async () => {
    const mockEvent = {
      Records: [
        {
          s3: {
            bucket: { name: 'test-bucket' },
            object: { key: 'test-object-key' },
          },
        },
      ],
    };

    const response = await handler(mockEvent);

    expect(SendEmailCommand).toHaveBeenCalledWith({
      Destination: {
        ToAddresses: [process.env.DEST_EMAIL],
      },
      Message: {
        Body: {
          Text: {
            Data: `An object with key test-object-key was deleted from bucket test-bucket.`,
          },
        },
        Subject: { Data: 'S3 Object Deleted Notification' },
      },
      Source: 'nischith.212@gmail.com',
    });

    expect(response).toEqual({
      statusCode: 200,
      body: JSON.stringify('Email notifications sent.'),
    });
  });
});
