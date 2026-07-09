const express = require("express");
const { startBot } = require("./src/bot");

const app = express();

const PORT = process.env.PORT || 8000;

app.get("/", (req, res) => {
  res.send("✅ Saviour Ayush Hospital Bot is Running");
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

startBot();
