const sharp = require('sharp');
const moment = require('moment-timezone');

async function convertPngToJpg(base64Png) {
  const pngBuffer = Buffer.from(base64Png, 'base64');
  const jpgBuffer = await sharp(pngBuffer).jpeg().toBuffer();
  return jpgBuffer;
}


function replaceAll(str, search, replacement) {
  return str.split(search).join(replacement);
}

function template(str) {
  return {
    replaceAll: function (search, replacement) {
      str = str.split(search).join(replacement);
      return this;
    },
    toString: function () {
      return str;
    },
  };
}

const getRandomInt = (min, max) => 
  Math.floor(Math.random() * (max - min + 1)) + min;

const morning = [
  4, 4,
  5, 5, 5,
  6, 6, 6, 6,
  7, 7, 7,
  8, 8, 8,
  9, 9, 9, 9,
  10, 10, 10, 10, 10, 10, 10,
  11, 11, 11, 11,
  12, 12, 12,
];

const noon = [
  13, 13, 13, 13,
  14, 14, 14,
  15, 15, 15, 15, 15,
  16, 16, 16, 16, 16, 16,
];

const evening = [
  17, 17, 17, 17, 17, 17, 17,
  18, 18, 18, 18,
  19, 19, 19, 19, 19, 19,
  20, 20, 20, 20, 20,
];

const night = [
  21, 21, 21, 21, 21,
  22, 22, 22, 22, 22, 22,
  23, 23, 23,
  24,
  25,
  26, 26, 26, 26, 26,
  27,
];

const pickAny = (ary) =>
  ary[Math.floor(Math.random() * ary.length)];

const asDate = (hour) => {
  const randomMinute = getRandomInt(-30, 30);
  const date = moment()
    .tz('Asia/Taipei')
    .startOf('day')
    .hour(hour)
    .minute(randomMinute)
    .toDate();
  return date;
}

const pickTimes = () => [
  asDate(pickAny(morning)),
  asDate(pickAny(noon)),
  asDate(pickAny(evening)),
  asDate(pickAny(night))
]

const argOf = (key) => {
  const argv = process.argv.slice(2);
  const keyIndex = argv.indexOf(key);

  if (keyIndex !== -1) {
    if (keyIndex + 1 < argv.length && !argv[keyIndex + 1].startsWith('--')) {
      return argv[keyIndex + 1];
    } else {
      return true;
    }
  }

  return false;
};
module.exports = { convertPngToJpg, replaceAll, template, pickTimes, argOf }