import { Card, Grid, Navbar, Progress, Row, Button, Col, Textarea, Spacer, Loading } from "@nextui-org/react";
import { useEffect, useState, useRef} from "react";
import { useTranslation } from "react-i18next";
import { useWindowDimensions } from "components/use-window-dimensions";
import { useRouter } from "next/router";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faChevronLeft, faSliders } from '@fortawesome/free-solid-svg-icons';
import { isEnglish } from "libs/utils";
import { request } from "libs/api-base";
import { infoFromBase64URL } from 'spellforgejs/lib/utils/image';
import { Slider } from "components/slider";
import { cloneDeep } from "lodash";

import Webcam from "react-webcam";
import Head from "next/head";
import spellforge from "spellforgejs";

const DEVICE_HEIGHT = 'calc(100vh - 92px)';
const api = spellforge({apiKey: '_', credential: '_'});
const percentage = (value) => !!value ? Math.round(value * 100) : 0;

const bytes2Base64URL = file => new Promise((resolve, reject) => {
  const reader = new FileReader();
  reader.readAsDataURL(file);
  reader.onload = () => resolve(reader.result);
  reader.onerror = error => reject(error);
});


export default ({
  prompt,
  size,
  advanceOptions,
  onPreGeneration = ({params}) => Promise.resolve(params),
}) => {
  const { t } = useTranslation();
  const router = useRouter();
  const [infos, setInfos] = useState({
    samplers: [],
    upscalers: [],
    sdmodels: [],
    embeddings: [],
    loras: [],
  });
  const [loading, setLoading] = useState(null);
  const [sourceInfo, setSourceInfo] = useState(null);
  const [resultImage, setResultImage] = useState(null);
  const [params, setParams] = useState({
    prompt: prompt || 'anime style, high quality, high detailed, masterpiece',
    size: size || '512x512',
    n: 1,
    advanceOptions: {
      negative_prompt: '(futa:2), (worse quality:2), (bad quality:2), (normal quality:2), (ugly:1.331), (duplicate:1.331), (morbid:1.21), (mutilated:1.21), (tranny:1.331),(bad anatomy:1.21), (bad proportions:1.331), easynegative, paintings, sketches, lowres, monochrome, grayscale, backlight, extra digit, NG_DeepNegative_V1_75T',
      steps: 20,
      cfg_scale: 7,
      denoising_strength: 0.25,
      sampler_name: 'Euler a',
      override_settings: {
        sd_model_checkpoint: '423dc55b3f'
      },
      ...advanceOptions,
    }
  });
  const [showProps, setShowProps] = useState(false);
  const [showImgOptions, setShowImgOptions] = useState(false);
  const [showCamera, setShowCamera] = useState(false);
  const [facingMode, setFacingMode] = useState('environment');
  const { width, height, mediaConstrain, orientation } = 
    useWindowDimensions(typeof window !== 'undefined' ? window : null);
  const webcamRef = useRef(null);
  const timerRef = useRef(null);
  const liveRef = useRef(false);

  const image = 
    loading?.progressImage ||
    resultImage || 
    '/images/cardface.png';

  const opt = (changes) => setParams({...params, ...changes});
  const adv = (changes) => opt({advanceOptions: {...params?.advanceOptions, ...changes}});
  const ovr = (changes) => adv({override_settings: {...params?.advanceOptions?.override_settings, ...changes}});

  const generate = async (source) => {
    if(loading) return;
    setLoading({progress: 0, progressImage: null, result: null});

    const timeout = 1800000;
    const translate = async (org) => {
      const { prompt } = org;
      if(isEnglish(prompt)) return {...org};
      const { text } = await request('/api/en', {method: 'POST', body: { text: prompt }});
      return {...org, prompt: text};
    }

    try {
      const p = cloneDeep(await translate(params));

      if(source) {
        const targetWidth = width;
        const targetHeight = height;
        const max = Math.max(targetWidth, targetHeight);
        const rate = 1024 / max;
        p.size = `${parseInt(targetWidth * rate)}x${parseInt(targetHeight * rate)}`;
        p.resize = 'fill';
      }

      // if(source) {
      //   p.advanceOptions
      //     .alwayson_scripts
      //     .controlnet.args[0]
      //     .input_image = source;
      // }

      const result = await api.img2img({...p, image: source}, { timeout });

      if(result?.images?.[0]) 
        setResultImage(result?.images?.[0] || null);
      
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(null);
    }
  }

  const onBack = () => 
    router.back();

  const onSelectImage = async (e) => {
    const [file] = e.target.files;
    const base64URL = await bytes2Base64URL(file);
    const info = await infoFromBase64URL(base64URL);
    setSourceInfo(info);
    setSource(base64URL);
    setResultImage(null);
  }

  const onClear = async (e) => {
    setSource(null);
    setSourceInfo(null);
    setResultImage(null);
  }


  useEffect(()=>{
    api
      .infos()
      .then(reference => {

        const sdmodels = reference.sdmodels
          .map(item => ({key: item.hash, name: item.model_name}));

        const samplers = reference.samplers
          .map(item => ({key: item.name, name: item.name}));

        const upscalers = reference.upscalers
          .map(item => ({key: item.name, name: item.name}));

        setInfos({
          sdmodels,
          samplers,
          upscalers
        });
      })
      .catch(console.error);
  }, []);

  useEffect(() => {
    var loading = false;
    
    timerRef.current = setInterval(async () => {
      if(loading) return;
      if(!liveRef.current) return;
      loading = true;
      const srcImg = webcamRef.current.getScreenshot();
      await generate(srcImg);
      loading = false;
    }, 1000);

    return () => clearInterval(timerRef.current);
  },[width, height]);

  return (

    <Col className="fill-available" css={{display: 'flex', flexDirection: 'column'}}>
      <Head>
        <title>Single Generation</title>
        <meta name="description" content="Single Generation" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <style jsx global>
        {`
          body { 
            overflow: hidden;
            height: fill-available;
          }
          .fill-available {
            height: fill-available;
          }
        `}
      </style>

      <Webcam 
        ref={webcamRef}
        style={{position: 'absolute', left: 20, top: 20, width: 120, height: 120, zIndex: 99}}
        open={showCamera}
        audio={false}
        screenshotFormat="image/png"
        videoConstraints={{...mediaConstrain, facingMode}}
        >
          {/* {({ getScreenshot }) => (
            // call getScreenshot
          )} */}
      </Webcam>
      
      <input 
        id="picker" 
        type="file" 
        accept="image/png, image/jpg, image/jpeg"
        style={{display: 'none'}} 
        onChange={onSelectImage}
        />
        
      <Grid.Container gap={2} css={{flex:1, backgroundColor: '#ddd'}}>
        
        <Grid xs={12} alignItems="center" justify="center">
          <Card variant="flat">
            { !!loading &&
              <Card.Header css={{position: 'absolute', top: 5}}>
                <Progress color="primary" size="sm" value={percentage(loading?.progress)} />
              </Card.Header>
            }
            <Card.Image 
              css={{maxHeight: DEVICE_HEIGHT}}
              src={image}
              alt="generativeImage"
            />
          </Card>
        </Grid>
       

      </Grid.Container>

      {!showProps && 
        <Navbar isCompact containerCss={{padding: 0}}>
          <Navbar.Content css={{flex:1}}>
            <Row align="center" justify="space-between">

              <Button auto light onPress={onBack}><FontAwesomeIcon icon={faChevronLeft} /></Button>

              <Button.Group css={{width: '100%'}}>
                <Button onPress={() => setShowProps(!showProps)}><FontAwesomeIcon icon={faSliders} /></Button>
                <Button css={{flex:1}} onPress={()=>liveRef.current = !liveRef.current}>
                  {loading && <Loading color="currentColor" size="xs" />}
                  {!loading && "Generate"}
                </Button>
              </Button.Group>

            </Row>
          </Navbar.Content>
        </Navbar>
      }



      { showProps &&
        <Row 
          onClick={() => setShowProps(false) }
          css={{
            backgroundColor: 'rgba(0,0,0,0.5)',
            position: 'absolute', 
            width: '100vw',
            height: '100vh',
            top: 0,
            zIndex: 98,
          }} 
          />
      }

      { showProps &&
        <Card 
          // className={`${styles.cardAnimation}`}
          css={{
            "&": { borderBottomLeftRadius: 0, borderBottomRightRadius: 0 },
            position: 'absolute',
            bottom: 0,
            zIndex: 99
          }}>
          <Card.Body>
            <Col>
              <select 
                style={{flex:'1,1', width: '100%', height: '44px', overflow: 'clip', borderRadius: 8}} 
                value={params?.advanceOptions?.override_settings?.sd_model_checkpoint || null}
                onChange={e => ovr({sd_model_checkpoint: e.target.value})}
                >
                <option value={null}>未指定</option>
                {infos.sdmodels.map(item => 
                  <option key={item.key} value={item.key}>{item.name}</option>
                )}
              </select>
              <Spacer y={1} />
              <select 
                style={{flex:'1,1', width: '100%', height: '44px', overflow: 'clip', borderRadius: 8}} 
                value={params?.advanceOptions?.sampler_name || null}
                onChange={e => adv({sampler_name: e.target.value})}
                >
                <option value={null}>未指定</option>
                {infos.samplers.map(item => 
                  <option key={item.key} value={item.key}>{item.name}</option>
                )}
              </select>
              <Spacer y={1} />
              <Slider label="繪圖次數" 
                step={1}
                min={1}
                max={150}
                values={[params?.advanceOptions?.steps || 20]}
                onChange={([value]) => adv({steps:value})} 
                />
              <Spacer y={1} />
              <Slider label="細節程度" 
                step={0.1}
                min={1}
                max={30}
                values={[params?.advanceOptions?.cfg_scale || 7]}
                onChange={([value]) => adv({cfg_scale:value})} 
                />
              <Spacer y={1} />
              <Slider label="原圖變化量" 
                step={0.05}
                min={0}
                max={1}
                values={[params?.advanceOptions?.denoising_strength || 0.75]} 
                onChange={([value]) => adv({denoising_strength:value})} 
                />
              <Spacer y={1} />
              <Textarea
                fullWidth
                multiple
                autoFocus
                maxRows={20}
                size="sm"
                aria-label="prompt"
                initialValue={params.prompt} 
                onChange={e => opt({prompt: e.target.value})} 
                />
            </Col>
          </Card.Body>
        </Card>
      }
    </Col>

  );
}