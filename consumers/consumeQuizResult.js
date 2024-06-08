require("dotenv").config();

async function consumeQuizResult(amqp, callback, transporter, senderEmail) {
  try {
    const rabbitmqHost = process.env.RABBITMQ_HOST || 'guest:guest@ququiz-rabbitmq:5672';
    const connection = await amqp.connect(`amqp://${rabbitmqHost}`);
    const channel = await connection.createChannel();
    const exchange = "scoring-notification";
    const exchangeType = "topic";
    const routingKey = "quiz-score-notification";

    await channel.assertExchange(exchange, exchangeType, {
      durable: true,
    });

    const q = await channel.assertQueue("", { exclusive: false });

    console.log(`[*] Waiting for messages in ${q.queue}. To exit press CTRL+C`);

    await channel.bindQueue(q.queue, exchange, routingKey);

    channel.consume(
      q.queue,
      async (msg) => {
        if (msg.content) {
          console.log(" [x] %s: Message Accepted", msg.fields.routingKey);
          try {
            await callback(msg.content.toString(), transporter, senderEmail);
          } catch (err) {
            console.error("Error handling message:", err);
          }
        }
      },
      { noAck: true }
    );
  } catch (error) {
    console.error("Error:", error);
    setTimeout(consumeQuizResult, 10000); // Retry after 10 seconds
  }
}

module.exports = consumeQuizResult;
