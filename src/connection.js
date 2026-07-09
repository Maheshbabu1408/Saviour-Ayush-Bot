const {
  default: makeWASocket,
  useMultiFileAuthState,
  fetchLatestBaileysVersion,
  makeCacheableSignalKeyStore,
} = require("@whiskeysockets/baileys");

const P = require("pino");
const { setSocket } = require("./socket");

async function createConnection() {
  const { state, saveCreds } = await useMultiFileAuthState("./session");

  const { version } = await fetchLatestBaileysVersion();

  const logger = P({ level: "silent" });

  const sock = makeWASocket({
    version,
    logger,
    auth: {
      creds: state.creds,
      keys: makeCacheableSignalKeyStore(state.keys, logger),
    },
    browser: ["Saviour Ayush Bot", "Chrome", "1.0.0"],
    printQRInTerminal: false,
    syncFullHistory: false,
  });

  // Save socket globally
  setSocket(sock);

  // Save credentials
  sock.ev.on("creds.update", saveCreds);

  // Connection status
  sock.ev.on("connection.update", (update) => {
    console.log("Connection Update:", update);

    if (update.connection === "open") {
      console.log("✅ WhatsApp Connected!");
    }

    if (update.connection === "close") {
      console.log("❌ Connection Closed");
    }
  });

  return sock;
}

module.exports = { createConnection };
