const {
  default: makeWASocket,
  useMultiFileAuthState,
  fetchLatestBaileysVersion,
  makeCacheableSignalKeyStore,
  DisconnectReason,
} = require("@whiskeysockets/baileys");

const fs = require("fs");
const P = require("pino");
const { setSocket } = require("./socket");
const handleMessage = require("./message");

const SESSION_DIR = "./session";

async function createConnection() {
  const { state, saveCreds } = await useMultiFileAuthState(SESSION_DIR);

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

  let hasConnectedOnce = false;

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
      hasConnectedOnce = true;
      console.log("✅ WhatsApp Connected!");
    }

    if (connection === "close") {
      const statusCode = lastDisconnect?.error?.output?.statusCode;
      const loggedOut = statusCode === DisconnectReason.loggedOut;

      console.log(`❌ Connection Closed (code: ${statusCode || "unknown"})`);

      if (loggedOut && hasConnectedOnce) {
        // A real logout of a previously-working session (device
        // removed from phone). Don't loop forever - needs re-pairing.
        console.log("⚠️ Logged out. Delete ./session and re-pair.");
        return;
      }

      // Either a pairing/QR timeout (408) before ever connecting, or
      // a corrupted half-written session from a failed pairing
      // attempt (which often surfaces as a 401 right after). In both
      // cases, wipe the stale session so the next attempt starts
      // clean instead of retrying with broken credentials.
      if (!hasConnectedOnce) {
        try {
          fs.rmSync(SESSION_DIR, { recursive: true, force: true });
          console.log("🧹 Cleared stale session (never fully paired).");
        } catch (err) {
          console.error("Failed to clear session:", err);
        }
      }

      console.log("🔄 Reconnecting in 5s...");
      setTimeout(() => {
        createConnection().catch((err) =>
          console.error("Reconnect failed:", err)
        );
      }, 5000);
    }
  });

  return sock;
}

module.exports = { createConnection };
