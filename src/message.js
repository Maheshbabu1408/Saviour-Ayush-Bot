async function handleMessage(sock, msg) {
  const jid = msg.key.remoteJid;

  // Ignore groups
  if (jid.endsWith("@g.us")) return;

  const text =
    msg.message?.conversation ||
    msg.message?.extendedTextMessage?.text ||
    "";

  if (!text) return;

  await sock.sendMessage(jid, {
    text: `🙏 *Welcome to Saviour Ayush Hospital* 🌿

Namaste!

Thank you for contacting *Saviour Ayush Hospital*.

Reply with:

1️⃣ Book Appointment
2️⃣ Doctor Timings
3️⃣ Treatments
4️⃣ Hospital Location
5️⃣ Contact Us`,
  });
}

module.exports = handleMessage;
