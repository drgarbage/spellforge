// ConfigEditor.js
import React, { useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/router';
import { document, save } from 'libs/api-firebase';
import { fetchWeather } from 'libs/api-weather';
import { PostGenerator } from 'libs/post-generator';
import { Loading,Card, Button, Row, Grid, Navbar, Switch, Spacer } from '@nextui-org/react';
import { MultiPhotoCard } from 'components/multi-photo-card';
import { Work, ChevronLeft, Play, TimeCircle} from 'react-iconly';
import StableDiffusionPanel from './panel-sd';
import PromptPanel from './panel-prompt';
import InformationPanel from './panel-info';
import moment from 'moment-timezone';
import Head from 'next/head';
import sdapi from 'libs/api-sd-remote';
import { ensureImageURL } from 'libs/utils';

const { txt2img } = sdapi('ai.printii.com');

const strings = {
  "PatternGenerator": "套版提示詞",
  "OpenAIGenerator": "GPT提示詞",
  "PROMPT_PANEL": "樣板設定",
  "SD_PANEL": "產圖參數設定",
  "INFO_PANEL": "資訊",
}

const size = {
  width: 768,
  height: 1024
}


// config {
//   type: 'OpenAIGenerator',
//   name: '',
//   photos: [],
//   openai: 'Ask gpt3 to generate prompt and comment...',
//   openaiOptions: {},
//   prompt: '[openai]',
//   promptOptions: {},
//   comment: '[openai]',
//   commentOptions: {},
//   txt2imgOptions: {},
// }
const Editor = () => {
  const router = useRouter();
  const { id : seriesId } = router.query;
  const [ error, setError ] = useState();
  const [ loading, setLoading ] = useState(false);
  const [ post, setPost ] = useState({});
  const [ config, setConfig ] = useState(null);
  const [ tab, setTab ] = useState("PROMPT_PANEL");
  const [ auto, setAuto ] = useState(false);
  const [ stamp, setStamp ] = useState(0);
  const carouselRef = useRef(null);

  if(!!config && !('txt2imgOptions' in config))
    config.txt2imgOptions = {};
  
  const onConfigChange = (key, value) => {
    setConfig((prevConfig) => ({
      ...prevConfig,
      [key]: value,
    }));
  };

  const appendImages = (newImages) => {
    const images = [...(post?.images || []), ...newImages];
    setPost(p => ({ ...p, images }));
  };

  const generateNewImage = async (prompt, txt2imgOptions = {}) => {
    if(!prompt) return;

    const { images } = await txt2img({prompt, ...size, ...txt2imgOptions});
    appendImages(images);
  };

  const another = async () => {
    if(loading) return;
    if(!post.prompt) return;
    try{
      setError(null);
      setLoading(true);
      await generateNewImage(post.prompt, config?.txt2imgOptions);
      setStamp(moment().unix());
    }catch(err){
      console.error(err);
      setError(err);
    }finally{
      setLoading(false);
    }
  }

  const generate = async () => {
    if(loading) return;
    try{
      setError(null);
      setLoading(true);
      const datetime = moment().tz('Asia/Taipei').format('hh:mm a');
      const weather = await fetchWeather();
      
      const onUpdate = ({background, prompt, comment}) => {
        setPost(p => ({...p, background, prompt, comment}));
      }

      const postGen = PostGenerator.fromConfig({...config, onUpdate});
      const { prompt, comment } = await postGen.generate({datetime, weather});
      
      if(!prompt) 
        throw new Error('Prompt format incorrect.');

      await generateNewImage(prompt, config?.txt2imgOptions);
    }catch(err){
      console.error(err);
      setError(err);
    }finally{
      setLoading(false);
    }

  }

  const onSave = async () => {
    try {
      setError(null);
      setLoading(true);
      await save('series', seriesId, config);
      alert('Saved');
    } catch(err) {
      console.error(err);
      setError(err);
      alert(err.message);
    } finally {
      setLoading(false);
    }
  }

  const reload = async () => {
    if(!seriesId) return;

    try {
      setError(null);
      setLoading(true);
      const cfg = await document('series', seriesId);
      setConfig(cfg);
    } catch(err) {
      console.error(err);
      setError(err);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {reload()}, [seriesId]);
  useEffect(() => {
    if(loading) return;
    if(!auto) return;
    another();
  }, [auto, loading, stamp]);
  useEffect(()=> {
    if((1 + post?.images?.length) <= 1) return;
    if(!carouselRef.current) return;
    carouselRef.current.goToSlide((1 + post?.images?.length) - 1);
  }, [post?.images]);

  return (
    <>
      <Head>
        <title>{config?.name || 'Editor'}</title>
        <meta name="viewport" content="width=device-width, user-scalable=no" />
      </Head>


      <Navbar css={{position: 'fixed', bottom: 0}}>
        <Navbar.Brand>
          <Row align='center'>
            <Button 
              auto light 
              onPress={() => router.back()} 
              icon={<ChevronLeft set="broken"/>} 
              />
          </Row>
        </Navbar.Brand>

        <Navbar.Content>
          <Loading size='sm' css={{display: loading ? 'inherit' : 'none'}} />
          <Navbar.Item>
            <Row align='center'>
              <Switch 
                checked={auto} 
                onChange={() => setAuto(!auto)}
                />
              <Spacer y={1} />
              <Button auto light disabled={loading} onPress={generate} icon={<Play set="broken" />} />
              <Button auto light disabled={loading} onPress={another} icon={<TimeCircle set="broken" />} />
              <Button auto light onPress={onSave} icon={<Work set="broken" />} />
            </Row>
          </Navbar.Item>
        </Navbar.Content>
      </Navbar>
    
      <Grid.Container gap={2} css={{ overflow: 'hidden', minHeight: '100vh', paddingBottom: '80px' }}>
        <Grid xs={12} sm={6} justify="center">
          <MultiPhotoCard
            carouselRef={(el) => (carouselRef.current = el)} 
            loading={loading}
            viewport={{
              width: 'calc((100vh - 100px) * 768 / 1024)',
              height: 'calc(100vh - 100px)',
            }}
            images={[config?.photos[0] || '/images/cardface.png', ...((post.images || []).map(data => ensureImageURL(data)))].map(src => ({src}))}
            />
        </Grid>
        <Grid xs={12} sm={6}>
          <Card>
            <Card.Body>
              
              <Button.Group auto light css={{marginLeft: 0}}>
                {
                  ["PROMPT_PANEL", "SD_PANEL", "INFO_PANEL"].map(item => 
                    <Button
                      key={item}
                      disabled={tab === item}
                      onPress={() => setTab(item)}
                      >
                      {strings[item]}
                    </Button>
                  )
                }
              </Button.Group>

              { tab === "PROMPT_PANEL" &&
                <PromptPanel config={config} onConfigChange={onConfigChange} />
              }

              { tab === "SD_PANEL" &&
                <StableDiffusionPanel config={config} onConfigChange={onConfigChange} />
              }

              { tab === 'INFO_PANEL' &&
                <InformationPanel post={post} onPostChanged={setPost} />
              }

            </Card.Body>
          </Card>
        </Grid>
      </Grid.Container>
    </>
  );
};

export default Editor;
