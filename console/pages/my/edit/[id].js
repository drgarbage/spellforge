// ConfigEditor.js
import React, { useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/router';
import { useTranslation } from "next-i18next";
import { useUserContext } from 'context';

import { serverSideTranslations } from 'next-i18next/serverSideTranslations'
import { grimoire as fetchGrimoire, updateGrimoire } from 'libs/api-storage';
import { fetchWeather } from 'libs/api-weather';
import { PostGenerator } from 'libs/post-generator';

import { Loading,Card, Button, Row, Grid, Navbar, Switch, Spacer, Col, Container } from '@nextui-org/react';
import { MultiPhotoCard } from 'components/multi-photo-card';
import { Work, ChevronLeft, Play, TimeCircle, Delete, ArrowLeftSquare, CloseSquare, Danger} from 'react-iconly';

import StableDiffusionPanel from './panel-sd';
import PromptPanel from './panel-prompt';
import InformationPanel from './panel-info';
import PublishPanel from './panel-publish';
import Head from 'next/head';
import toast, { Toaster } from 'react-hot-toast';

import styles from 'styles/Home.module.css';
import { useGrimoire } from 'components/use-grimoire';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faChevronLeft } from '@fortawesome/free-solid-svg-icons';
import { ensureImageURL } from 'libs/utils';

export const getStaticPaths = async () => {
  return {
    paths: [], //indicates that no page needs be created at build time
    fallback: 'blocking' //indicates the type of fallback
  }
}

