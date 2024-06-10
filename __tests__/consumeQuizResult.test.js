const amqp = require('amqplib');
const consumeQuizResult = require('../consumers/consumeQuizResult');

jest.mock('amqplib');

describe('consumeQuizResult', () => {
  let mockChannel;
  let mockConnection;

  beforeAll(() => {
    mockChannel = {
      assertExchange: jest.fn().mockResolvedValue(),
      assertQueue: jest.fn().mockResolvedValue({ queue: 'test-queue' }),
      bindQueue: jest.fn().mockResolvedValue(),
      consume: jest.fn().mockImplementation((queue, callback) => {
        // Simulate receiving a message
        const msg = {
          content: Buffer.from('Test Message'),
          fields: { routingKey: 'quiz-score-notification' }
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

  test('consumeQuizResult should connect to RabbitMQ successfully and consume messages', async () => {
    const callback = jest.fn();
    const transporter = {}; // Mock transporter
    const senderEmail = 'test@example.com';

    await consumeQuizResult(amqp, callback, transporter, senderEmail);

    expect(amqp.connect).toHaveBeenCalled();
    expect(mockConnection.createChannel).toHaveBeenCalled();
    expect(mockChannel.assertExchange).toHaveBeenCalledWith('scoring-notification', 'direct', { durable: true });
    expect(mockChannel.assertQueue).toHaveBeenCalledWith('', { exclusive: false });
    expect(mockChannel.bindQueue).toHaveBeenCalledWith('test-queue', 'scoring-notification', 'quiz-score-notification');
    expect(mockChannel.consume).toHaveBeenCalled();
    expect(callback).toHaveBeenCalledWith('Test Message', transporter, senderEmail);
  });
});
