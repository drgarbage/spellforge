const { request } = require("./api-base");
const { hostPart } = require("./utils");

const BASE_SIZE = 768;
const negative_prompt = "easynegative, extra fingers, paintings, sketches, (worst quality:2), (low quality:2), (normal quality:2), lowres, ((monochrome)), ((grayscale)), skin spots, acnes, skin blemishes, age spot, (outdoor:1.6), manboobs, backlight,(ugly:1.331), (duplicate:1.331), (morbid:1.21), (mutilated:1.21), (tranny:1.331), mutated hands, (poorly drawn hands:1.331), blurry, (bad anatomy:1.21), (bad proportions:1.331), extra limbs, (disfigured:1.331), (more than 2 nipples:1.331), (missing arms:1.331), (extra legs:1.331), (fused fingers:1.61051), (too many fingers:1.61051), (unclear eyes:1.331), bad hands, missing fingers, extra digit, (futa:1.1), bad body, NG_DeepNegative_V1_75T,pubic hair, glans, (lines:1.5), (stroke:1.5) (umbrella:1.3)";
const TXT2IMG_DEFAULTS = {  
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
}
const IMG2IMG_DEFAULTS = {
  // prompt,
  negative_prompt,
  steps: 25,
  denoising_strength: 0.4,
  cfg_scale: 7,
  mask_blur: 4,
  seed: -1,
  batch_size: 1,
  width: 768,
  height: 768,
  sampler_index: 'DPM++ SDE Karras',

  // resize_mode: 0,
  // image_cfg_scale: 2,
  // inpainting_fill: 0,
  // inpaint_full_res: true,
  // inpaint_full_res_padding: 0,
  // inpainting_mask_invert: 0,
  // initial_noise_multiplier: 0,
  // subseed: -1,
  // subseed_strength: 0,
  // seed_resize_from_h: -1,
  // seed_resize_from_w: -1,
  // sampler_name: "",
  // batch_size: 1,
  // n_iter: 1,
  // steps: 50,
  // restore_faces: false,
  // tiling: false,
  // eta: 0,
  // s_churn: 0,
  // s_tmax: 0,
  // s_tmin: 0,
  // s_noise: 1,
  // override_settings: {},
  // override_settings_restore_afterwards: true,
  // include_init_images: false
}

const fixSampler = (params) => {
  const output = {...params};
  if(!output.sampler_name && !!output.sampler_index) {
    output.sampler_name = params.sampler_index;
    delete output.sampler_index;
  }
  return output;
}

const waitForResult = (checker, options) => {
  const { timeout = 20000, interval = 1000} = options || {};
  return new Promise((resolve, reject) => {
    const begin = new Date().getTime();
    const hdl = setInterval(async () => {
      const rs = await checker();

      if(rs === false && new Date().getTime() - begin > timeout) {
        reject("Operation Timeout");
        clearInterval(hdl);
      }

      if(rs !== false){
        resolve(rs);
        clearInterval(hdl);
      }
    }, interval);
  });
}

const sdapi = (h) => {

  const protocol = typeof(window) !== 'undefined' && window.location ? window.location.protocol : 'https:';
  const host = hostPart('https:' + h.replace('http:', '').replace('https:',''));
  
  const task = async (api, params, options = undefined) => {
    const { id: taskId, progress, result } = 
      await request(
        `${host}/api/aigc`, 
        { method: 'POST', body: { api, params: fixSampler(params) } }
      );
        
    if(progress == 1)
      return result;
    else {
      return waitForResult(async () => {
        const { progress, result } = await request(`${host}/api/aigc/${taskId}/result`, {});
        if(progress < 1) return false;
        return result;
      }, options);
    }
  };
  
  return {

    TXT2IMG_DEFAULTS,
    IMG2IMG_DEFAULTS,
    
    txt2img: async (body, options = undefined) => {
      const { images } = await task('txt2img', {...TXT2IMG_DEFAULTS, ...body}, options);
      return { images: images.map(cid => `${protocol}//${host}/api/ipfs/${cid}`) };
    },
    
    img2img: async (body, options = undefined) => {
      const { images } = await task('img2img', {...IMG2IMG_DEFAULTS, ...body}, options);
      return { images: images.map(cid => `${protocol}//${host}/api/ipfs/${cid}`) };
    },
    
    upscale: (body) =>
      request(`${host}/sdapi/v1/extra-single-image`, {method: 'POST', body}),
    
    samplers: () =>
      request(`${host}/sdapi/v1/samplers`, {}),
    
    upscalers: () =>
      request(`${host}/sdapi/v1/upscalers`, {}),
    
    sdmodels: () =>
      request(`${host}/sdapi/v1/sd-models`, {}),

    progress: (preview = false) =>
      request(`${host}/sdapi/v1/progress?skip_current_image=${!preview}`, {}),

    interrogate: (image, model = "clip") =>
      request(`${host}/sdapi/v1/interrogate`, {method: 'POST', body: {image, model}}),

    rembg: (image) =>
      request(`${host}/sdapi/v1/rembg/remove_background`, {method: 'POST', body: { image }}),
  
  };
};

export default sdapi;