export async function getStaticProps({ locale }) {
  return {
    props: {
      ...(await serverSideTranslations(locale, [
        'common',
      ])),
    },
  }
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
  const { t } = useTranslation();
  const { ready, preferences } = useUserContext();
  const { sdapi, openai } = preferences;
  const { id : grimoireId } = router.query;
  const [ tab, setTab ] = useState("PROMPT_PANEL");
  const [ orientation, setOrientation ] = useState("");
  const [ saving, setSaving ] = useState(false);
  const autoSaveRef = useRef();
  const isPortrait = orientation === 'portrait';

  const { 
    loading, setLoading,
    grimoire, setGrimoire,
    post, setPost,
    auto, setAuto,
    deleteImage,
    useAsCoverImage,
    generate,
    generateImage,
    resetSeed,
    reuseSeed,
  } = useGrimoire({
    allowMeta: true,
    onError: err => toast.error(err.message),
    onSuccess: msg => toast.success(msg),
  });

  const carouselRef = useRef(null);

  if(!!grimoire && !('txt2imgOptions' in grimoire))
    grimoire.txt2imgOptions = {};

  const useCurrentImageAsCover = () => {
    const carouse = carouselRef.current;
    if(!carouse) return;
    const targetIndex = carouse.state.currentSlide - 1;
    if(targetIndex < 0) return;
    useAsCoverImage(targetIndex)
  }

  const deleteCurrentImage = () => {
    const carouse = carouselRef.current;
    if(!carouse) return;
    const targetIndex = carouse.state.currentSlide - 1;
    if(targetIndex < 0) return;
    deleteImage(targetIndex);
  }

  const save = async () => {
    try {
      if(saving) return;
      setSaving(true);
      await updateGrimoire(grimoireId, {...grimoire}, true);
    } catch(err) {
      console.error(err);
      toast.error(err.message);
    } finally {
      setSaving(false);
    }
  }
  
  const onConfigChange = (key, value) => {
    setGrimoire((prevConfig) => ({
      ...prevConfig,
      [key]: value,
    }));
  };

  const onSave = async () => {
    await save();
    toast.success(t('MSG.SAVED'), { position: 'bottom-center' });
  }

  const reload = async () => {
    if(!grimoireId) return;

    try {
      setLoading(true);
      const cfg = await fetchGrimoire(grimoireId);
      setGrimoire(cfg);
    } catch(err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {reload()}, [grimoireId]);
  useEffect(()=> {
    if((1 + post?.images?.length) <= 1) return;
    if(!carouselRef.current) return;
    carouselRef.current.goToSlide((1 + post?.images?.length) - 1);
  }, [post?.images]);
  useEffect(() => {
    if(autoSaveRef.current) {
      clearTimeout(autoSaveRef.current);
      autoSaveRef.current = null;
    }
    autoSaveRef.current = setTimeout(save, 1000);
    return () => {
      if(autoSaveRef.current) {
        clearTimeout(autoSaveRef.current);
        autoSaveRef.current = null;
      }
    }
  }, [grimoire]);
  useEffect(() => {
    function handleOrientation() {
      if (window.matchMedia("(orientation: portrait)").matches) {
        setOrientation("portrait");
      } else {
        setOrientation("landscape");
      }
    }
    handleOrientation();
    window.addEventListener("orientationchange", handleOrientation);
    return () => {
      window.removeEventListener("orientationchange", handleOrientation);
    };
  }, []);

  return (
    <>
      <Head>
        <title>SpellForge - Editor</title>
        <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no" />
        <meta name="description" content="SpellForge - Store your prompts for Stable Diffusion image generation." />
        <meta property="og:title" content="SpellForge - AI Spell Collections" />
        <meta property="og:description" content="Store your prompts for Stable Diffusion image generation." />
        <link rel="icon" href="/favicon.ico" />
        <link rel="apple-touch-icon" sizes="768x768" href="/images/avatar.png" />
      </Head>

      <Navbar isCompact css={{position: 'fixed', bottom: 0, zIndex: 99}}>
        <Navbar.Brand>
          <Row align='stretch'>
            <Button auto light onPress={() => router.back()} icon={<FontAwesomeIcon icon={faChevronLeft} />} />
          </Row>
        </Navbar.Brand>

        <Navbar.Content align="stretch">
          <Navbar.Item>
            <Row align='stretch'>
              <Switch css={{marginTop: 6}} size="sm" checked={auto} onChange={() => setAuto(!auto)} />
              <Button auto light disabled={loading} onPress={generate} icon={loading ? <Loading css={{justifyContent:'center'}} color="default" size='xs' /> : <Play set="broken"/>} />
              <Button auto light disabled={loading} onPress={generateImage} icon={<TimeCircle set="broken" />} />
              <Button auto light onPress={onSave} icon={saving ? <Loading css={{justifyContent:'center'}} color="default" size='xs' /> : <Work set="broken" />} />
            </Row>
          </Navbar.Item>
        </Navbar.Content>
      </Navbar>

      <Container fluid gap={1}>
    
        <Grid.Container gap={1} css={{ alignItems: 'center', paddingBottom: '60px' }}>

          { ready && sdapi?.length === 0 &&
            <Grid xs={12} sm={6}>
              <Card variant="bordered" className={`${styles.cardAnimation}`} style={{animationDelay: `100ms`}}>
                <Card.Header>
                  <Danger set="broken" size="xlarge" color="red" />
                  <Spacer x={.5} />
                  <Col>
                    <div><strong>{t('ERR.SDAPI_NOT_SET')}</strong></div>
                    <small>{t('ERR.SDAPI_NOT_SET_DSC')}</small>
                  </Col>
                  <Button auto light color="primary" onPress={() => router.push('/setup-sdapi')}>{t('BTN.SETUP')}</Button>
                </Card.Header>
              </Card>
            </Grid>
          }

          { ready && !!grimoire && grimoire.type === 'OpenAIGenerator' && openai?.length === 0 &&
            <Grid xs={12} sm={6}>
              <Card variant="bordered" className={`${styles.cardAnimation}`} style={{animationDelay: `100ms`}}>
                <Card.Header>
                  <Danger set="broken" size="xlarge" color="red" />
                  <Spacer x={.5} />
                  <Col>
                    <div><strong>{t('ERR.OPENAI_NOT_SET')}</strong></div>
                    <small>{t('ERR.OPENAI_NOT_SET_DSC')}</small>
                  </Col>
                  <Button auto light color="primary" onPress={() => router.push('/setup-openai')}>{t('BTN.SETUP')}</Button>
                </Card.Header>
              </Card>
            </Grid>
          }

          <Grid xs={12} sm={6}>
            <MultiPhotoCard
              carouselRef={(el) => (carouselRef.current = el)} 
              loading={loading}
              viewport={{}}
              images={[grimoire?.photos[0] || '/images/cardface.png', ...((post.images || []).map(data => ensureImageURL(data)))].map(src => ({src}))}
              height={isPortrait ? undefined : "calc(100vh - 100px)"}
              style={{backgroundColor: '#333'}}
              css={{backgroundColor: '#333'}}
              actions={[
                { icon: <ArrowLeftSquare set="broken" color="white" />, onAction: useCurrentImageAsCover },
                { icon: <CloseSquare set="broken" color="white" />, onAction: deleteCurrentImage },
              ]}
              />
          </Grid>

          <Grid xs={12} sm={6}>
            <Card css={{minHeight: isPortrait ? undefined : 'calc(100vh - 100px)'}}>
              <Card.Body>
                <Button.Group auto light css={{marginLeft: 0}}>
                  {
                    ["PROMPT_PANEL", "SD_PANEL", "INFO_PANEL", "PUBLISH_PANEL"].map(item => 
                      <Button
                        auto
                        light
                        css={{padding: 5}}
                        key={item}
                        disabled={tab === item}
                        onPress={() => setTab(item)}
                        >
                        {t(item)}
                      </Button>
                    )
                  }
                </Button.Group>

                { tab === "PROMPT_PANEL" &&
                  <PromptPanel config={grimoire} onConfigChange={onConfigChange} />
                }

                { tab === "SD_PANEL" &&
                  <StableDiffusionPanel config={grimoire} onConfigChange={onConfigChange} onResetSeed={resetSeed} onReuseSeed={reuseSeed} />
                }

                { tab === 'INFO_PANEL' &&
                  <InformationPanel post={post} onPostChanged={setPost} />
                }

                { tab === 'PUBLISH_PANEL' &&
                  <PublishPanel config={grimoire} onConfigChange={onConfigChange} />
                }

              </Card.Body>
            </Card>
          </Grid>
        </Grid.Container>

      </Container>

      <Toaster />
    </>
  );
};

export default Editor;
