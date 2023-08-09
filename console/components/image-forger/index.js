import React, { useCallback, useEffect, useRef, useState } from 'react';
import { useTranslation } from "next-i18next";
import { useGrimoire } from 'components/use-grimoire';

import { pngInfo as getPngInfo } from 'libs/api-storage';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';
import { Grid, Text, Navbar, Loading, Modal, Button, Row, Switch, Col, Spacer, Card, Container, Input, Textarea } from '@nextui-org/react';
import { Send, InfoSquare, Play, TimeCircle, CloseSquare, TickSquare, ArrowUpSquare, Show, Hide, Danger } from 'react-iconly';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faChevronLeft, faCopy, faSliders } from '@fortawesome/free-solid-svg-icons';
import { faCircleUp } from '@fortawesome/free-regular-svg-icons';
import { PhotoCard } from 'components/photo-card';
import { asBase64Image } from 'libs/utils';
import { useUserContext } from 'context';
import { useRouter } from 'next/router';
import api from 'libs/api-sd-remote';

import ReactMarkdown from 'react-markdown';
import toast, { Toaster } from 'react-hot-toast';
import Head from 'next/head';
import styles from 'styles/Home.module.css';

const byRange = (rangeMap, value) => 
  rangeMap.reduce((p,c) => value > c[0] ? c[1] : p , "")

