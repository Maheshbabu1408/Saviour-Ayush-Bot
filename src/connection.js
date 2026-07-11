const {
  default: makeWASocket,
  useMultiFileAuthState,
  fetchLatestBaileysVersion,
  makeCacheableSignalKeyStore,
  DisconnectReason,
} = require("@whiskeysockets/baileys");

const P = require("pino");
const { setSocket } = require("./socket");
const handleMessage = require("./message");

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

  // Handle incoming messages (re-attached on every (re)connect)
  sock.ev.on("messages.upsert", async ({ messages }) => {
    const msg = messages[0];
    if (!msg?.message || msg.key.fromMe) return;
    await handleMessage(sock, msg);
  });

  // Connection status
  sock.ev.on("connection.update", (update) => {
    const { connection, lastDisconnect } = update;

    if (connection === "open") {
      console.log("✅ WhatsApp Connected!");
    }

    if (connection === "close") {
      const statusCode = lastDisconnect?.error?.output?.statusCode;
      const loggedOut = statusCode === DisconnectReason.loggedOut;

      console.log(`❌ Connection Closed (code: ${statusCode || "unknown"})`);

      if (loggedOut) {
        // Session was invalidated (device removed from phone) -
        // don't loop forever, a fresh pairing is required.
        console.log("⚠️ Logged out. Delete ./session and re-pair.");
      } else {
        // Anything else (QR/pairing timeout, network blip, restart
        // triggered by WhatsApp, etc.) - just reconnect.
        console.log("🔄 Reconnecting in 5s...");
        setTimeout(() => {
          createConnection().catch((err) =>
            console.error("Reconnect failed:", err)
          );
        }, 5000);
      }
    }
  });

  return sock;
}

module.exports = { createConnection };
