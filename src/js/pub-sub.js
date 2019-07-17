class Publisher {
    constructor() {
        this._subscriber = []
    }

    publish(event) {
        this._subscriber.forEach(subscriber => {
            if (subscriber.subscribing(event.type)) {
                subscriber.listen(event)
            }
        })
    }

    subscriber() {
        const subscriber = new Subscriber()
        this._subscriber.push(subscriber)
        return subscriber
    }
}

class Subscriber {
    /**
     *
     * @param {string} subscribe_event_type
     */
    constructor() {
        this._subscribingDict = {}
        return this
    }

    subscribe(event_type, callback) {
        this._subscribingDict[event_type] = callback
        return this;
    }

    /**
     *
     * @param {string} event_type
     */
    subscribing(event_type) {
        return this._subscribingDict.hasOwnProperty(event_type)
    }

    listen(event) {
        this._subscribingDict[event.type](event)
    }
}

export default new Publisher()
