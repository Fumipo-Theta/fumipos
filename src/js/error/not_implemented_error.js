export default class NotImplementedError extends Error {
    constructor(method) {
        super(`NotImplementedError: ${method} must be implemented.`)
        this.name = "NotImplementedError"
    }
}
