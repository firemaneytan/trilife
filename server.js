const twilio = require('twilio');
const express = require('express');
const app = express();
app.use(express.json());

const accountSid = process.env.TWILIO_ACCOUNT_SID;
const authToken = process.env.TWILIO_AUTH_TOKEN;
const client = twilio(accountSid, authToken);

const TO = process.env.MY_WHATSAPP;
const FROM = 'whatsapp:+14155238886';

let reminders = [];

app.post('/reminders', (req, res) => {
  reminders = req.body.reminders || [];
  console.log(`Got ${reminders.length} reminders`);
  res.json({ ok: true });
});

app.get('/', (req, res) => res.send('TriLife server running!'));

// Check every minute
setInterval(async () => {
  const now = Date.now();
  for (const r of reminders) {
    const fireAt = new Date(`${r.date}T${r.time}`).getTime();
    const diff = fireAt - now;
    // Send at 30 min and 5 min before
    if ((diff > 0 && diff <= 60000) || r.sendNow) {
      try {
        await client.messages.create({
          from: FROM,
          to: TO,
          body: `⏰ TriLife Reminder: *${r.title}* is coming up!`
        });
        console.log(`Sent reminder for ${r.title}`);
        reminders = reminders.filter(x => x.id !== r.id);
      } catch (e) {
        console.error('Error sending:', e.message);
      }
    }
  }
}, 60000);

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
