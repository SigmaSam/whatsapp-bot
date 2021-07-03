const fs = require('fs');
const ora = require('ora');
const chalk = require('chalk');
const { Client } = require('whatsapp-web.js');
const qrcode = require('qrcode-terminal');  

const SESSION_FILE_PATH = './session.json';
let client;
let sessionData;

const withSession = () => {
    const spinner = ora(`Loading ${chalk.green('Validating session with WhatsApp...')}`)
    sessionData = require(SESSION_FILE_PATH);
    spinner.start(); 

    client = new Client({
        session: sessionData
    });

    client.on('ready',() => {
        console.log(' Client is ready!');
        spinner.stop();
        listenMessage();
    });

    client.on('auth_failure', () => {
        spinner.stop();
        console.log('** Authentication error, create again the QRCDE deleting the session.json **')
    })

    client.initialize();

}

const withOutSession = () => {
    
    console.log('There is not a sessions saved'); 
    client = new Client();
    client.on('qr', qr => {
        qrcode.generate(qr, { small: true });
    });

    client.on('authenticated', (session) => {
        //Saves credentials of the session to use later.
        sessionData = session;
        fs.writeFile(SESSION_FILE_PATH, JSON.stringify(session), function (err) {
            if (err) {
                console.log(err);
            }
        });
    });
    client.initialize();
}

/*Message Listener */

const listenMessage = () => {
    client.on('message', (msg)=> {
        const { from, to, body } = msg;

        /* User Input */
        switch(body) {
            case 'Hola':
                sendMessage(from, 'Hola somos Baumes, como podemos ayudarte?\n Para ver nuestro catalogo escribe *Catalogo*.\n Para atencion personal escribe *Che guacho dame bola*'); 
        }
       
    })
}

/*Message Sender */
const sendMessage = (to, message) => {
    client.sendMessage(to, message)
}

(fs.existsSync(SESSION_FILE_PATH)) ? withSession() : withOutSession();
 
