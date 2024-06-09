const sendUpcomingQuizEmail = require('../senders/sendUpcomingQuizEmail');

jest.mock('fs');

describe('sendUpcomingQuizEmail', () => {
  let mockTransporter;

  beforeAll(() => {
    mockTransporter = {
      sendMail: jest.fn().mockResolvedValue({ response: '250 OK' }),
    };

    // Spy on console.error
    consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
  });

  afterEach(() => {
    // Clear the mock calls after each test
    mockTransporter.sendMail.mockClear();
    consoleErrorSpy.mockClear();
  });

  afterAll(() => {
    // Restore console.error to its original implementation after all tests are done
    consoleErrorSpy.mockRestore();
  });

  test('should console error for invalid message format', async () => {
    const invalidRabbitMessage = JSON.stringify({
      time: 'D-1',
      name: 'Quiz Biology 101',
      participants: 'invalid_format',
    });

    const senderEmail = 'sender@example.com';

    await sendUpcomingQuizEmail(invalidRabbitMessage, mockTransporter, senderEmail)

    // Assert that console.error was called with the expected error message
    expect(consoleErrorSpy).toHaveBeenCalledWith('Error processing message:', expect.any(Error));
    expect(consoleErrorSpy.mock.calls[0][1].message).toBe('Invalid message format');
  });
});
