const express = require('express')
const {
    default: makeWASocket,
    useMultiFileAuthState,
    DisconnectReason
} = require('@whiskeysockets/baileys')

const app = express()

app.get('/', (req, res) => {
    res.send('Bot Running')
})

const PORT = process.env.PORT || 3000
app.listen(PORT, () => {
    console.log('Web Server Started')
})

async function startBot() {
    const { state, saveCreds } = await useMultiFileAuthState('./session')

    const sock = makeWASocket({
        auth: state,
        printQRInTerminal: false
    })

    sock.ev.on('creds.update', saveCreds)

    let pairingCodeRequested = false

    sock.ev.on('connection.update', async ({ connection, lastDisconnect }) => {

        if (connection === 'open') {
            console.log('تم الاتصال بنجاح')
        }

        if (
            !sock.authState.creds.registered &&
            !pairingCodeRequested
        ) {
            pairingCodeRequested = true

            try {
                const phoneNumber = '+249122366932' // ضع رقمك كاملاً
                const code = await sock.requestPairingCode(phoneNumber)

                console.log('====================')
                console.log('PAIRING CODE:')
                console.log(code)
                console.log('====================')
            } catch (err) {
                console.log('خطأ في إنشاء كود الربط')
                console.log(err)
            }
        }

        if (connection === 'close') {
            const shouldReconnect =
                lastDisconnect?.error?.output?.statusCode !== DisconnectReason.loggedOut

            if (shouldReconnect) {
                startBot()
            }
        }
    })
}

startBot()
