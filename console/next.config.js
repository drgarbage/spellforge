const i18nConfig = require('./next-i18next.config.js');
const { i18n } = i18nConfig;

/** @type {import('next').NextConfig} */
module.exports = {
  i18n,
  output: 'standalone',
}
