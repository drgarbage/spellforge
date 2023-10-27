import { Card, Grid, Input, Text } from "@nextui-org/react";
import { useEffect, useState } from "react";
import spellforge from "spellforgejs";

const api = spellforge({apiKey: '_', credential: '_'});
const percentage = (value) => Math.round(value * 100) + '%';

export default () => {
  const [infos, setInfos] = useState({
    samplers: [],
    upscalers: [],
    sdmodels: [],
    embeddings: [],
    loras: [],
  });
  const [loading, setLoading] = useState(null);
  const [source, setSource] = useState(null);
  const [resultImage, setResultImage] = useState(null);
  const [params, setParams] = useState({
    prompt: '1girl',
    size: '768x768',
    n: 1,
    advanceOptions: {
      negative_prompt: '(worse quality:2),(bad quality:2),(normal quality:2),easynegative',

      steps: 24,
      cfg_scale: 7,
      denoising_strength: 0.35,
      sampler_name: 'DPM++ SDE Karras',

      enable_hr: false,
      hr_scale: 1.334,
      hr_upscaler: "ESRGAN_4x",
      hr_second_pass_steps: 0,

      override_settings: {
        // sd_model_checkpoint: "cf64507cef"
      }
    }
  });

  const image = 
    loading?.progressImage ||
    resultImage || 
    source || 
    '/images/cardface.png';

  const opt = (changes) => setParams({...params, ...changes});
  const adv = (changes) => opt({advanceOptions: {...params.advanceOptions, ...changes}});
  const ovr = (changes) => adv({override_settings: {...params.advanceOptions.override_settings, ...changes}});

  const onProgress = (progress, progressImage) => {
    setLoading({progress, progressImage: progressImage || loading?.progressImage});
  };

  const generate = () => {
    setLoading({progress: 0, progressImage: null, result: null});
    const onResult = (result) => {
      if(result?.images?.[0])
        setResultImage(result?.images?.[0] || null);
    }
    api
      .txt2img(params, { onProgress, timeout: 1800000 })
      .then(onResult)
      .catch(console.error)
      .finally(() => setLoading(null));
  }

  useEffect(()=>{
    api
      .infos()
      .then(setInfos)
      .catch(console.error);
  }, []);

  return (
    <Grid.Container gap={1}>
      <Grid xs={12}>
        <Card css={{height: '90vh'}} isPressable onPress={generate}>
          <Card.Header css={{position: 'absolute', top: 5, zIndex: 1}}>
            <Text weight="bold" color="white">{loading?.progress ? percentage(loading.progress) : "Beauty"}</Text>
          </Card.Header>
          <Card.Image 
            src={image}
            objectFit="cover"
            width="100%"
            height="100%"
            alt="generativeImage"
          />
          <Card.Body>
            <Input 
              fullWidth
              initialValue={params?.prompt ?? ''}
              aria-label="prompt"
              onChange={e => {
                e.preventDefault();
                opt({prompt:e.target.value});
              }}
              />
          </Card.Body>
        </Card>
      </Grid>
    </Grid.Container>
  );
}