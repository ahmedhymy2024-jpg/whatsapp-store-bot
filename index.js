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
app.listen(PORT)

async function startBot() {
    const { state, saveCreds } = await useMultiFileAuthState('./session')

    const sock = makeWASocket({
        auth: state
    })

    sock.ev.on('creds.update', saveCreds)

    if (!sock.authState.creds.registered) {
        const phoneNumber = "249XXXXXXXXX" // ضع رقمك
        const code = await sock.requestPairingCode(phoneNumber)
        console.log(`كود الربط: ${code}`)
    }

    sock.ev.on('connection.update', ({ connection, lastDisconnect }) => {
        if (connection === 'close') {
            const shouldReconnect =
                lastDisconnect?.error?.output?.statusCode !== DisconnectReason.loggedOut

            if (shouldReconnect) {
                startBot()
            }
        }

        if (connection === 'open') {
            console.log('تم الاتصال بنجاح')
        }
    })
}

startBot()
