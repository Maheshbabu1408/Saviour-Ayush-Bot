const {
  default: makeWASocket,
  useMultiFileAuthState,
  fetchLatestBaileysVersion,
} = require("@whiskeysockets/baileys");

async function createConnection() {
  const { state, saveCreds } = await useMultiFileAuthState("./session");

  const { version } = await fetchLatestBaileysVersion();

  const sock = makeWASocket({
    version,
    auth: state,
    browser: ["Saviour Ayush Bot", "Chrome", "1.0.0"],
    syncFullHistory: false,
    printQRInTerminal: false,
  });

  sock.ev.on("creds.update", saveCreds);

  sock.ev.on("connection.update", ({ connection, qr }) => {
    if (connection === "open") {
      console.log("✅ WhatsApp Connected!");
    }

    if (qr) {
      console.log("\n========== QR RECEIVED ==========\n");
      console.log(qr);
      console.log("\n===============================\n");
    }
  });

  return sock;
}

module.exports = { createConnection };
