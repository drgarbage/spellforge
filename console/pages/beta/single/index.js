import { Card, Grid, Navbar, Progress, Row, Text, Button, Col, Textarea, Popover, Avatar, Spacer } from "@nextui-org/react";
import { useEffect, useState } from "react";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faChevronLeft, faCameraRetro, faX, faRotate } from '@fortawesome/free-solid-svg-icons';
import { faImage } from '@fortawesome/free-regular-svg-icons';
import { isEnglish } from "libs/utils";
import { request } from "libs/api-base";
import { useTranslation } from "react-i18next";
import Webcam from "react-webcam";
import Head from "next/head";
import spellforge from "spellforgejs";
import { useWindowDimensions } from "components/use-window-dimensions";

const api = spellforge({apiKey: '_', credential: '_'});
const percentage = (value) => Math.round(value * 100);

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

export default () => {
  const { t } = useTranslation();
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
    size: '512x512',
    n: 1,
    advanceOptions: {
      negative_prompt: '(futa:2), (worse quality:2),(bad quality:2),(normal quality:2), (ugly:1.331), (duplicate:1.331), (morbid:1.21), (mutilated:1.21), (tranny:1.331),(bad anatomy:1.21), (bad proportions:1.331), easynegative, paintings, sketches, lowres, monochrome, grayscale, backlight, extra digit, NG_DeepNegative_V1_75T',
      steps: 24,
      cfg_scale: 7,
      denoising_strength: 0.4,
      sampler_name: 'UniPC',

      // txt2img only
      enable_hr: true,
      hr_scale: 2,
      hr_upscaler: "ESRGAN_4x",
      hr_second_pass_steps: 0,

      // override_settings: {
      //   sd_model_checkpoint: "cf64507cef"
      // }
    }
  });
  const [showProps, setShowProps] = useState(false);
  const [showImgOptions, setShowImgOptions] = useState(false);
  const [showCamera, setShowCamera] = useState(false);
  const [mediaConstrain, setMediaConstrain] = useState({
    facingMode: 'environment', // 'user', 'environment
  });
  const { width, height } = useWindowDimensions(typeof window !== 'undefined' ? window : null);

  const image = 
    loading?.progressImage ||
    resultImage || 
    source || 
    '/images/cardface.png';

  const opt = (changes) => setParams({...params, ...changes});
  const adv = (changes) => opt({advanceOptions: {...params.advanceOptions, ...changes}});
  const ovr = (changes) => adv({override_settings: {...params.advanceOptions.override_settings, ...changes}});

  const onProgress = (progress, progressImage) => {
    if(progress === 1) return;
    if(progressImage)
      setLoading({...loading, progress, progressImage});
    else
      setLoading({...loading, progress});
  };

  const generate = async () => {
    if(loading) return;
    setLoading({progress: 0, progressImage: null, result: null});

    const timeout = 1800000;
    const translate = async (p) => {
      const { prompt } = p;
      if(isEnglish(prompt)) return p;
      const { text } = await request('/api/en', {method: 'POST', body: { text: prompt }});
      return {...p, prompt: text};
    }

    try {
      const p = await translate(params);

      if(source) {
        delete p.advanceOptions.enable_hr;
        delete p.advanceOptions.hr_scale;
        delete p.advanceOptions.hr_upscaler;
        delete p.advanceOptions.hr_second_pass_steps;
        p.resize = 'contain';
      }

      const result = source ?
        await api.img2img({...p, image: source}, { onProgress, timeout }) :
        await api.txt2img(p, { onProgress, timeout});

      if(result?.images?.[0]) 
        setResultImage(result?.images?.[0] || null);
      
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(null);
    }
  }

  const onBack = () => { console.log('back') }

  const onSelectImage = async (e) => {
    const [file] = e.target.files;
    const img = await bytes2Base64URL(file);
    setSource(img);
  }

  useEffect(()=>{
    api
      .infos()
      .then(setInfos)
      .catch(console.error);
  }, []);

  return (
    <Grid.Container gap={1}>
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


      { showCamera &&
        <Webcam 
          style={{height: '100vh', backgroundColor: 'black'}}
          audio={false}
          width="100%"
          height="100%"
          screenshotFormat="image/png"
          videoConstraints={{
            ...mediaConstrain,
            width,
            height,
          }}
          >
            {({ getScreenshot }) => (
              <Row align="center" justify="center" css={{position: "absolute", zIndex: 3, bottom: 20}}>
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
                    setSource(getScreenshot());
                    setShowCamera(false);
                  }}
                  />
                <Spacer x={1} />
                <RoundButton 
                  icon={faRotate} 
                  radius={64}
                  onPress={()=>{
                    setMediaConstrain({
                      ...mediaConstrain, 
                      facingMode: mediaConstrain.facingMode === 'user' ? 'environment' : 'user'
                    });
                  }}
                  />

              </Row>
            )}
        </Webcam>
      }

      { !showCamera &&
        <Navbar isCompact css={{position: 'fixed', bottom: 0, zIndex: 1}}>

          <Navbar.Content css={{flex:1}}>
            <Row align="center">
              <Avatar 
                onClick={onBack}
                css={{'&': { backgroundColor: 'transparent'}}}
                icon={<FontAwesomeIcon icon={faChevronLeft} />} 
                color='transparent'
                />

              <div 
                onClick={() => setShowProps(true)}
                style={{
                  backgroundColor: '#EEE',
                  flex: 1,
                  height: '28px',
                  lineHeight: '24px',
                  padding: '0px 10px 0px 10px',
                  margin: '0px 5px 0px 5px',
                  justifyContent: 'center',
                  verticalAlign: 'center',
                  overflow: 'clip',
                  textOverflow: 'ellipsis ellipsis',
                  borderRadius: 8,
                }}>{params.prompt}</div>

                <Popover isOpen={showImgOptions} onOpenChange={setShowImgOptions}>
                  <Popover.Trigger>
                    <Avatar 
                      src={source || ''} 
                      css={{'&': { backgroundColor: 'transparent'}}}
                      icon={<FontAwesomeIcon icon={faImage} />} 
                      color='transparent'
                      />
                  </Popover.Trigger>
                  <Popover.Content>
                    <Button.Group>
                      { source &&
                        <IconButton
                          onPress={() => {
                            setShowImgOptions(false);
                            setSource(null);
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

              </Row>
          </Navbar.Content>
        </Navbar>
      }
        
      { !showCamera && 
        <Grid css={{height: '100vh'}} xs={12}>
          <Card isPressable onPress={generate}>
            { !!loading?.progress &&
              <Card.Header css={{position: 'absolute', top: 5}}>
                <Progress color="primary" size="sm" value={percentage(loading?.progress)} />
              </Card.Header>
            }
            <Card.Image 
              src={image}
              objectFit="cover"
              width="100%"
              height="100%"
              alt="generativeImage"
            />
          </Card>
        </Grid>
      }

      <Row 
        onClick={() => setShowProps(false) }
        css={{
          backgroundColor: 'rgba(0,0,0,0.5)',
          display: showProps ? 'inherit' : 'none', 
          position: 'absolute', 
          width: '100vw',
          height: '100vh',
          zIndex: 2,
        }} />

      <Card css={{
          display: showProps ? 'inherit' : 'none', 
          position: 'absolute',
          bottom: 0,
          zIndex: 3
        }}>
        <Card.Body>
          <Textarea
            fullWidth
            multiple
            maxRows={20}
            size="sm"
            aria-label="prompt"
            initialValue={params.prompt} 
            onChange={e => opt({prompt: e.target.value})} 
            />
        </Card.Body>
      </Card>
    </Grid.Container>
  );
}