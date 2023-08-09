import translate from 'google-translate-api-x';

export default async (req, res) => {
  const {text} = await translate(req.body, {to: 'en'});
  res.status(200).json(text);
}
