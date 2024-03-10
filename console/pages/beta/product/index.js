const { segmentForeground, removeBackground } = require("@imgly/background-removal");
import { SingleGenerationView } from "../../../components/single-gen-base";

export default () => 
  <SingleGenerationView 
    prompt="highend commercial photography, soft background, blurry background, studio lighting, photorealistic, masterpiece, 8k, high quality."
    advanceOptions={{
      negative_prompt: 'easynegative, (worse quality, bad quality, normal quality:2)',
      steps: 24,
      cfg_scale: 7,
      denoising_strength: 0.9,
      sampler_name: 'Euler a',

      override_settings: {
        sd_model_checkpoint: 'e1441589a6'
      },

    }}
    onPreGeneration={async ({params, sourceImage, sourceImageInfo}) => {
      const maskBlob = await segmentForeground(sourceImage);
      const maskB64 = Buffer.from(await maskBlob.arrayBuffer()).toString('base64');
      // console.log('mask64', maskB64.length);
      return {
        ...params, 
        resize: undefined,
        advanceOptions: { 
          ...params?.advanceOptions, 
          mask: maskB64,
          mask_blur_x: 16,
          mask_blur_y: 16,
          inpainting_fill: 1,
          // inpaint_full_res: false,
          // inpaint_full_res_padding: 32,
          inpainting_mask_invert: 1,
        } // advanceOptions
      }
    }}
    />