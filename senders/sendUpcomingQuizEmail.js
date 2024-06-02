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
  // Convert string of message rabbitmq to object
  let msgObj = JSON.parse(rabbitMessage);

  // Dapatkan participants
  let participants = msgObj.participants;

  // Kirim email ke setiap participant
  participants.forEach((participant) => {
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

    transporter.sendMail(emailOptions, (error, info) => {
      if (error) {
        console.error("Error:", error);
      } else {
        console.log("Email sent: " + info.response);
      }
    });
  });
}

module.exports = sendUpcomingQuizEmail;