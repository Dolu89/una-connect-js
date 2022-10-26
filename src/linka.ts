// Linka adapted version of https://github.com/pathikdevani/linka
function isFunction(fun: Function) {
    return fun && typeof fun === 'function'
}

class Linka {
    request: (data: any) => Promise<unknown>
    bind: (id: string, callback: Function) => void
    constructor(on: Function, send: Function, options: { timeout?: number } = {}) {
        // throw error in-case of wrong params
        if (!(isFunction(on) && isFunction(send))) {
            throw new Error('Wrong params!')
        }

        // local variables
        const outgoing: any = {}
        const listeners: any = {}
        const { timeout = 0 } = options

        // generate unique message id for each request
        function getId() {
            return (+new Date()).toString()
        }

        const id = getId()

        // To send request and get async response
        // data: any - it will get passed to other side of channel
        // returns promise with repose from other side
        this.request = (data) => {
            return new Promise((resolve, reject) => {
                const isTimeout = timeout > 0
                let timer: any = null
                if (isTimeout) {
                    timer = setTimeout(() => {
                        delete outgoing[id]
                        reject(new Error('Timeout error!'))
                    }, timeout)
                }

                outgoing[id] = (e: any) => {
                    if (timer) {
                        clearTimeout(timer)
                    }
                    resolve(e)
                }
                send({
                    id,
                    ...data,
                })
            })
        }

        // bind to listen event from other side
        this.bind = (id: string, callback: Function) => {
            listeners[id] = callback
        }

        // to handle event and invoice listener(what we bind) and send response
        on((e: any) => {
            if (e && e.id) {
                const out = outgoing[e.id]
                if (out) {
                    delete outgoing[e.id]
                    out(e)
                }
            }
        })
    }
}

export default Linka
