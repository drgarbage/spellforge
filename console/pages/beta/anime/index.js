import { SingleGenerationView } from "../../../components/single-gen-base";


export default () => 
  <SingleGenerationView 
    prompt="anime style, outline, cartoon, comic, high quality, high detailed, masterpiece"
    advanceOptions={{
      negative_prompt: '(futa:2), (worse quality:2), (bad quality:2), (normal quality:2), (ugly:1.331), (duplicate:1.331), (morbid:1.21), (mutilated:1.21), (tranny:1.331),(bad anatomy:1.21), (bad proportions:1.331), easynegative, lowres, monochrome, grayscale, backlight, extra digit, NG_DeepNegative_V1_75T, nsfw',
      steps: 40,
      cfg_scale: 7,
      denoising_strength: 0.4,
      sampler_name: 'Euler a',

      // txt2img only
      enable_hr: true,
      hr_scale: 2,
      hr_upscaler: "ESRGAN_4x",
      hr_second_pass_steps: 0,

      override_settings: {
        sd_model_checkpoint: '423dc55b3f'
      }
    }}
    />