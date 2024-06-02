require("dotenv").config();
const amqp = require("amqplib");

async function publishQuizResult() {
  try {
    const rabbitmqHost = process.env.RABBITMQ_HOST || "rabbitmq";
    const queue = process.env.QUEUE_QUIZ_RESULT || "quiz_result";

    const connection = await amqp.connect(`amqp://${rabbitmqHost}`);
    const channel = await connection.createChannel();

    const message = `{
        "user_emails": [
          "nahida020624q@gmail.com",
          "hutao020624q@gmail.com",
          "takoyakixpanz@gmail.com",
          "anya020624q@gmail.com",
          "komisan@gmail.com",
          "megumin020624q@gmail.com"
        ],
        "leaderboard": {
          "quiz_id": "1",
          "quiz_name": "Quiz Biology 101",
          "leaderboards": [
            {
              "email": "nahida020624q@gmail.com",
              "username": "nahida",
              "rank": 1,
              "score": 98
            },
            {
              "email": "hutao020624q@gmail.com",
              "username": "hutao",
              "rank": 2,
              "score": 95
            },
            {
              "email": "takoyakixpanz@gmail.com",
              "username": "azbagas",
              "rank": 3,
              "score": 94
            },
            {
              "email": "anya020624q@gmail.com",
              "username": "anya",
              "rank": 4,
              "score": 88
            },
            {
              "email": "komisan@gmail.com",
              "username": "komisan",
              "rank": 5,
              "score": 84
            },
            {
              "email": "megumin020624q@gmail.com",
              "username": "megumin",
              "rank": 6,
              "score": 80
            }
          ]
        }
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

publishQuizResult();