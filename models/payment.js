const { string } = require("assert-plus");
const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const paySchema = new Schema({
  _id: {
    type: String,
    required: true,
  },
  order: {
    type: Array,
    default: [],
  },
});

module.exports = mongoose.model("order", paySchema);
