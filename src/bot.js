const { createConnection } = require("./connection");

async function startBot() {
  await createConnection();
  console.log("✅ Bot Started");
}

module.exports = { startBot };
