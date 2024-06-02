async function consumer(amqp, queue, callback, transporter, senderEmail) {
  try {
    const rabbitmqHost = process.env.RABBITMQ_HOST || "rabbitmq";

    const connection = await amqp.connect(`amqp://${rabbitmqHost}`);
    const channel = await connection.createChannel();

    await channel.assertQueue(queue, {
      durable: false,
    });

    console.log(`[*] Waiting for messages in ${queue}. To exit press CTRL+C`);

    channel.consume(
      queue,
      (msg) => {
        callback(msg.content.toString(), transporter, senderEmail);
        channel.ack(msg);
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