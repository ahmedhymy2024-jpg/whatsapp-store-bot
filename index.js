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
    console.log(`Server running on ${PORT}`)
})

async function startBot() {

    const { state, saveCreds } = await useMultiFileAuthState('./session')

    const sock = makeWASocket({
        auth: state
    })

    sock.ev.on('creds.update', saveCreds)

    sock.ev.on('connection.update', async (update) => {

        const { connection, lastDisconnect } = update

        if (connection === 'connecting') {
            console.log('جاري الاتصال بواتساب...')
        }

        if (connection === 'open') {
            console.log('✅ تم الربط بنجاح')
        }

        if (
            !state.creds.registered
        ) {
            try {
                const phoneNumber = '249122366932'

                const code = await sock.requestPairingCode(phoneNumber)

                console.log('======================')
                console.log('كود الربط:')
                console.log(code)
                console.log('======================')

            } catch (error) {
                console.log('❌ خطأ في إنشاء كود الربط')
                console.log(error)
            }
        }

        if (connection === 'close') {

            const shouldReconnect =
                lastDisconnect?.error?.output?.statusCode !== DisconnectReason.loggedOut

            if (shouldReconnect) {
                console.log('إعادة الاتصال...')
                startBot()
            }
        }
    })
}

startBot()
