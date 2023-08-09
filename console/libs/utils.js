const moment = require('moment-timezone');

function isEnglish(string) {
  // 匹配英文、數字、空格和常見標點符號
  const englishPattern = /^[A-Za-z0-9\s.,!?'"():;\-@#\$%\^&\*\[\]{}_+=<>~\\\/]+$/;
  return englishPattern.test(string);
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

function hostPart(url) {
  const parsedUrl = new URL(url);
  const host = parsedUrl.hostname;
  const port = parsedUrl.port || (parsedUrl.protocol === "https:" ? "443" : "80");
  return `${host}${port === "80" || port === "443" ? "" : `:${port}`}`;
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

const asBase64Image = (base64URL) => 
  base64URL
    .replace('data:image/png;base64,', '')
    .replace('data:image/jpg;base64,', '')
    .replace('data:image/jpeg;base64,', '');

const asBase64PngURL = (base64Data) =>
  `data:image/png;base64,${asBase64Image(base64Data)}`;

const pickTimes = () => [
  asDate(pickAny(morning)),
  asDate(pickAny(noon)),
  asDate(pickAny(evening)),
  asDate(pickAny(night))
]

const parseParameters = (parameters) => {
  if(!parameters) return {};
  const COLUMNS = {
    'Negative prompt': 'negative_prompt', 
    'Steps': 'steps', // int
    'Sampler': 'sampler_index',  
    'CFG scale': 'cfg_scale', // float
    'Seed': 'seed', // int
    'Size': 'size', 
    'Model hash': 'model_hash'
  };
  const indexOfNegative = parameters.indexOf('Negative prompt:');
  const indexofSteps = parameters.indexOf('Steps:');
  const hasNegative = indexOfNegative >= 0;
  const promptEndIndex = hasNegative ? indexOfNegative : indexofSteps;
  
  const prompt = parameters.substr(0, promptEndIndex);
  const negative_prompt = hasNegative ? 
    { negative_prompt: parameters.substr(indexOfNegative, indexofSteps - indexOfNegative).split(':')[1].trim() } : 
    {};
    
  const rest = parameters.substr(indexofSteps);
  
  const columns = rest.split(',').map(pair => {

    const [key, value] = pair.split(':').map(v => v.trim());
    
    if(key === 'Size') {
      const [width, height] = value.split('x').map(v => parseInt(v));
      return { width, height };
    }

    if(key === 'Model hash') {
      return {
        override_settings: {
          sd_model_checkpoint: value
        }
      };
    }

    if(['CFG scale'].indexOf(key) >= 0) {
      return ({[COLUMNS[key]]:parseFloat(value)});
    }

    if(['Steps', 'Seed'].indexOf(key) >= 0) {
      return ({[COLUMNS[key]]:parseInt(value)});
    }

    return ({[COLUMNS[key]]:value});

  }).reduce((p,v) => ({...p, ...v}), {});

  return {
    prompt,
    ...negative_prompt,
    ...columns
  };
}

module.exports = { isEnglish, hostPart, replaceAll, template, pickTimes, parseParameters, asBase64Image, asBase64PngURL }