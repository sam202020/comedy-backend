var express = require("express");
var router = express.Router();
const { v4: uuidv4 } = require("uuid");
const sgMail = require("@sendgrid/mail");

const fs = require("fs");

pathToAttachment = `${__dirname}/ticket.jpg`;
attachment = fs.readFileSync(pathToAttachment).toString("base64");

const sendMail = async (email) => {
  sgMail.setApiKey(process.env.SENDGRID_API_KEY);
  const msg = {
    to: email,
    from: "zev@prescottcomedyclub.com",
    subject: "Your ticket to Prescott Comedy Club",
    text: "We look forward to seeing you!",
    html: "<p>We look forward to seeing you!</p>",
    attachments: [
    {
      content: attachment,
      filename: "ticket.jpg",
      type: "image/jpeg",
      disposition: "attachment",
    },
  ],
  };
  try {
    return await sgMail.send(msg);
  } catch (error) {
    console.error(error);

    if (error.response) {
      console.error(error.response.body)
      return error.response.body;
    } else {
      return error;
    }
  }
};

router.get("/", function (req, res, next) {
  res.render("index", { title: "Express" });
});

router.post("/process-payment", async (req, res) => {
  const request_params = req.body;

  const idempotency_key = uuidv4();

  const payments_api = new squareConnect.PaymentsApi();
  const request_body = {
    source_id: request_params.nonce,
    amount_money: {
      amount: request_params.amount * 1500,
      currency: "USD",
    },
    idempotency_key: idempotency_key,
  };

  const email = request_params.email;
  console.log(email);

  try {
    const response = await payments_api.createPayment(request_body);
    await sendMail(email);
    res.status(200).json(response);
  } catch (error) {
    res.status(500).json(error);
  }
});

module.exports = router;
