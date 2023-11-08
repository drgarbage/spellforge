import { Card, Grid, Navbar, Progress, Row, Text, Button, Col, Textarea, Popover, Avatar, Spacer, Dropdown, Container, Loading } from "@nextui-org/react";
import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { useWindowDimensions } from "components/use-window-dimensions";
import { useRouter } from "next/router";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faChevronLeft, faCameraRetro, faX, faRotate, faSliders, faArrowUpFromBracket } from '@fortawesome/free-solid-svg-icons';
import { faImage } from '@fortawesome/free-regular-svg-icons';
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

const IconButton = ({icon, label, onPress }) =>
  <Button 
    light
    css={{width: 100, height: 100}}
    onPress={onPress}
    >
    <Col>
      <FontAwesomeIcon className='fa-2x' icon={icon} />
      <Text size={8}>{label}</Text>
    </Col>
  </Button>


const RoundButton = ({icon, onPress, radius = 64, iconSize = '2x'}) =>
  <Button 
    rounded
    color='white'
    icon={<FontAwesomeIcon icon={icon} size={iconSize} />}
    css={{minWidth: radius, width: radius, height: radius, '&': { backgroundColor: 'black', color: 'white' }}}
    onPress={onPress}
    />

export const SingleGenerationView = ({
  prompt,
  size,
  withAPI,
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
  const [source, setSource] = useState(null);
  const [sourceInfo, setSourceInfo] = useState(null);
  const [resultImage, setResultImage] = useState(null);
  const [params, setParams] = useState({
    prompt: prompt || '1girl',
    size: size || '512x512',
    n: 1,
    advanceOptions: {
      negative_prompt: '(futa:2), (worse quality:2), (bad quality:2), (normal quality:2), (ugly:1.331), (duplicate:1.331), (morbid:1.21), (mutilated:1.21), (tranny:1.331),(bad anatomy:1.21), (bad proportions:1.331), easynegative, paintings, sketches, lowres, monochrome, grayscale, backlight, extra digit, NG_DeepNegative_V1_75T',
      steps: 24,
      cfg_scale: 7,
      denoising_strength: 0.4,
      sampler_name: 'Euler a',

      // txt2img only
      enable_hr: true,
      hr_scale: 2,
      hr_upscaler: "ESRGAN_4x",
      hr_second_pass_steps: 0,

      ...advanceOptions,
    }
  });
  const [showProps, setShowProps] = useState(false);
  const [showImgOptions, setShowImgOptions] = useState(false);
  const [showCamera, setShowCamera] = useState(false);
  const [facingMode, setFacingMode] = useState('environment');
  const { width, height, mediaConstrain, orientation } = 
    useWindowDimensions(typeof window !== 'undefined' ? window : null);

  const image = 
    loading?.progressImage ||
    resultImage || 
    source || 
    '/images/cardface.png';

  const opt = (changes) => setParams({...params, ...changes});
  const adv = (changes) => opt({advanceOptions: {...params?.advanceOptions, ...changes}});
  const ovr = (changes) => adv({override_settings: {...params?.advanceOptions?.override_settings, ...changes}});

  const onProgress = (progress, progressImage) => {
    setLoading((loading) => {
      if(loading === null) return loading;
      if(progress === 1) return null;
      if(progressImage)
        return {...loading, progress, progressImage};
      else
        return {...loading, progress};
    });
  };

  const generate = async () => {
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
        delete p.advanceOptions.enable_hr;
        delete p.advanceOptions.hr_scale;
        delete p.advanceOptions.hr_upscaler;
        delete p.advanceOptions.hr_second_pass_steps;
        p.resize = 'cover';
      }

      if(source && sourceInfo) {
        const targetWidth = sourceInfo['Image Width'].value;
        const targetHeight = sourceInfo['Image Height'].value;
        const max = Math.max(targetWidth, targetHeight);
        const rate = 1024 / max;
        p.size = `${parseInt(targetWidth * rate)}x${parseInt(targetHeight * rate)}`;
        p.resize = 'fill';
      }

      const adjustedParam = await onPreGeneration({
        params: p, 
        sourceImage: source, 
        sourceImageInfo: sourceInfo
      });

      const result = source && withAPI !== 'txt2img' ?
        await api.img2img({...adjustedParam, image: source}, { onProgress, timeout }) :
        await api.txt2img({...adjustedParam}, { onProgress, timeout});

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

  const onCameraShot = async (base64URL) => {
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

  const onShare = async () => {
    try {
      const blob = await(await fetch(resultImage)).blob();
      const file = new File([blob], `photo.png`);
      const shareData = {
        title: params.prompt,
        text: params.prompt,
        files: [file]
      };
      if(navigator.canShare(shareData))
        await navigator.share(shareData);
    } catch(err) {
      console.error(err);
      alert(err.message);
    }
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

      <input 
        id="picker" 
        type="file" 
        accept="image/png, image/jpg, image/jpeg"
        style={{display: 'none'}} 
        onChange={onSelectImage}
        />
        
      <Grid.Container gap={2} css={{flex:1, backgroundColor: '#ddd'}}>
        
        { !showCamera &&
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
        }

        { showCamera &&
          <Grid xs={12} alignItems="center" justify="center" css={{display: showCamera ? "inherit" : "none"}}>
            <Card>
              <Card.Body css={{padding:0}}>

                <Webcam 
                  open={showCamera}
                  audio={false}
                  screenshotFormat="image/png"
                  videoConstraints={{...mediaConstrain, facingMode}}
                  >
                    {({ getScreenshot }) => (
                      <Row align="center" justify="center" css={{position: "absolute", zIndex: 3, bottom: 40, opacity: 0.5}}>
                        <RoundButton 
                          icon={faX} 
                          radius={64}
                          onPress={()=>{
                            setShowCamera(false);
                          }}
                          />
                        <Spacer x={1} />
                        <RoundButton 
                          icon={faCameraRetro} 
                          radius={84}
                          onPress={()=>{
                            setShowCamera(false);
                            onCameraShot(getScreenshot());
                          }}
                          />
                        <Spacer x={1} />
                        <RoundButton 
                          icon={faRotate} 
                          radius={64}
                          onPress={()=>{
                            setFacingMode(
                              facingMode === 'user' ? 
                                'environment' : 'user'
                            );
                          }}
                          />

                      </Row>
                    )}
                </Webcam>
              </Card.Body>
            </Card>
          </Grid>
        }
       

      </Grid.Container>

      {!showProps && 
        <Navbar isCompact containerCss={{padding: 0}}>
          <Navbar.Content css={{flex:1}}>
            <Row align="center" justify="space-between">

              <Button auto light onPress={onBack}><FontAwesomeIcon icon={faChevronLeft} /></Button>

              <Button.Group css={{width: '100%'}}>
                <Button onPress={() => setShowProps(!showProps)}><FontAwesomeIcon icon={faSliders} /></Button>
                <Button css={{flex:1}} onPress={generate}>
                  {loading && <Loading color="currentColor" size="xs" />}
                  {!loading && "Generate"}
                </Button>
              </Button.Group>

              <Button.Group color="default">

                <Popover isOpen={showImgOptions} onOpenChange={setShowImgOptions}>
                  <Popover.Trigger>
                    <Button auto><FontAwesomeIcon icon={faImage} /></Button>
                  </Popover.Trigger>
                  <Popover.Content>
                    <Button.Group>
                      { source &&
                        <IconButton
                          onPress={() => {
                            setShowImgOptions(false);
                            onClear();
                          }}
                          icon={faX}
                          label="清除選取"
                          />
                      }
                      <IconButton
                        onPress={() => {
                          setShowImgOptions(false);
                          picker.click();
                        }} 
                        icon={faImage}
                        label="從相簿載入"
                        />
                      <IconButton
                        onPress={() => {
                          setShowImgOptions(false);
                          setShowCamera(!showCamera);
                        }}
                        icon={faCameraRetro}
                        label="拍攝照片"
                        />
                    </Button.Group>
                  </Popover.Content>
                </Popover>

                <Button auto onPress={onShare}><FontAwesomeIcon icon={faArrowUpFromBracket} /></Button>

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