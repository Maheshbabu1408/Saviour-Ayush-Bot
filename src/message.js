const { getMenu } = require("./menu");

async function handleMessage(sock, msg) {
  const jid = msg.key.remoteJid;

  // Ignore group chats
  if (jid.endsWith("@g.us")) return;

  // Ignore status updates
  if (jid === "status@broadcast") return;

  const text =
    msg.message?.conversation ||
    msg.message?.extendedTextMessage?.text ||
    "";

  if (!text) return;

  switch (text.trim()) {
    case "1":
      await sock.sendMessage(jid, {
        text: "📅 Please send your Name, Age, Phone Number and preferred Appointment Date.",
      });
      break;

    case "2":
      await sock.sendMessage(jid, {
        text: "🩺 Doctor Timings:\n\nMonday - Saturday\n🕘 9:00 AM - 8:00 PM",
      });
      break;

    case "3":
      await sock.sendMessage(jid, {
        text: "🌿 Treatments Available:\n\n• Ayurveda\n• Panchakarma\n• General Consultation\n• Pain Management",
      });
      break;

    case "4":
      await sock.sendMessage(jid, {
        text: "📍 Saviour Ayush Hospital\n\nhttps://maps.google.com/",
      });
      break;

    case "5":
      await sock.sendMessage(jid, {
        text: "📞 Contact Us\n\nPhone: +91XXXXXXXXXX",
      });
      break;

    default:
      await sock.sendMessage(jid, {
        text: getMenu(),
      });
      break;
  }
}

module.exports = handleMessage;
