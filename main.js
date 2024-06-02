/*
    Service utama.
*/

require("dotenv").config();

const amqp = require("amqplib");
const nodemailer = require("nodemailer");
const consumer = require("./consumers/consumer");
const sendUpcomingQuizEmail = require("./senders/sendUpcomingQuizEmail");
// const sendQuizResultEmail = require("./senders/sendQuizResultEmail");

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

// Queue names
const queueUpcomingQuiz = process.env.QUEUE_UPCOMING_QUIZ || "upcoming_quiz";
// const queueQuizResult = process.env.QUEUE_QUIZ_RESULT || "quiz_result";

// Start consumers
consumer(amqp, queueUpcomingQuiz, sendUpcomingQuizEmail, transporter, senderEmail);
// consumer(amqp, queueQuizResult, sendQuizResultEmail, transporter, senderEmail);