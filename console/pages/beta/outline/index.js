import { SingleGenerationView } from "../components";

export default () => 
  <SingleGenerationView 
    withAPI="txt2img"
    prompt="line art, sketch, outline, stroke, ultra detailed, (monochrome:1.2), (white background:1.4), (no background:1.4) <lora:animeoutlineV3:0.8>"
    advanceOptions={{
      negative_prompt: 'easynegative, ng_deepnegative_v1_75t, (worst quality:2), (low quality:2), (normal quality:2), lowres, ((monochrome)), ((grayscale)), skin spots, acnes, skin blemishes, age spot, backlight, (ugly:1.331), blurry, (bad anatomy:1.21), (bad proportions:1.331) (fill:1.3), (background:1.3), (shadow:1.3)',
      steps: 40,
      cfg_scale: 10,
      sampler_name: 'Euler a',

      // txt2img only
      enable_hr: true,
      hr_scale: 2,
      hr_upscaler: "ESRGAN_4x",
      hr_second_pass_steps: 0,

      seed: 2062640071,

      override_settings: {
        sd_model_checkpoint: '423dc55b3f'
      },

    }}
    onPreGeneration={({params, sourceImage, sourceImageInfo}) => {
      return {
        ...params, 
        resize: undefined,
        advanceOptions: { 
          ...params?.advanceOptions, 

          alwayson_scripts: {
            ...params?.advanceOptions?.alwayson_scripts,

            controlnet: {
              args: [
                {
                  input_image: sourceImage,
                  module: "lineart_realistic",
                  model: "control_v11p_sd15_lineart [43d4be0d]",
                  pixel_perfect: true,
                  weight: 1,
                  guidance_start: 0,
                  guidance_end: 1
                }
              ]
            } // controlnet

          } // alwayson_scripts

        } // advanceOptions
      }
    }}
    />