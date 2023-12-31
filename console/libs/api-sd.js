const { request } = require("./api-base");

const HOST = process.env.SD_HOST || "ai.printii.com";

const BASE_SIZE = 768;
const negative_prompt = "easynegative, extra fingers, paintings, sketches, (worst quality:2), (low quality:2), (normal quality:2), lowres, ((monochrome)), ((grayscale)), skin spots, acnes, skin blemishes, age spot, (outdoor:1.6), manboobs, backlight,(ugly:1.331), (duplicate:1.331), (morbid:1.21), (mutilated:1.21), (tranny:1.331), mutated hands, (poorly drawn hands:1.331), blurry, (bad anatomy:1.21), (bad proportions:1.331), extra limbs, (disfigured:1.331), (more than 2 nipples:1.331), (missing arms:1.331), (extra legs:1.331), (fused fingers:1.61051), (too many fingers:1.61051), (unclear eyes:1.331), bad hands, missing fingers, extra digit, (futa:1.1), bad body, NG_DeepNegative_V1_75T,pubic hair, glans, (lines:1.5), (stroke:1.5) (umbrella:1.3)";
const txt2img_params = {  
  negative_prompt,
  n_iter: 1,
  steps: 30,
  cfg_scale: 11,
  seed: -1,
  batch_size: 1,
  width: BASE_SIZE,
  height: BASE_SIZE,
  sampler_index: 'DPM++ SDE Karras',//'UniPC',
  restore_faces: false,
  save_images: true,

  // upscale
  enable_hr: false,
  denoising_strength: 0.5,
  hr_scale: 1.334,
  hr_upscaler: "ESRGAN_4x",
  hr_second_pass_steps: 0,

  // override_settings: {
  //   sd_model_checkpoint: "cf64507cef"
  // },
}

const txt2img = (body) => 
  request(`${HOST}/sdapi/v1/txt2img`, {method: 'POST', body: {...txt2img_params, ...body}});

const img2img = (body) => 
  request(`${HOST}/sdapi/v1/img2img`, {method: 'POST', body});

const upscale = (body) =>
  request(`${HOST}/sdapi/v1/extra-single-image`, {method: 'POST', body});

const samplers = () =>
  request(`${HOST}/sdapi/v1/samplers`, {});

const upscalers = () =>
  request(`${HOST}/sdapi/v1/upscalers`, {});

const sdmodels = () =>
  request(`${HOST}/sdapi/v1/sd-models`, {});


module.exports = { 
  txt2img, img2img, upscale, samplers, upscalers, sdmodels,
  TXT2IMG_DEFAULTS: txt2img_params 
};