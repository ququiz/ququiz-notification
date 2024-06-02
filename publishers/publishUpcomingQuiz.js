require("dotenv").config();
const amqp = require("amqplib");

async function publishUpcomingQuiz() {
  try {
    const rabbitmqHost = process.env.RABBITMQ_HOST || "rabbitmq";
    const queue = process.env.QUEUE_UPCOMING_QUIZ || "upcoming_quiz";

    const connection = await amqp.connect(`amqp://${rabbitmqHost}`);
    const channel = await connection.createChannel();

    const message = `{ 
            "time": "D-1", 
            "name": "Quiz Biology 101", 
            "participants": [ 
                { 
                    "email": "hutao@gmail.com", 
                    "name": "Hu Tao" 
                }, 
                { 
                    "email": "nahida@gmail.com", 
                    "name": "Nahida" 
                }
            ]
        }`;

    await channel.assertQueue(queue, {
      durable: false,
    });

    channel.sendToQueue(queue, Buffer.from(message));
    console.log(`[x] Sent ${message}`);

    setTimeout(() => {
      connection.close();
    }, 500);
  } catch (error) {
    console.error("Error:", error);
  }
}

publishUpcomingQuiz();
