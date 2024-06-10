require("dotenv").config();

async function consumeUpcomingQuiz(amqp, callback, transporter, senderEmail) {
  try {
    const rabbitmqHost = process.env.RABBITMQ_HOST || 'guest:guest@ququiz-rabbitmq:5672';
    const connection = await amqp.connect(`amqp://${rabbitmqHost}`);
    const channel = await connection.createChannel();
    const exchange = "quiz.email.exchange";
    const exchangeType = "direct";
    const routingKey = "quiz.email.send";
    const queue = "quiz.email.queue";

    await channel.assertExchange(exchange, exchangeType, {
      durable: true,
    });

    const q = await channel.assertQueue(queue, { exclusive: false });

    console.log(`[*] Waiting for messages in ${q.queue}. To exit press CTRL+C`);

    await channel.bindQueue(q.queue, exchange, routingKey);

    channel.consume(
      q.queue,
      async (msg) => {
        if (msg.content) {
          console.log(" [x] %s: Message Accepted", msg.fields.routingKey);
          console.log(msg.content.toString());
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
    setTimeout(() => {
      consumeUpcomingQuiz(amqp, callback, transporter, senderEmail);
    }, 10000); // Retry after 10 seconds
  }
}

module.exports = consumeUpcomingQuiz;
