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
let sent = new Set();

app.post('/reminders', (req, res) => {
  reminders = req.body.reminders || [];
  console.log(`Got ${reminders.length} reminders`);
  res.json({ ok: true });
});

app.get('/', (req, res) => res.send('TriLife server running!'));

setInterval(async () => {
  const now = Date.now();
  for (const r of reminders) {
    const fireAt = new Date(`${r.date}T${r.time}`).getTime();
    const diff = fireAt - now;
    const thirtyMin = 30 * 60 * 1000;
    const fiveMin = 5 * 60 * 1000;
    const window = 60 * 1000;

    const key30 = r.id + '_30';
    const key5  = r.id + '_5';

    if (diff > 0 && diff <= thirtyMin + window && diff >= thirtyMin - window && !sent.has(key30)) {
      sent.add(key30);
      try {
        await client.messages.create({
          from: FROM, to: TO,
          body: `⏰ TriLife: *${r.title}* in 30 minutes!`
        });
        console.log(`Sent 30min reminder for ${r.title}`);
      } catch(e){ console.error(e.message); }
    }

    if (diff > 0 && diff <= fiveMin + window && diff >= fiveMin - window && !sent.has(key5)) {
      sent.add(key5);
      try {
        await client.messages.create({
          from: FROM, to: TO,
          body: `⏰ TriLife: *${r.title}* in 5 minutes!`
        });
        console.log(`Sent 5min reminder for ${r.title}`);
      } catch(e){ console.error(e.message); }
    }
  }
}, 60000);

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
