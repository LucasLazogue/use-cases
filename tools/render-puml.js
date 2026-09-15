// Renderiza un .puml contra el servidor oficial de PlantUML y guarda el SVG local.
const fs = require('fs'), zlib = require('zlib'), https = require('https');

const ALPHABET = '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz-_';
function encode64(data) {
  let r = '';
  for (let i = 0; i < data.length; i += 3) {
    const b1 = data[i], b2 = i + 1 < data.length ? data[i + 1] : 0, b3 = i + 2 < data.length ? data[i + 2] : 0;
    r += ALPHABET[b1 >> 2];
    r += ALPHABET[((b1 & 0x3) << 4) | (b2 >> 4)];
    r += ALPHABET[((b2 & 0xF) << 2) | (b3 >> 6)];
    r += ALPHABET[b3 & 0x3F];
  }
  return r;
}

const src = fs.readFileSync(process.argv[2], 'utf8');
const encoded = encode64(zlib.deflateRawSync(Buffer.from(src, 'utf8'), { level: 9 }));
const url = 'https://www.plantuml.com/plantuml/svg/' + encoded;
console.error('largo de la URL:', url.length);

https.get(url, res => {
  const chunks = [];
  res.on('data', c => chunks.push(c));
  res.on('end', () => {
    const body = Buffer.concat(chunks);
    console.error('HTTP', res.statusCode, '| bytes', body.length);
    if (res.statusCode !== 200) { console.error(body.toString().slice(0, 500)); process.exit(1); }
    const txt = body.toString('utf8');
    if (/syntax error|Error line/i.test(txt)) {
      console.error('ERROR DE SINTAXIS PLANTUML:');
      console.error(txt.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').slice(0, 700));
      process.exit(2);
    }
    fs.writeFileSync(process.argv[3], body);
    const m = txt.match(/viewBox="[^"]*"/);
    console.log('OK ->', process.argv[3], m ? m[0] : '');
  });
}).on('error', e => { console.error('fallo de red:', e.message); process.exit(3); });
