const { completions } = require('./api-openai');
const genComment = require('../profiles/comments');

const withOptions = (pattern, options) => {
  if(!options) return pattern;
  let output = pattern;
  for(let optionKey in options) {
    let search = `[${optionKey}]`;
    let setting = options[optionKey];
    let value = Array.isArray(setting) ? 
      setting[Math.floor(Math.random() * setting.length)] : 
      setting;
    output = output.replaceAll(search, value);
  }
  return output;
}


class PostGenerator {
  static fromConfig(configs) {
    switch (configs.type) {
      case 'PatternGenerator': 
        return new PatternGenerator(configs);
      case 'OpenAIGenerator': 
        return new OpenAIGenerator(configs);
      default:
        return new DefaultGenerator(configs);
    }
  }
  generate(options) {
    return Promise.resolve({ prompt: '', comment: '' });
  }
}



class DefaultGenerator extends PostGenerator {
  configs = {
    prompt: '',
    comment: '',
  }

  constructor(configs) {
    this.configs = configs;
  }

  generate(options) {
    return Promise.resolve(this.configs);
  }
}



class PatternGenerator extends PostGenerator {

  configs = {
    prompt: '1girl',
    promptOptions: {}, // example: prefix, posing, dressing, quality, lora, embeeding
    
    comment: 'Photo of today...',
    commentOptions: {}, // example: felling, mentions, tags
    
    onUpdate: ({prompt, comment}) => {}
  }

  constructor(configs) {
    super();
    this.configs = configs;
  }

  generate(options) {
    const { prompt, promptOptions = {}, comment, commentOptions = {}, onUpdate = () => {} } = this.configs;
    commentOptions['auto-comment'] = genComment();
    const output = {
      prompt: withOptions(prompt, {...promptOptions, ...options}),
      comment: withOptions(comment, {...commentOptions, ...options})
    }
    onUpdate(output);
    return Promise.resolve(output);
  }
}



class OpenAIGenerator extends PostGenerator {

  configs = {
    openai: '',
    openaiOptions: {},
    
    prompt: '[openai]',
    promptOptions: {}, // example: prefix, posing, dressing, quality, lora, embeeding
    
    comment: '[openai]',
    commentOptions: {}, // example: felling, mentions, tags
    
    onUpdate: ({background, prompt, comment}) => {}
  }

  constructor(configs) {
    super();
    this.configs = configs;
  }

  async generate(options) {
    const { openai, openaiOptions = {}, prompt, promptOptions = {}, comment, commentOptions = {}, onUpdate = () => {} } = this.configs;
    const [ background, p, c ] = await ( async () => { 
      const prompt2openai = withOptions(openai, {...openaiOptions, ...options});

      onUpdate({background: prompt2openai, prompt: '', comment: ''});

      const rs = await completions({prompt: prompt2openai});
      const rep = rs.data.choices[0].text.trim();
      const [p, c] = rep.split('@:@').map(s => 
        s.replace('Prompt:','')
          .replace('prompt:','')
          .replace('[prompt]', '')
          .replace('Comment:','')
          .replace('comment:','')
          .replace('[comment]', '')
          .replace('Answer: ', '')
          .trim());
      return [prompt2openai, p, c];
    })();

    onUpdate({background, prompt: p, comment: c});

    const output = {
      background,
      prompt: withOptions(prompt, {
        openai: p,
        ...promptOptions, 
        ...options
      }),
      comment: withOptions(comment, {
        openai: c,
        ...commentOptions, 
        ...options
      })
    };

    onUpdate(output);

    return output;
  }

}

module.exports = {
  PostGenerator, DefaultGenerator, PatternGenerator, OpenAIGenerator
}