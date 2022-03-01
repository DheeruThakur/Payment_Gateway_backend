const Razorpay = require("razorpay");
const { v4: uuid4 } = require("uuid");
const path = require("path");
const formidable = require("formidable");
const { createHmac } = require("crypto");
const orderSchema = require("../models/payment");
const request = require("request");
let orderId;

var instance = new Razorpay({
  key_id: process.env.YOUR_KEY_ID,
  key_secret: process.env.YOUR_KEY_SECRET,
});

// ye order hai jo backend se create karenge sabse pehle
exports.createOrder = (req, res, next) => {
  var options = {
    amount: 500 * 100, // amount in the smallest currency unit
    currency: "INR",
    receipt: uuid4(),
  };
  instance.orders.create(options, function (err, order) {
    if (err) {
      return res.status(500).json({ error: err });
    }
    orderId = order.id;
    res.json(order);
  });
};

// frontend jo callback post karega wo ye hai
exports.payCallback = (req, res, next) => {
  const form = formidable();
  form.parse(req, (err, fields, files) => {
    if (fields) {
      console.log("Fields", fields);
      const hash = createHmac("sha256", process.env.YOUR_KEY_SECRET)
        .update(orderId + "|" + fields.razorpay_payment_id)
        .digest("hex");

      if (fields.razorpay_signature === hash) {
        // store details in database
        const order = new orderSchema({
          _id: fields.razorpay_payment_id,
          order: fields.razorpay_order_id,
        });
        order.save((err, data) => {
          if (err) {
            res.status(500).json({ error: "cannot connect with DB" });
          } else {
            res.redirect(
              `${process.env.FRONTEND}/payment/status/${fields.razorpay_payment_id}` // ye link frontend ne generate ki hai
            );
          }
        });
      } else {
        res.send("Error");
      }
    }
  });
};

// for getting all the details of payment
exports.getPayment = (req, res, next) => {
  orderSchema.findById(req.params.paymentId).exec((err, data) => {
    if (err || data == null) {
      return res.json({ error: "No order found" });
    }

    // ye request payment ki saari deatails de dega
    request(
      `https://${process.env.YOUR_KEY_ID}:${process.env.YOUR_KEY_SECRET}@api.razorpay.com/v1/payments/${req.params.paymentId}`,
      function (error, response, body) {
        if (body) {
          const result = JSON.parse(body);
          res.status(200).json(result);
        }
        return res.json({ error: "Data not found" });
      }
    );
  });
};

// ye logo dega frontend ko
exports.getLogo = (req, res, next) => {
  res.sendFile(path.join(__dirname, "../mask.svg"));
};
