const PORT = process.env.GITHUB_WEBHOOK_PORT || 3311;
const secret = process.env.GITHUB_WEBHOOK_SECRET || '';
const { createServer } = require('http');

const server = createServer((req, res) => {
    if('POST' === req.method){
        console.log("Got a post request!")
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
            }else{
                console.log("No secret provided!")
            }
            try{
                body = JSON.parse(decodeURIComponent(body).replace(/^payload=/, ''));
            }catch(e){
                console.log(e);
            }
        })
        console.log(`body.ref: ${body.ref}`)
        if('object' === typeof body){
            if('refs/heads/main' === body.ref){
                const { exec } = require('child_process');
                const command = `cd ../${body.repository.name} && git pull origin main`;
                console.log("Executing command")
                exec(command, (error, stdout, stderr) => {

                })
            }
        }
    }
})

server.listen(PORT, () => {
    console.log(`Listening on ${PORT}`);
})