import { SDAPI_DEFAULT_NEG } from './constants';
import { upload } from 'libs/api-firebase';
import { sleep, convertStreamToBase64 } from 'libs/utils';
import client, { pushImages, replyImages } from './client';
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
  const initial = moment();

  if(event.message.contentProvider.type === 'line') {

    const imageContent = await getImageContent(event.message.id);
    const userImageBase64 = await convertStreamToBase64(imageContent);
    const rs = await sdapi(sdapiHost).rembg(userImageBase64);
    const { image: rembgImageBase64 } = rs;

    const prompt = 'line art, sketch, outline, stroke, ultra detailed, (monochrome:1.2), (white background:1.4), (no background:1.4) <lora:animeoutlineV3:0.8>';
    // const prompt = `anime style, flat, icon, abstract, (monochrome:1.2), (empty background:1.3), (white background:1.3) <lora:animeoutlineV3:0.6>`;

    const { images: rawImages } = 
      await sdapi(sdapiHost)
        .txt2img({
          prompt, 
          negative_prompt: SDAPI_DEFAULT_NEG + ' (fill:1.3), (background:1.3), (shadow:1.3)',
          width: 1024,
          height: 768,
          steps: 40,
          cfg_scale: 10,
          sampler_index: 'Euler a',
          batch_size: 4,
          // do_not_save_grid: true,
          // enable_hr: true,
          // denoising_strength: 0.4,
          // hr_scale: 1.334,
          // hr_upscaler: "R-ESRGAN 4x+",
          // hr_second_pass_steps: 0,
          seed: 2062640071,
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
        
    const sequence = moment().unix();
    const meta = {contentType: 'image/png'};

    const imageUrls = await Promise.all(
      rawImages.map(
        (rawImage, index) => 
          upload(`/images/bot/${sequence}-${index}.png`, rawImage, meta)
            .catch(()=>null)
      )
    );
        
    try{
      await replyImages(event, imageUrls);
    } catch (err) {
      await pushImages(event, imageUrls).catch(() => null);
    }
  }
}