export const getStaticPaths = async () => {
  return {
    paths: [], 
    fallback: 'blocking'
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

export default ({
  grimoire : initialGrimoire, 
  onGrimoireChanged,
  allowInfo = false,
  allowRepeat = false,
  allowAuto = false,
  allowShare = false,
  allowPrompt = false,
  allowCoverChange = false,
  allowMeta = false,
  onEdit,
  onBack,
  ...rest
}) => {
  const router = useRouter();
  const { t } = useTranslation();
  const { ready, preferences } = useUserContext();
  const { sdapi, openai } = preferences;
  const { 
    loading, 
    grimoire, setGrimoire,
    post, 
    auto, setAuto,
    toggleSelection,
    shareSelected,
    isSelected,
    deleteImage,
    useAsCoverImage,
    generate,
    generateImage,
    customPrompt, setCustomPrompt,
  } = useGrimoire({
    grimoire: initialGrimoire,
    allowMeta,
    onError: err => toast.error(err.message),
    onSuccess: msg => toast.success(msg),
  });

  const [ pngInfo, setPngInfo ] = useState(null);
  const [ showOverlay, setShowOverlay ] = useState(allowInfo);
  const [ closeRate, setCloseRate ] = useState(0);
  const [ live, setLive ] = useState();
  const [ stamp, setStamp ] = useState(0);
  const progressRef = useRef(null);
  const bottomRef = useRef(null);
  const progress = !!live ? Math.floor(live.progress * 100) : -1;
  const eta = !!live ? Math.floor(live.eta_relative) : -1;

  // const size = {
  //   width: grimoire?.txt2imgOptions?.width || 512,
  //   height: grimoire?.txt2imgOptions?.height || 512,
  // };

  const info = (image) => {
    setPngInfo(image.startsWith('http') ? {} : getPngInfo(image));
  };

  const copy = (text) => {
    navigator.clipboard.writeText(text);
    toast.success('Copied to clipboard.');
  }

  const handleScroll = useCallback(() => {
    if(loading) { setCloseRate(0); return; }
    if(!bottomRef.current) return;
    const anchor = bottomRef.current;

    const cursorPos = document.documentElement.scrollTop + window.innerHeight - 80;
    const baseline = anchor.offsetTop + 100;
    const target = anchor.offsetTop + anchor.offsetHeight;

    let progress = 0;

    if(cursorPos < baseline) {
      progress = 0;
    } else if (cursorPos > baseline && cursorPos < target) {
      progress = (cursorPos - baseline) / (target - baseline);
    } else if (cursorPos > target) {
      progress = 1;
    } else {
      progress = 0;
    }

    setCloseRate(progress);
  }, [loading, grimoire, generate, bottomRef, setCloseRate]);

  useEffect(() => {
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, [handleScroll]);
  useEffect(() => {setGrimoire(initialGrimoire)}, [initialGrimoire]);
  useEffect(() => {!!onGrimoireChanged && onGrimoireChanged(grimoire)}, [grimoire]);
  useEffect(() => {
    if(loading || closeRate < 1) return;
    setCloseRate(0);
    generate();
  }, [grimoire, generate, closeRate]);
  useEffect(() => {
    if(loading && !progressRef.current) {
      progressRef.current = setInterval(() => {
        setStamp(new Date().valueOf());
      }, 3000);
    }

    if(!loading && !!progressRef.current) {
      clearInterval(progressRef.current);
      progressRef.current = null;
    }

    return () => {
      clearInterval(progressRef.current);
      progressRef.current = null;
    }
  }, [setStamp, setLive, loading]);
  useEffect(()=>{
    if(!loading) return;
    api(sdapi)
      .progress(true)
      .then(setLive)
      .catch(console.error);
  }, [loading, stamp, setLive]);

  return (
    <>
      <Head>
        <title>{grimoire?.name}</title>
        <meta name="description" content={post?.comment || grimoire?.name || 'Post Generator'} />
        <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <Navbar isCompact css={{position: 'fixed', bottom: 0, zIndex: 99}}>
        <Navbar.Brand>
            <Row align='stretch'>
              {onBack && <Button auto light onPress={onBack} icon={<FontAwesomeIcon icon={faChevronLeft} />} />}
              <Button auto light css={{padding: 0, fontWeight: 'bold'}}>{grimoire?.name}</Button>
              {onEdit && <Button auto light onPress={onEdit} icon={<FontAwesomeIcon icon={faSliders} />} />}
            </Row>
        </Navbar.Brand>

        <Navbar.Content align="stretch">
          <Navbar.Item>
            <Row align='stretch'>
              {allowAuto && <Switch css={{marginTop: 6}} size="sm" checked={auto} onChange={() => setAuto(!auto)} />}
              <Button auto light disabled={loading} onPress={generate} icon={loading ? <Loading css={{justifyContent:'center'}} color="default" size='xs' /> : <Play set="broken"/>} />
              {allowRepeat && <Button auto light disabled={loading} onPress={generateImage} icon={<TimeCircle set="broken"/>} />}
              {allowShare && <Button auto light onPress={shareSelected} icon={<Send set="broken" />} />}
              {allowInfo && <Button auto light onPress={() => setShowOverlay(!showOverlay)} icon={showOverlay ? <Show set="broken" /> : <Hide set="broken" />} /> }
            </Row>
          </Navbar.Item>
        </Navbar.Content>
      </Navbar>

      <main>
        <Container fluid gap={1}>

          <Grid.Container gap={1} justify="center" alignItems="center" css={{ minHeight: 'calc(100vh - 144px)'}}>

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

            <Grid xs={12} gap={0} justify="center">
            <Grid gap={0} xs={12} sm={6} justify="center" css={{overflow: 'visible'}}>
              <PhotoCard 
                viewport={{}}
                title={grimoire?.name}
                subtitle={grimoire?.linked?.instagram?.username}
                image={grimoire?.photos[0] || '/images/cardface.png'}
                actions={showOverlay && grimoire?.photos[0] ? [{ icon: <InfoSquare set="broken" color="white" />, onAction: () => info(asBase64Image(grimoire?.photos[0])) }] : []}
                />
            </Grid>
            </Grid>

            {post?.images.map((item, index) => (
              <Grid xs={12} gap={0} justify="center">
              <Grid gap={0} key={index} xs={12} sm={6} justify="center" css={{overflow: 'visible'}}>
                <PhotoCard 
                  isSelectable
                  viewport={{}}
                  key={index}
                  image={`data:image/png;base64,${item}`}
                  actions={showOverlay ? [
                    allowShare && { icon: <TickSquare set="broken" color={isSelected(index) ? "yellow" : "white"} />, onAction: () => toggleSelection(index) },
                    allowCoverChange && { icon: <ArrowUpSquare set="broken" color="white" />, onAction: () => useAsCoverImage(index) },
                    { icon: <CloseSquare set="broken" color="white" />, onAction: () => deleteImage(index) },
                    { icon: <InfoSquare set="broken" color="white" />, onAction: () => info(item) }
                  ] : []}
                  />
              </Grid>
              </Grid>
            ))}

            { loading && !!live && live.progress > 0 &&
              <Grid xs={12} gap={0} justify="center">
              <Grid gap={0} className={`${styles.cardEnter}`} xs={12} sm={6} justify="center" css={{overflow: 'visible'}}>
                <PhotoCard 
                  title={progress + '%'}
                  loading={loading}
                  image={!!live.current_image ? `data:image/png;base64,${live.current_image}` : '/images/cardface.png'}
                  />
              </Grid>
              </Grid>
            }

            { allowPrompt &&
              <Grid xs={12} sm={6}>
                <Textarea 
                  minRows={1}
                  css={{flex: 1}} 
                  placeholder='You may add some prompt to guide the generate result.'
                  initialValue={customPrompt} 
                  onChange={e => setCustomPrompt(e.target.value)} 
                  />
              </Grid>
            }
          </Grid.Container>
          
          <div ref={bottomRef} style={{
            flex: 1,
            display: 'flex', 
            position: 'absolute',
            width: 'calc(100vw - 24px)',
            height: '200px',
            flexDirection: 'column', 
            paddingTop: '23px',
            justifyContent: loading ? 'flex-start' : 'center', 
            alignItems: 'center',
            color: 'gray',
          }}>
            { loading && <Loading type='points-opacity' size='lg' color="currentColor">{t("MSG.LOADING")}</Loading> }
            { !loading && <FontAwesomeIcon style={{fontSize: '64px', opacity: closeRate, transform: `rotate(${180*closeRate}deg)`, marginBottom: 10}} icon={faCircleUp} />}
            { !loading &&
              byRange([
                [0, " "],
                [0.5, t("MSG.PULL_TO_GENERATE")],
                [0.8, t("MSG.READY")]
              ], closeRate)
            }
          </div>

          <Modal scroll closeButton blur autoMargin width='90%' open={!!pngInfo} onClose={()=>setPngInfo(null)}>
            <Modal.Header>
              {grimoire?.name}
            </Modal.Header>
            <Modal.Body>
              <ReactMarkdown>{grimoire?.description}</ReactMarkdown>
              <Text h4 onClick={() => copy(pngInfo?.prompt)}>Prompt<FontAwesomeIcon style={{marginLeft: 10}} icon={faCopy} /></Text>
              <Text>{pngInfo?.prompt}</Text>
              <Text h4 onClick={() => copy(pngInfo?.nagetive_prompt)}>Nagetive Prompt<FontAwesomeIcon style={{marginLeft: 10}} icon={faCopy} /></Text>
              <Text>{pngInfo?.nagetive_prompt}</Text>
              <Row justify="space-between">
                <Text b>Sampler</Text>
                <Text>{pngInfo?.sampler_index}</Text>
              </Row>
              <Row justify="space-between">
                <Text b>Steps</Text>
                <Text>{pngInfo?.steps}</Text>
              </Row>
              <Row justify="space-between">
                <Text b>CFG Scale</Text>
                <Text>{pngInfo?.cfg_scale}</Text>
              </Row>
              <Row justify="space-between">
                <Text b onClick={() => copy(pngInfo?.seed)}>Seed<FontAwesomeIcon style={{marginLeft: 10}} icon={faCopy} /></Text>
                <Text>{pngInfo?.seed}</Text>
              </Row>
              <Row justify="space-between">
                <Text b>Size</Text>
                <Text>{`${pngInfo?.width}x${pngInfo?.height}`}</Text>
              </Row>
              { !!pngInfo?.override_settings?.sd_model_checkpoint &&
                <Row justify="space-between">
                  <Text b>Model</Text>
                  <Text>{pngInfo?.override_settings?.sd_model_checkpoint}</Text>
                </Row>
              }
            </Modal.Body>
          </Modal>
          <Toaster />

        </Container>
      </main>
    </>
  );
}
