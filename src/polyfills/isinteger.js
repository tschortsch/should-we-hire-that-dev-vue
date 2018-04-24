// Source: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Number/isInteger#Polyfill
Number.isInteger = Number.isInteger || function (value) {
  return typeof value === 'number' &&
    isFinite(value) &&
    Math.floor(value) === value
}
