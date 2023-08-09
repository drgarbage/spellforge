const { completions } = require('./api-openai');
const genComment = require('assets/presets/comments');

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
        return new OpenAIGeneratorV2(configs);
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
    super();
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

class OpenAIGeneratorV2 extends PostGenerator {

  configs = {
    openai: '',
    openaiOptions: {},
    
    prompt: '[openai]',
    promptOptions: {}, // example: prefix, posing, dressing, quality, lora, embeeding
    
    comment: '[openai]',
    commentOptions: {}, // example: felling, mentions, tags
    
    onUpdate: ({background, prompt, comment}) => {}
  }

  openaiPromptTemplate = `
    #ROLE You are a prompt generator for DALL-E. you will generate a prompt and a comment according to the request after symbol '/'. For example, a request: '/A female rpg game character', you will response: { "prompt": "A character sketch of an elf female warrior, 1girl, blonde hair, cute face, smiling, delight eyes, standing, confidence pose, wearing leather armor, skirt made of leaf, handguard, long brown leather boots, carring bow", "comment": "Once Warrior, Always Warrior." }. 

    The prompt required following elements:
    (1) The prompt part must be translated into english.
    (2) The comment part must remain same language as request.
    (3) Always response in JSON format like: 
    { 
      "prompt": "generated prompt", 
      "comment": "generated comment" 
    }
    (4) Words to describe the method of depiction, such as watercolor or oil painting.
    (5) Words to describe external features, ornaments and belongings (also specify colors.
    patterns, shapes).
    (6) Words to describe age, hair color, hairstyle, hair length, hair accessory, eye color, eyeshape, facial expression, breast size, and clothing.
    (7) Words to describe background details, such as inside room, starry sky, forest, riverside.(5) Words to direct the pose from head to toe can also be added to the prompt.
    (8) The prompt part should be plain text and avoid using of r or "" or hashtag or line breaks. 
    (9) Prompts may use danbooru tags. 
    (10) Write comment according to request, of the request didn't mention how to write comment, then list elements in prompt with given language.
    
  `;

  constructor(configs) {
    super();
    this.configs = configs;
  }

  async generate(options) {
    const { openaiApiKey, ...restOptions } = options;
    const { openai, openaiOptions = {}, prompt, promptOptions = {}, comment, commentOptions = {}, onUpdate = () => {} } = this.configs;
    const [ background, p, c ] = await ( async () => { 
      const prompt2openai = withOptions(openai, {...openaiOptions, ...restOptions});

      onUpdate({background: prompt2openai, prompt: '', comment: ''});

      const promptForGPT = `${this.openaiPromptTemplate}/${prompt2openai}\n\n`;
      const rs = await completions({prompt: promptForGPT, apiKey: openaiApiKey});
      const { prompt, comment } = JSON.parse(rs.data.choices[0].text);
      return [prompt2openai, prompt, comment];
    })();

    onUpdate({background, prompt: p, comment: c});

    const output = {
      background,
      prompt: withOptions(prompt, {
        openai: p,
        ...promptOptions, 
        ...restOptions
      }),
      comment: withOptions(comment, {
        openai: c,
        ...commentOptions, 
        ...restOptions
      })
    };

    onUpdate(output);

    return output;
  }

}

module.exports = {
  PostGenerator, DefaultGenerator, PatternGenerator, OpenAIGenerator: OpenAIGeneratorV2
}