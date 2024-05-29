/*
  Ini untuk testing only.
  Publisher ini akan mengirimkan pesan ke RabbitMQ.

  Jalankan ini dengan perintah:
    node publishUpcomingQuiz.js
*/

require('dotenv').config();
const amqp = require('amqplib');

async function publishUpcomingQuiz() {
    try {
        const rabbitmqHost = process.env.RABBITMQ_HOST || 'rabbitmq';
        const queue = process.env.QUEUE_UPCOMING_QUIZ || 'upcoming_quiz';

        const connection = await amqp.connect(`amqp://${rabbitmqHost}`);
        const channel = await connection.createChannel();
        const message = 'Sebuah message upcoming quiz.';

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

publishUpcomingQuiz();