const { Configuration, OpenAIApi } = require("openai");

const completions = ({prompt, apiKey = null}) => {
  if(!apiKey) throw new Error('ERR.OPENAI_API_KEY_INCORRECT');
  const configuration = new Configuration({ apiKey });
  const openai = new OpenAIApi(configuration);
  return openai.createCompletion({
    model: "text-davinci-003",
    prompt,
    temperature: 0.8,
    max_tokens: 2300,
    top_p: 1,
    frequency_penalty: 0,
    presence_penalty: 0,
  });
}

module.exports = { completions };