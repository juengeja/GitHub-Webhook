const express = require('express');
const { createHmac } = require('crypto');
const { exec } = require('child_process');

const app = express();
const port = process.env.PORT || 3311;
const secret = process.env.GITHUB_WEBHOOK_SECRET;

app.use(express.json());

app.post('/webhook', (req, res) => {
  const signature = req.headers['x-hub-signature'];
  const event = req.headers['x-github-event'];
  const id = req.headers['x-github-delivery'];

  if (!signature) {
    console.log('Signature missing');
    return res.status(400).send('Signature missing');
  }

  if (!event || !id) {
    console.log('Event or ID missing');
    return res.status(400).send('Event or ID missing');
  }

  if (secret) {
    const hmac = createHmac('sha1', secret);
    const digest = Buffer.from('sha1=' + hmac.update(JSON.stringify(req.body)).digest('hex'), 'utf8');
    const checksum = Buffer.from(signature, 'utf8');
    if (!crypto.timingSafeEqual(digest, checksum)) {
      console.log('Signature mismatch');
      return res.status(400).send('Signature mismatch');
    }
  }

  if (event === 'push' && req.body.ref === 'refs/heads/main') {
    const command = `cd ../${req.body.repository.name} && git pull origin main`;
    exec(command, (error, stdout, stderr) => {
      if (error) {
        console.log(`Error executing command: ${error}`);
        return res.status(500).send(`Error executing command: ${error}`);
      }
      console.log(`stdout: ${stdout}`);
      console.log(`stderr: ${stderr}`);
      return res.status(200).send('Webhook received');
    });
  } else {
    console.log(`Event ${event} not supported`);
    return res.status(400).send(`Event ${event} not supported`);
  }
});

app.listen(port, () => {
  console.log(`Server listening on port ${port}`);
});
