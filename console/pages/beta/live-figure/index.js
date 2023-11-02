import { SingleGenerationView } from "../components";


export default () => 
  <SingleGenerationView 

    prompt="raw photo, photorealistic, masterpiece, 8k, SONY A7, 50mm, Blurry Background, Feidl of Depth."
    advanceOptions={{
      negative_prompt: '(futa:2), (worse quality:2), (bad quality:2), (normal quality:2), (ugly:1.331), (duplicate:1.331), (morbid:1.21), (mutilated:1.21), (tranny:1.331),(bad anatomy:1.21), (bad proportions:1.331), easynegative, paintings, sketches, lowres, monochrome, grayscale, backlight, extra digit, NG_DeepNegative_V1_75T, nsfw',
      steps: 24,
      cfg_scale: 7,
      denoising_strength: 0.35,
      sampler_name: 'DPM++ 2M Karras',

      // txt2img only
      enable_hr: true,
      hr_scale: 2,
      hr_upscaler: "ESRGAN_4x",
      hr_second_pass_steps: 0,

      override_settings: {
        sd_model_checkpoint: '9c03252bea'
      }
    }}
    />