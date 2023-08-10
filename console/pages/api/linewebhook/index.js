import { Client } from '@line/bot-sdk';
import { upload } from 'libs/api-firebase';
import { chats } from 'libs/api-openai';
import { txt2img } from 'libs/api-sd';
import sdapi from 'libs/api-sd-remote';
import moment from 'moment-timezone';

const { CHANNEL_ACCESS_TOKEN, CHANNEL_SECRET } = process.env;

const config = {
  channelAccessToken: CHANNEL_ACCESS_TOKEN,
  channelSecret: CHANNEL_SECRET,
};
const client = new Client(config);

const handleText = async (event) => {
  const system = {
    "role": "system",
    "content": "You are an expert of AI generation art. You will Answer user's question. You will write Prompts as input for AI image rendering.\n\nAnswer: please write answer with same language that user used. write Answer in json with a key 'answer'.\n\nPrompt: please write prompt with only English, and describe details, elements, items, and lightings. write Prompt in json with a key 'prompt'."
  };

  const conversations = [
    {
      "role": "user",
      "content": "請幫我畫一個美女穿著禮服走在華麗的大廳中"
    },
    {
      "role": "assistant",
      "content": "{\n  \"answer\": \"好的，我會為你生成一個美女穿著禮服走在華麗的大廳中的圖片。\", \"prompt\": \"Imagine a beautiful lady in a glamorous gown walking in an opulent hall. The hall is adorned with grand chandeliers casting warm, brilliant light all around. The lady should have refined features and wear a luxurious ball gown. She strolls with an air of elegance, her gown leaving a trail behind. The hall spans wide, with its walls beautifully decorated with intricate designs.\"\n}"
    },
    {
      role: 'user',
      content: event.message.text
    }
  ];
  
  const apiKey = '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';
  const rs = await chats({system, conversations, apiKey});
  const data = rs?.data?.choices[0].message.content;
  const {answer, prompt} = JSON.parse(data);

  if(!!answer)
    await client.pushMessage(
      event.source.groupId || event.source.userId, 
      { type: 'text', text: answer });

  if(!!prompt) {
    const { images: rawImages } = await sdapi('https://ai.printii.com').txt2img({prompt, negative_prompt: 'easynegative, (worst quality:2), (low quality:2), (normal quality:2), nsfw',restore_faces: true, batch_size: 1});
    const imageUrls = await Promise.all(rawImages.map((base64Image, index) => 
      upload(
        `/images/bot/${moment().unix()}-${index}.png`,
        base64Image,
        {contentType: 'image/png'}
      )
    ));

    await client.pushMessage(
      event.source.groupId || event.source.userId, 
      imageUrls.map(imageUrl => ({
        type: 'image',
        originalContentUrl: imageUrl,
        previewImageUrl: imageUrl
      }))
    );

  }

}

async function getImageContent(imageId) {
  let retryCount = 0;
  const maxRetries = 10;
  const retryInterval = 2000; // in milliseconds

  while (retryCount < maxRetries) {
    try {
      const response = await client.getMessageContent(imageId);
      return response;
    } catch (error) {
      if (error.response && error.response.status === 404) {
        // Content is still being uploaded
        retryCount++;
        await sleep(retryInterval);
      } else {
        console.error('Error getting image content:', error);
        throw error;
      }
    }
  }

  return null;
}

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function convertStreamToBase64(stream) {
  const chunks = [];
  for await (const chunk of stream) {
    chunks.push(chunk);
  }
  const buffer = Buffer.concat(chunks);
  const base64Data = buffer.toString('base64');
  return base64Data;
}

const handleImage = async (event) => {

  if(event.message.contentProvider.type === 'line') {

    await client.pushMessage(
      event.source.groupId || event.source.userId, 
      { type: 'text', text: '好的，正在處理照片' });

    const imageContent = await getImageContent(event.message.id);
    const userImageBase64 = await convertStreamToBase64(imageContent);
    const {caption} = await sdapi('https://ai.printii.com').interrogate(userImageBase64);
    const prompt = 
      caption +
      ',flat,2D,stroke,drawing,color pencial sketch,(anime style:1.2),(white background:1.4),masterpiece';

    const { images: rawImages } = 
      await sdapi('https://ai.printii.com')
        .txt2img({
          prompt, 
          negative_prompt: 'easynegative',
          cfg_scale: 11,
          sampler_index: 'UniPC',
          alwayson_scripts: {
            controlnet: {
              args: [
                {
                  input_image: userImageBase64,
                  module: "lineart_realistic",
                  model: "control_v11p_sd15_lineart [43d4be0d]",
                  processor_res: 512,
                  weight: 1,
                  resize_mode: 0.8
                },
                {
                  input_image: userImageBase64,
                  module: "depth",
                  model: "control_v11f1p_sd15_depth [cfd03158]",
                  weight: 0.3,
                  resize_mode: 1
                },
                {
                  input_image: userImageBase64,
                  model: "control_v1p_sd15_illumination [0c4bd571]",
                  weight: 0.25,
                  guidance_start: 0.6,
                  guidance_end: 0.8
                }
              ]
            }
          }
        });
    
    // const imageUrls = await Promise.all(rawImages.map((base64Image, index) => 
    //   upload(
    //     `/images/bot/${moment().unix()}-${index}.png`,
    //     base64Image,
    //     {contentType: 'image/png'}
    //   )
    // ));
    const imageUrl = await upload(
      `/images/bot/${moment().unix()}.png`,
      rawImages[0],
      {contentType: 'image/png'}
    )

    await client.pushMessage(
      event.source.groupId || event.source.userId, 
      {
        type: 'image',
        originalContentUrl: imageUrl,
        previewImageUrl: imageUrl
      }
      // imageUrls.map(imageUrl => ({
      //   type: 'image',
      //   originalContentUrl: imageUrl,
      //   previewImageUrl: imageUrl
      // }))
    );
  }
}

const handleEvent = (event) => {

  if (event.type === 'message' && event.message.type === 'text') {
    handleText(event);
  }

  if (event.type === 'message' && event.message.type === 'image') {
    handleImage(event);
  }

}

export default (req, res) => {

  if(req.method === 'POST') {
    res.status(200).end();
    req.body.events.forEach(handleEvent);
  } else {
    res.status(500).end();
  }

}