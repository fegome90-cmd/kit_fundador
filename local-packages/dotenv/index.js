const fs = require('fs');
const path = require('path');

function parse(src) {
  const obj = {};
  src
    .toString()
    .split(/\r\n|\n|\r/)
    .forEach((line) => {
      const trimmed = line.trim();
      if (!trimmed || trimmed.startsWith('#')) {
        return;
      }

      const separatorIndex = trimmed.indexOf('=');
      if (separatorIndex === -1) {
        return;
      }

      const key = trimmed.slice(0, separatorIndex).trim();
      if (!key) {
        return;
      }

      let value = trimmed.slice(separatorIndex + 1).trim();
      const firstChar = value[0];
      const lastChar = value[value.length - 1];
      const hasQuotes = value.length >= 2 && ((firstChar === '"' && lastChar === '"') || (firstChar === "'" && lastChar === "'"));

      if (hasQuotes) {
        value = value.slice(1, -1);
      }

      obj[key] = value;
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
