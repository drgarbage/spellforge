import { SingleGenerationView } from "../../../components/single-gen-base";

export default () => 
  <SingleGenerationView 
    prompt="interior design, japanese vibe, luxury, high quality, high detailed, masterpiece, living room, window, tv, sofa, shelf, table, chairs"
    advanceOptions={{
      negative_prompt: 'easynegative, (worse quality, bad quality, normal quality:2)',
      steps: 24,
      cfg_scale: 7,
      denoising_strength: 0.35,
      sampler_name: 'Euler a',

      override_settings: {
        sd_model_checkpoint: 'a8e08b582e'
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
                  weight: 0.8,
                  guidance_start: 0,
                  guidance_end: 0.8
                }
              ]
            } // controlnet

          } // alwayson_scripts

        } // advanceOptions
      }
    }}
    />