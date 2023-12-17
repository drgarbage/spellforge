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

export const handleImageAlbum = async (event) => {

  if(event.message.contentProvider.type === 'line') {
    const imageContent = await getImageContent(event.message.id);
    const userImageBase64 = await convertStreamToBase64(imageContent);
    
    const prompt = `
      (35mm Sigma f/1.4 ZEISS lens, F1.4, 1/200s, ISO 100, photography:1.1),
      photorealistic, masterpiece, ultra detailed, 
      1girl, long heavy brown hair, elegant pose, cowboy shot, small breast, white dress,
      bed room, bed, pillow, wall, lamp, window, sunset,
    `;

    const negative_prompt = `
      EasyNegative, illustration, 3d, 2d, painting, cartoons, sketch,
      (worse quality:2), (low quality:2), (normal quality:2), lowres,
      (dark hair:1.4), bad anatomy, bad hands, vaginas in breasts, ((monochrome)), ((grayscale)), collapsed eyeshadow, multiple eyebrows, (cropped), oversaturated, extra limbs, extra arms, missing limbs, deformed hands, long neck, long body, imperfect, (bad hands), signature, watermark, username, artist name, conjoined fingers, deformed fingers, ugly eyes, imperfect eyes, skewed eyes, unnatural face, unnatural body, error, bad image, bad photo,
      (hat:1.2)
    `;
    
    const { images: rawImages } = 
      await sdapi(sdapiHost)
        .txt2img({
          prompt, 
          negative_prompt,
          width: 768,
          height: 768,
          steps: 40,
          cfg_scale: 10,
          sampler_index: 'DPM++ SDE Karras',
          batch_size: 4,
          // do_not_save_grid: true,
          enable_hr: true,
          denoising_strength: 0.7,
          hr_scale: 1.334,
          hr_upscaler: "Latent",
          hr_second_pass_steps: 0,
          // seed: 2062640071,
          alwayson_scripts: {
            reactor: {
              args: [
                userImageBase64,
                true, // 1 Enable ReActor
                '0', // 2 Comma separated face number(s) from swap-source image
                '0', // 3 Comma separated face number(s) for target image (result)
                "D:\\02.Projects\\stable-diffusion-webui\\models\\insightface\\inswapper_128.onnx", // 4 model path 
                'CodeFormer', // 4 Restore Face: None; CodeFormer; GFPGAN
                1, // 5 Restore visibility value
                true, // 7 Restore face -> Upscale
                '4x_NMKD-Superscale-SP_178000_G', // 8 Upscaler (type 'None' if doesn't need), see full list here: http://127.0.0.1:7860/sdapi/v1/script-info -> reactor -> sec.8
                1, // 9 Upscaler scale value
                1, // 10 Upscaler visibility (if scale = 1)
                false, // 11 Swap in source image
                true, // 12 Swap in generated image
                0, // 13 Console Log Level (0 - min, 1 - med or 2 - max)
                0, // 14 Gender Detection (Source) (0 - No, 1 - Female Only, 2 - Male Only)
                0, // 15 Gender Detection (Target) (0 - No, 1 - Female Only, 2 - Male Only)
                false, // 16 Save the original image(s) made before swapping
                0.8, // 17 CodeFormer Weight (0 = maximum effect, 1 = minimum effect), 0.5 - by default
                false, // 18 Source Image Hash Check, true - by default
                false, // 19 Target Image Hash Check, false - by default
                "CUDA", // 20 CPU or CUDA (if you have it), CPU - by default
                true, // 21 Face Mask Correction
                0, // 22 Select Source, 0 - Image, 1 - Face Model
                "", // 23 Filename of the face model (from "models/reactor/faces"), e.g. elena.safetensors
              ],
            },
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

export const handleImageLineart = async (event) => {

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