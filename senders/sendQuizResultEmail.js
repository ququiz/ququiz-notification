const fs = require("fs");
const mustache = require("mustache");

const quizResultEmailTemplate = fs.readFileSync(
  "./templates/quizResultEmailTemplate.html",
  "utf8"
);

const rowNormal = fs.readFileSync(
  "./templates/_quizResultLeaderboardTableRowNormal.html",
  "utf8"
);
const rowStrong = fs.readFileSync(
  "./templates/_quizResultLeaderboardTableRowStrong.html",
  "utf8"
);

const maxLeaderboardRows = 5;

/* 
  Format msgObj example:
  {
    "user_emails": [
      "nahida@gmail.com",
      "hutao@gmail.com"
    ],
    "leaderboard": {
      "quiz_id": "1",
      "quiz_name": "Quiz Scalable",
      "leaderboards": [
        {
          "email": "nahida@gmail.com",
          "username": "nahida",
          "rank": 1,
          "score": 80
        },
        {
          "email": "hutao@gmail.com",
          "username": "hutao",
          "rank": 2,
          "score": 70
        }
      ]
    }
  }
*/

async function sendQuizResultEmail(rabbitMessage, transporter, senderEmail) {
  // Convert string of message rabbitmq to object
  let msgObj = JSON.parse(rabbitMessage);

  // Dapatkan leaderboard array
  let leaderboards = msgObj.leaderboard.leaderboards;

  // Sort leaderboards by rank (memastikan)
  leaderboards.sort((a, b) => a.rank - b.rank);

  // Make array of object containing user_email in msgObj.user_emails and their username from leaderboards
  let participants = [];
  msgObj.user_emails.forEach((email) => {
    let participant = leaderboards.find((leaderboard) => leaderboard.email === email);
    if (participant) {
      participants.push({
        email: participant.email,
        username: participant.username,
        rank: participant.rank,
        score: participant.score,
      });
    } else {
      // Emailnya ada di msgObj.user_emails tapi tidak ada di leaderboards
      participants.push({
        email: email,
        username: email,
        rank: 1000, // Set rank to 1000 if user not found in leaderboards
        score: 0,
      });
    }
  });

  // Build normal table rows that share for participants > rank 5 (without strong row)
  let leaderboardTableRowsNormalHtml = "";
  
  leaderboards.some((leaderboard) => {
    if (leaderboard.rank > maxLeaderboardRows) {
      return true;
    }
    let row = rowNormal;
    leaderboardTableRowsNormalHtml += mustache.render(row, {
      rank: leaderboard.rank,
      username: leaderboard.username,
      score: leaderboard.score,
    });
  });

  // Kirim email ke setiap participant
  participants.forEach((participant) => {
    let leaderboardTableRows = leaderboardTableRowsNormalHtml;

    // Build strong table rows for participant with rank <= 5
    if (participant.rank <= maxLeaderboardRows) {
      let leaderboardTableRowsStrongHtml = "";

      // Build table row containing strong row for participant
      leaderboards.some((leaderboard) => {
        if (leaderboard.rank > maxLeaderboardRows) {
          return true;
        }
        let row = rowNormal;
        if (leaderboard.rank === participant.rank) {
          row = rowStrong;
        }
        leaderboardTableRowsStrongHtml += mustache.render(row, {
          rank: leaderboard.rank,
          username: leaderboard.username,
          score: leaderboard.score,
        });
      });

      leaderboardTableRows = leaderboardTableRowsStrongHtml;      
    }

    const htmlContent = mustache.render(quizResultEmailTemplate, {
      username: participant.username,
      rank: participant.rank,
      score: participant.score,
      quizName: msgObj.leaderboard.quiz_name,
      leaderboardTableRows: leaderboardTableRows,
    });

    const emailOptions = {
      from: `QuQuiz <${senderEmail}>`,
      to: participant.email,
      subject: "Quiz Result",
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

module.exports = sendQuizResultEmail;
