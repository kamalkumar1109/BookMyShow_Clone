const formData = require("form-data");
const Mailgun = require("mailgun.js");
const mailgun = new Mailgun(formData);
const mg = mailgun.client({
  username: "api",
  key: process.env.MAILGUN_API_KEY,
});

class MailgunClient {
  static async sendEmail(email, subject, text) {
    try {
      const data = await mg.messages.create(
        "sandboxa56b7f8a5d164b50a175cdb90b084400.mailgun.org",
        {
          from: "Mailgun Sandbox <postmaster@sandboxa56b7f8a5d164b50a175cdb90b084400.mailgun.org>",
          to: [email],
          subject: subject,
          text: text,
        },
      );

      console.log(data); // logs response data
    } catch (error) {
      console.log(error); //logs any error
    }
  }
}

module.exports = MailgunClient;