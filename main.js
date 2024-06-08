/*
    Service utama.
*/

require("dotenv").config();

const amqp = require("amqplib");
const nodemailer = require("nodemailer");
const consumeUpcomingQuiz = require("./consumers/consumeUpcomingQuiz");
const consumeQuizResult = require("./consumers/consumeQuizResult");
const sendUpcomingQuizEmail = require("./senders/sendUpcomingQuizEmail");
const sendQuizResultEmail = require("./senders/sendQuizResultEmail");

const senderEmail = process.env.MAIL_FROM_ADDRESS || 'ququiz.dev@gmail.com';
// Nodemailer transporter
const transporter = nodemailer.createTransport({
  host: process.env.MAIL_HOST || 'sandbox.smtp.mailtrap.io',
  port: process.env.MAIL_PORT || 2525,
  secure: process.env.MAIL_PORT == "465",
  auth: {
    user: process.env.MAIL_USERNAME || '1427f83ffe1fef',
    pass: process.env.MAIL_PASSWORD || 'b9d4f47573de85',
  },
});

// Start consumers
consumeUpcomingQuiz(amqp, sendUpcomingQuizEmail, transporter, senderEmail);
consumeQuizResult(amqp, sendQuizResultEmail, transporter, senderEmail);