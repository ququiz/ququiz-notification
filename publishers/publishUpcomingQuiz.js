require("dotenv").config();
const amqp = require("amqplib");

async function publishUpcomingQuiz() {
  try {
    const rabbitmqHost = process.env.RABBITMQ_HOST;
    const connection = await amqp.connect(`amqp://${rabbitmqHost}`);
    const channel = await connection.createChannel();
    const exchange = "quiz.email.exchange";
    const exchangeType = "direct";
    const routingKey = "quiz.email.send";
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

    channel.assertExchange(exchange, exchangeType, {
      durable: true,
    });
    channel.publish(exchange, routingKey, Buffer.from(message));
    console.log(" [x] Sent %s:'%s'", routingKey, message);

    setTimeout(() => {
      connection.close();
    }, 500);
  } catch (error) {
    console.error("Error:", error);
  }
}

publishUpcomingQuiz();
