const { Configuration, OpenAIApi } = require("openai");

const completions = ({
  prompt, 
  model = 'text-davinci-003',
  max_tokens = 256,
  apiKey = null
}) => {
  if(!apiKey) throw new Error('ERR.OPENAI_API_KEY_INCORRECT');
  const configuration = new Configuration({ apiKey });
  const openai = new OpenAIApi(configuration);
  return openai.createCompletion({
    model,
    prompt,
    max_tokens,
    temperature: 0.8,
    top_p: 1,
    frequency_penalty: 0,
    presence_penalty: 0,
  });
}

const chats = ({
  messages, 
  model = 'gpt-4',
  max_tokens = 256,
  apiKey = null
}) => {
  if(!apiKey) throw new Error('ERR.OPENAI_API_KEY_INCORRECT');
  const configuration = new Configuration({ apiKey });
  const openai = new OpenAIApi(configuration);
  return openai.createChatCompletion({
    model,
    messages,
    max_tokens,
    temperature: 1,
    top_p: 1,
    frequency_penalty: 0,
    presence_penalty: 0,
  });
}

module.exports = { completions, chats };