export default class UndefinedPropertyError extends Error {
    constructor(required_key_name) {
        super(`UndefiendPropertyError: ${required_key_name} is required.`)
        this.name = "UndefinedPropertyError"
    }
}
