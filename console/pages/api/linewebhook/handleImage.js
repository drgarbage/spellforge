import { SDAPI_DEFAULT_NEG } from './constants';
import { upload } from 'libs/api-firebase';
import { sleep, convertStreamToBase64 } from 'libs/utils';
import client, { pushImages, pushText, replyText } from './client';
import sdapi from 'libs/api-sd-remote';
import moment from 'moment-timezone';

const { SDAPI_DEFAULT_HOST : sdapiHost } = process.env;

const getImageContent = async (imageId) => {
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


export const handleImage = async (event) => {
  const initial = new Date();

  if(event.message.contentProvider.type === 'line') {

    await replyText(event, '好的，正在處理照片');

    const imageContent = await getImageContent(event.message.id);
    const userImageBase64 = await convertStreamToBase64(imageContent);
    const rs = await sdapi(sdapiHost).rembg(userImageBase64);
    const { image: rembgImageBase64 } = rs;

    // const rembgImageUrl = await upload(`/images/bot/${moment().unix()}.png`, rembgImageBase64, {contentType: 'image/png'});

    // await pushImages(event, rembgImageUrl);

    const prompt = `anime style, flat, (monochrome:1.2), icon, abstract <lora:animeoutlineV3:0.6>`;

    const { images: rawImages } = 
      await sdapi(sdapiHost)
        .txt2img({
          prompt, 
          negative_prompt: SDAPI_DEFAULT_NEG,
          width: 1024,
          height: 1024,
          steps: 20,
          cfg_scale: 10,
          sampler_index: 'Euler a',
          // enable_hr: true,
          // denoising_strength: 0.5,
          // hr_scale: 3,
          // hr_upscaler: "R-ESRGAN 4x+",
          // hr_second_pass_steps: 0,
          alwayson_scripts: {
            controlnet: {
              args: [
                {
                  input_image: rembgImageBase64,
                  module: "lineart_realistic",
                  model: "control_v11p_sd15_lineart [43d4be0d]",
                  pixel_perfect: true,
                  processor_res: 1024,
                  weight: 1,
                  resize_mode: 2,
                  guidance_start: 0,
                  guidance_end: 1.0
                }
              ]
            }
          }
        });
    
    const imageUrl = await upload(
      `/images/bot/${moment().unix()}.png`,
      rawImages[0],
      {contentType: 'image/png'}
    )

    await pushImages(event, imageUrl);
  }
}