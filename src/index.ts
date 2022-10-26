import { getPublicKey, relayPool } from 'nostr-tools'
import Linka from './linka.js'
//@ts-ignore
import { decrypt, encrypt } from 'nostr-tools/nip04.js'

const defaultRelays = [
    'wss://nostr-pub.wellorder.net',
    'wss://nostr-relay.wlvs.space',
    'wss://nostr-relay.untethr.me',
    'wss://nostr.openchain.fr',
]

class UnaConnect {
    linka: Linka
    constructor(privateKey: string, publicKeyWatcher: string, relays = null) {
        const pubKey = getPublicKey(Buffer.from(privateKey, 'hex'))

        // publicKeyWatcher = publicKeyWatcher

        const pool = relayPool()
        pool.setPrivateKey(privateKey)

        for (const relay of relays ?? defaultRelays) {
            pool.addRelay(relay, { read: true, write: true })
        }

        this.linka = new Linka(
            (callback: Function) => {
                pool.sub({
                    cb: (event, _) => {
                        if (event.kind === 4) {
                            const instruction = decrypt(privateKey, event.pubkey!, event.content)
                            callback(JSON.parse(instruction))
                        }
                    },
                    //@ts-ignore
                    filter: {
                        kinds: [4],
                        authors: [publicKeyWatcher],
                        '#p': [pubKey],
                    },
                })
            },
            async (data: any) => {
                const event = {
                    kind: 4,
                    pubkey: pubKey,
                    content: encrypt(privateKey, publicKeyWatcher, JSON.stringify(data)),
                    tags: [['p', publicKeyWatcher]],
                    created_at: Math.round(Date.now() / 1000),
                }
                //@ts-ignore
                await pool.publish(event, (status, url) => { })
            },
            { timeout: 1000 * 10 },
        )
    }

    async createInvoice(amount: number, description: string) {
        const query = {
            action: 'createInvoice',
            createInvoice: { amount, description },
        }
        return await this.linka.request(query)
    }
}

export default UnaConnect
