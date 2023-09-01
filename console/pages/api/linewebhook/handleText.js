import { SDAPI_DEFAULT_NEG } from './constants';
import { pushText, pushImages, replyText } from './client';
import { chats } from 'libs/api-openai';
import { upload } from 'libs/api-firebase';

import predefined from './predefined.json';
import sdapi from 'libs/api-sd-remote';
import moment from 'moment-timezone';

const { 
  OPENAI_DEFAULT_APIKEY : apiKey,
  SDAPI_DEFAULT_HOST : sdapiHost,
} = process.env;

export const handleText = async (event) => {
  const initial = new Date();

  if(!['幫我畫', '幫我設計', '我想問', '我就問', '請教一下']
    .some(keyword => event.message.text.includes(keyword)))
    return null; 

  const messages = [
    ...predefined, {
      role: 'user',
      content: event.message.text
  }];
  
  const rs = await chats({messages, apiKey});
  const data = rs?.data?.choices[0].message.content;
  const {answer, prompt} = JSON.parse(data);

  if(!!answer) {
    if(initial - new Date() > 30000)
      await pushText(event, answer);
    else
      await replyText(event, answer);
  }

  if(!!prompt) {
    const { images: rawImages } = await sdapi(sdapiHost).txt2img({
      prompt, 
      negative_prompt: SDAPI_DEFAULT_NEG, 
      restore_faces: true, 
      batch_size: 4
    });
    const imageUrls = await Promise.all(rawImages.map((base64Image, index) => 
      upload(
        `/images/bot/${moment().unix()}-${index}.png`,
        base64Image,
        {contentType: 'image/png'}
      )
    ));

    await pushImages(event, imageUrls);
  }

}