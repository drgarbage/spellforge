const { Configuration, OpenAIApi } = require("openai");
const API_KEY = process.env.OPENAI_APIKEY || "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";

const configuration = new Configuration({
  apiKey: API_KEY,
});
const openai = new OpenAIApi(configuration);

const completions = ({prompt}) => 
  openai.createCompletion({
    model: "text-davinci-003",
    prompt,
    temperature: 0.8,
    max_tokens: 2048,
    top_p: 1,
    frequency_penalty: 0,
    presence_penalty: 0,
  });

module.exports = { completions };