import { request } from "libs/api-base";

export default async (req, res) => {
  res.status(200).json([
    {
        "name": "None",
        "model_name": null,
        "model_path": null,
        "model_url": null,
        "scale": 4
    },
    {
        "name": "Lanczos",
        "model_name": null,
        "model_path": null,
        "model_url": null,
        "scale": 4
    },
    {
        "name": "Nearest",
        "model_name": null,
        "model_path": null,
        "model_url": null,
        "scale": 4
    },
    {
        "name": "ESRGAN_4x",
        "model_name": "ESRGAN_4x",
        "model_path": "D:\\02.Projects\\stable-diffusion-webui\\models\\ESRGAN\\ESRGAN_4x.pth",
        "model_url": null,
        "scale": 4
    },
    {
        "name": "LDSR",
        "model_name": null,
        "model_path": null,
        "model_url": null,
        "scale": 4
    },
    {
        "name": "R-ESRGAN 4x+",
        "model_name": null,
        "model_path": "https://github.com/xinntao/Real-ESRGAN/releases/download/v0.1.0/RealESRGAN_x4plus.pth",
        "model_url": null,
        "scale": 4
    },
    {
        "name": "R-ESRGAN 4x+ Anime6B",
        "model_name": null,
        "model_path": "https://github.com/xinntao/Real-ESRGAN/releases/download/v0.2.2.4/RealESRGAN_x4plus_anime_6B.pth",
        "model_url": null,
        "scale": 4
    },
    {
        "name": "ScuNET GAN",
        "model_name": "ScuNET GAN",
        "model_path": "https://github.com/cszn/KAIR/releases/download/v1.0/scunet_color_real_gan.pth",
        "model_url": null,
        "scale": 4
    },
    {
        "name": "ScuNET PSNR",
        "model_name": "ScuNET GAN",
        "model_path": "https://github.com/cszn/KAIR/releases/download/v1.0/scunet_color_real_psnr.pth",
        "model_url": null,
        "scale": 4
    },
    {
        "name": "SwinIR 4x",
        "model_name": "SwinIR 4x",
        "model_path": "https://github.com/JingyunLiang/SwinIR/releases/download/v0.0/003_realSR_BSRGAN_DFOWMFC_s64w8_SwinIR-L_x4_GAN.pth",
        "model_url": null,
        "scale": 4
    }
  ]);
  // try{
  //   const rs = await request('https://ai.printii.com/sdapi/v1/upscalers', {})
  //   res.status(200).json(rs);
  // }catch(err){
  //   res.status(500).json({result: false, message: err.message});
  // }
}
