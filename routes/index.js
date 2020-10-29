var express = require('express');
var router = express.Router();
const { v4: uuidv4 } = require("uuid");

router.get('/', function(req, res, next) {
  res.render('index', { title: 'Express' });
});

router.post("/process-payment", async (req, res) => {
  console.log(req.body);
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

  try {
    const response = await payments_api.createPayment(request_body);
    res.status(200).json(response);
  } catch (error) {
    
    res.status(500).json(error);
  }
});


module.exports = router;
