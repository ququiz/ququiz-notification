async function consumer(amqp, queue, callback, transporter, senderEmail) {
  try {
    const rabbitmqHost = process.env.RABBITMQ_HOST || "ququiz-rabbitmq";

    const connection = await amqp.connect(`amqp://${rabbitmqHost}`);
    const channel = await connection.createChannel();

    await channel.assertQueue(queue, {
      durable: false,
    });

    console.log(`[*] Waiting for messages in ${queue}. To exit press CTRL+C`);

    channel.consume(
      queue,
      (msg) => {
        if (msg !== null) {
          try {
            callback(msg.content.toString(), transporter, senderEmail);
            channel.ack(msg);
          } catch (callbackError) {
            console.error("Error in callback:", callbackError);
            channel.nack(msg, false, false);
          }
        }
      },
      {
        noAck: false,
      }
    );
  } catch (error) {
    console.error("Error:", error);
    setTimeout(consumer, 10000); // Retry after 10 seconds
  }
}

module.exports = consumer;
