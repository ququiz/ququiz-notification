/*
    Service utama.
*/

require('dotenv').config();
const amqp = require('amqplib');

async function consumeUpcomingQuiz() {
    try {
        const rabbitmqHost = process.env.RABBITMQ_HOST || 'rabbitmq';
        const queue = process.env.QUEUE_UPCOMING_QUIZ || 'upcoming_quiz';

        const connection = await amqp.connect(`amqp://${rabbitmqHost}`);
        const channel = await connection.createChannel();

        await channel.assertQueue(queue, {
            durable: false
        });

        console.log(`[*] Waiting for messages in ${queue}. To exit press CTRL+C`);

        channel.consume(queue, (msg) => {
            console.log(`[x] Received ${msg.content.toString()}`);
            channel.ack(msg);
        }, {
            noAck: false
        });
    } catch (error) {
        console.error('Error:', error);
        setTimeout(consume, 10000); // Retry after 10 seconds
    }
}

async function consumeQuizResult() {
    try {
        const rabbitmqHost = process.env.RABBITMQ_HOST || 'rabbitmq';
        const queue = process.env.QUEUE_QUIZ_RESULT || 'quiz_result';

        const connection = await amqp.connect(`amqp://${rabbitmqHost}`);
        const channel = await connection.createChannel();

        await channel.assertQueue(queue, {
            durable: false
        });

        console.log(`[*] Waiting for messages in ${queue}. To exit press CTRL+C`);

        channel.consume(queue, (msg) => {
            console.log(`[x] Received ${msg.content.toString()}`);
            channel.ack(msg);
        }, {
            noAck: false
        });
    } catch (error) {
        console.error('Error:', error);
        setTimeout(consume, 10000); // Retry after 10 seconds
    }
}

consumeQuizResult();
consumeUpcomingQuiz();