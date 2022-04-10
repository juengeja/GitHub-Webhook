const PORT = process.env.GITHUB_WEBHOOK_PORT || 3311;
const secret = process.env.GITHUB_WEBHOOK_SECRET || '';
const { createServer } = require('http');

const server = createServer((req, res) => {
    if('POST' === req.method){
        let body = '';
        req.on('data', chunk => {
            body += chunk.toString();
        });
        req.on('end', () => {
            if('' !== secret){
                const { createHmac } = require('crypto');
                let signature = createHmac('sha1', secret).update(body).digest('hex');
                if(req.headers['x-hub-signature'] !== `sha1=${signature}`){
                    console.log('Signature error');
                    res.statusCode = 403;
                    res.end();
                    return;
                }
            }
            try{
                body = JSON.parse(decodeURIComponent(body).replace(/^payload=/, ''));
            }catch(e){
                console.log(e);
            }
        })
        if('object' === typeof body){
            if('refs/heads/master' === body.ref){
                const { exec } = require('child_process');
                const command = `cd ../${body.repository.name} && git pull origin main`;
                exec(command, (error, stdout, stderr) => {

                })
            }
        }
    }
})

server.listen(port, () => {
    console.log(`Listening on ${PORT}`);
})