import UndefinedPropertyError from "../error/undefined_property_error"

export default function requireProperty(obj, key) {
    if (!obj.hasOwnProperty(key)) throw new UndefinedPropertyError(key)
}
