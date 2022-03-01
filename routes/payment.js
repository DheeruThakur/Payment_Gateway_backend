const express = require("express");
const router = express.Router();
const payController = require("../controller/payment");

router.get("/createorder", payController.createOrder);
router.post("/payment/callback", payController.payCallback);
router.get("/payments/:paymentId", payController.getPayment);
router.get("/logo", payController.getLogo);

module.exports = router;
