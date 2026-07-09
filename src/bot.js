const { createConnection } = require("./connection");
const handleMessage = require("./message");

async function startBot() {
  const sock = await createConnection();

  console.log("✅ Bot Started");

  sock.ev.on("messages.upsert", async ({ messages }) => {
    const msg = messages[0];

    if (!msg.message || msg.key.fromMe) return;

    await handleMessage(sock, msg);
  });
}

module.exports = { startBot };
