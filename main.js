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

const senderEmail = process.env.MAIL_FROM_ADDRESS;
// Nodemailer transporter
const transporter = nodemailer.createTransport({
  host: process.env.MAIL_HOST,
  port: process.env.MAIL_PORT,
  secure: process.env.MAIL_PORT == "465",
  auth: {
    user: process.env.MAIL_USERNAME,
    pass: process.env.MAIL_PASSWORD,
  },
});

// Start consumers
consumeUpcomingQuiz(amqp, sendUpcomingQuizEmail, transporter, senderEmail);
consumeQuizResult(amqp, sendQuizResultEmail, transporter, senderEmail);