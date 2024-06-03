const fs = require("fs");
const mustache = require("mustache");

const upcomingQuizEmailTemplate = fs.readFileSync(
  "./templates/upcomingQuizEmailTemplate.html",
  "utf8"
);

/* 
  Format msgObj example:
  { 
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
  }
*/

const timeDict = {
  "D-1": "1 day",
  "T-30": "30 minutes",
  "T-1": "1 minute",
};

async function sendUpcomingQuizEmail(rabbitMessage, transporter, senderEmail) {
  try {
    // Convert string of message rabbitmq to object
    let msgObj = JSON.parse(rabbitMessage);

    // Validate the structure of msgObj
    if (!msgObj.time || !msgObj.name || !Array.isArray(msgObj.participants)) {
      throw new Error("Invalid message format");
    }
  
    // Dapatkan participants
    let participants = msgObj.participants;

    // Send email to each participant
    const emailPromises = participants.map((participant) => {
      const htmlContent = mustache.render(upcomingQuizEmailTemplate, {
        name: participant.name,
        quizName: msgObj.name,
        timeLeft: timeDict[msgObj.time],
      });

      const emailOptions = {
        from: `QuQuiz <${senderEmail}>`,
        to: participant.email,
        subject: "Upcoming Quiz!",
        html: htmlContent,
        attachments: [
          {
            filename: "ququiz_logo.png",
            path: "./assets/ququiz_logo.png",
            cid: "ququizLogo@ququiz",
          },
        ],
      };

      return transporter.sendMail(emailOptions)
        .then(info => {
          console.log(`Email sent to ${participant.email}: ${info.response}`);
        })
        .catch(error => {
          console.error(`Error sending email to ${participant.email}:`, error);
        });
    });

    // Await all email send promises
    await Promise.all(emailPromises);
    console.log("All emails processed");
  } catch (error) {
    console.error("Error processing message:", error);
  }
}

module.exports = sendUpcomingQuizEmail;