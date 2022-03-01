const express = require("express");
const { default: mongoose } = require("mongoose");
require("dotenv").config();
const cors = require("cors");
const payRoutes = require("./routes/payment");

const app = express();
app.use(cors());
app.use(express.json());

app.use("/api", payRoutes);

const PORT = process.env.PORT || 3000;
mongoose.connect(process.env.MONGO_URI, () => {
  console.log("connected successfully");
  app.listen(PORT, () => {
    console.log(`server is running at port ${PORT}`);
  });
});
