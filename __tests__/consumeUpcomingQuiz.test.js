const amqp = require('amqplib');
const consumeUpcomingQuiz = require('../consumers/consumeUpcomingQuiz');

jest.mock('amqplib');

describe('consumeUpcomingQuiz', () => {
  let mockChannel;
  let mockConnection;

  beforeAll(() => {
    mockChannel = {
      assertExchange: jest.fn().mockResolvedValue(),
      assertQueue: jest.fn().mockResolvedValue({ queue: 'quiz.email.queue' }),
      bindQueue: jest.fn().mockResolvedValue(),
      consume: jest.fn().mockImplementation((queue, callback) => {
        // Simulate receiving a message
        const msg = {
          content: Buffer.from('Test Message'),
          fields: { routingKey: 'quiz.email.send' }
        };
        callback(msg);
      }),
    };

    mockConnection = {
      createChannel: jest.fn().mockResolvedValue(mockChannel),
      close: jest.fn().mockResolvedValue(),
    };

    amqp.connect.mockResolvedValue(mockConnection);
  });

  test('consumeUpcomingQuiz should connect to RabbitMQ successfully and consume messages', async () => {
    const callback = jest.fn();
    const transporter = {}; // Mock transporter
    const senderEmail = 'test@example.com';

    await consumeUpcomingQuiz(amqp, callback, transporter, senderEmail);

    expect(amqp.connect).toHaveBeenCalled();
    expect(mockConnection.createChannel).toHaveBeenCalled();
    expect(mockChannel.assertExchange).toHaveBeenCalledWith('quiz.email.exchange', 'direct', { durable: true });
    expect(mockChannel.assertQueue).toHaveBeenCalledWith('quiz.email.queue', { exclusive: false });
    expect(mockChannel.bindQueue).toHaveBeenCalledWith('quiz.email.queue', 'quiz.email.exchange', 'quiz.email.send');
    expect(mockChannel.consume).toHaveBeenCalled();
    expect(callback).toHaveBeenCalledWith('Test Message', transporter, senderEmail);
  });
});
