export default function isDefined(variable) {
    if (variable === undefined) throw new ReferenceError("Variable is undefined.")
}
