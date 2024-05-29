/*
  Ini untuk testing only.
  Publisher ini akan mengirimkan pesan ke RabbitMQ.

  Jalankan ini dengan perintah:
    node publishQuizResult.js
*/

require('dotenv').config();
const amqp = require('amqplib');

async function publishQuizResult() {
    try {
        const rabbitmqHost = process.env.RABBITMQ_HOST || 'rabbitmq';
        const queue = process.env.QUEUE_QUIZ_RESULT || 'quiz_result';

        const connection = await amqp.connect(`amqp://${rabbitmqHost}`);
        const channel = await connection.createChannel();
        const message = 'Sebuah message quiz result.';

        await channel.assertQueue(queue, {
            durable: false
        });

        channel.sendToQueue(queue, Buffer.from(message));
        console.log(`[x] Sent ${message}`);

        setTimeout(() => {
            connection.close();
        }, 500);
    } catch (error) {
        console.error('Error:', error);
    }
}

publishQuizResult();