const fs = require('fs');
const path = require('path');

const NEWLINES_MATCH = /(?:\n|\r|\r\n)/;
const RE_INI_KEY_VAL = /^\s*([\w.-]+)\s*=\s*(.*)?\s*$/;
const RE_SINGLE_QUOTES = /^'([^']*)'$/;
const RE_DOUBLE_QUOTES = /^"([^"\\]*(\\.[^"\\]*)*)"$/;

function parse(src) {
  const obj = {};
  src
    .toString()
    .split(NEWLINES_MATCH)
    .forEach((line) => {
      const keyValueArr = line.match(RE_INI_KEY_VAL);
      if (keyValueArr != null) {
        const key = keyValueArr[1];
        let value = keyValueArr[2] || '';
        const end = value.length - 1;
        const isQuoted = value[0] === '"' && value[end] === '"';
        if (isQuoted) {
          value = value.replace(RE_DOUBLE_QUOTES, '$1');
        } else {
          value = value.replace(RE_SINGLE_QUOTES, '$1');
        }
        value = value.trim();
        obj[key] = value;
      }
    });
  return obj;
}

function config(options = {}) {
  const dotenvPath = options.path ?? path.resolve(process.cwd(), '.env');
  const encoding = options.encoding ?? 'utf8';
  try {
    const parsed = parse(fs.readFileSync(dotenvPath, { encoding }));
    Object.keys(parsed).forEach((key) => {
      if (!Object.prototype.hasOwnProperty.call(process.env, key)) {
        process.env[key] = parsed[key];
      }
    });
    return { parsed };
  } catch (error) {
    return { error };
  }
}

module.exports = { config, parse };
