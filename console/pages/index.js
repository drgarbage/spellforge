import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import { useUserContext } from "context";
import { useTranslation } from "next-i18next";
import { serverSideTranslations } from 'next-i18next/serverSideTranslations'
import { getMetadata } from 'meta-png';

import { documents } from "libs/api-firebase";
import { grimoires, createGrimoire, deleteGrimoire } from "libs/api-storage";
import { parseParameters } from "libs/utils";

import { Card, Col, Grid, Text, Avatar, Container, Row, Spacer, Button } from "@nextui-org/react";
import { Box } from "components/box";
import { GrimoireCard } from "components/grimoire-card";

import Dropzone from 'react-dropzone'
import toast, { Toaster } from "react-hot-toast";
import moment from "moment-timezone";

import Image from "next/image";
import Head from "next/head";
import styles from 'styles/Home.module.css';

const GrimoireDefaults = {
  name: 'Grimoire', 
  type: 'PatternGenerator', 
  prompt: '',
  comment: '',
  createAt: new Date()
}

const Section = ({title, children}) => <Row align="center"><Text h4 css={{margin: 20}}>{title}</Text>{children}</Row>

const Zone = ({backgroundColor, children}) => <Box css={{paddingTop: '40px', paddingBottom: '40px', width: '100%',backgroundColor}}><Container>{children}</Container></Box>

const toBase64 = file => new Promise((resolve, reject) => {
  const reader = new FileReader();
  reader.readAsDataURL(file);
  reader.onload = () => resolve(reader.result);
  reader.onerror = error => reject(error);
});

export async function getStaticProps({ locale }) {
  return {
    props: {
      ...(await serverSideTranslations(locale, [
        'common',
      ])),
    },
  }
}

export default () => {
  const router = useRouter();
  const { t } = useTranslation();
  const { preferences } = useUserContext();
  const { avatar } = preferences;
  const [localGrimoires, setLocalGrimoires] = useState([]);
  const [availableGrimoires, setAvailableGrimoires] = useState([]);

  const onDrop = async acceptedFiles => {
    if(acceptedFiles.length < 1) return;

    const [file] = acceptedFiles; // support single file only

    if(file.type !== 'image/png') {
      toast.error(t('ERR.PNG_INCORRECT'));
      return;
    }

    const buffer = new Uint8Array(await file.arrayBuffer());
    const parameters = getMetadata(buffer, 'parameters');
    const grimoire = getMetadata(buffer, 'grimoire');
    const { prompt, ...txt2imgOptions } = parseParameters(parameters) || {};

    if(!grimoire && !prompt) {
      toast.error(t('ERR.PNG_NO_INFO'));
      return;
    }

    const newGrimoire = grimoire || { ...GrimoireDefaults, prompt, txt2imgOptions: {...txt2imgOptions, seed: -1}, createAt: new Date() };
    if(!newGrimoire.photos) newGrimoire.photos = [];
    if(newGrimoire.photos.length === 0) newGrimoire.photos[0] = await toBase64(file);

    const doc = await createGrimoire(newGrimoire);
    router.push(`/my/${doc.id}`);
  }

  const onLocalGrimoireDelete = async (id) => {
    if(!confirm(t('MSG.CONFIRM_DELETE'))) return;
    await deleteGrimoire(id);
    grimoires()
      .then(setLocalGrimoires)
      .catch(console.error);
  }

  useEffect(() => {
    grimoires()
      .then(setLocalGrimoires)
      .catch(console.error);
    documents('grimoires', {})
      .then(docs => docs.map(d => ({...d, createAt:d.createAt.toDate()})))
      .then(setAvailableGrimoires)
      .catch(console.error);
  }, []);

  return (
    <>
      <Head>
        <title>SpellForge - craft your own spells, share your magic</title>
        <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no" />
        <meta name="description" content="SpellForge - Store your prompts for Stable Diffusion image generation." />
        <meta property="og:title" content="SpellForge - AI Spell Collections" />
        <meta property="og:description" content="Store your prompts for Stable Diffusion image generation." />
        <link rel="icon" href="/favicon.ico" />
        <link rel="apple-touch-icon" sizes="768x768" href="/images/avatar.png" />
      </Head>

      <style jsx global>
        {`
          body {
            background: url(/images/bg-home.jpg);
            background-color: black;
            background-attachment: fixed;
            background-size: cover;
            background-position: center;
          }
        `}
      </style>

      <main className={styles.main}>

        <Button 
          auto light
          css={{overflow: 'visible', position: "fixed", top: 40, right: 40 }} 
          icon={<Avatar src={avatar} size="lg" />} 
          onPress={() => router.push('/my')}
          />
        
        <Container gap={1} css={{marginTop: 200}}>

          {
            // -------------------------------------------------------------------
            //
            // 啟動區塊 | 用別人的作品開始 | 建立一個新的魔法書
            //
            // -------------------------------------------------------------------
          }

          <Grid.Container gap={1} justify="center">

            <Grid xs={12} justify="center">
              <Col css={{textAlign: 'center', justifyContent: 'center'}}>
                <Image priority alt="logo" src="/images/logo.svg" width={256} height={256} />
                <Text h2 css={{marginTop: -70}}>{t('SITE.NAME')}</Text>
              </Col>
            </Grid>

            <Grid xs={12} sm={6} md={6} lg={4} justify="center">

              <Dropzone accept={{'image/*': [".png"]}} multiple={false} onDrop={onDrop}>
                {({getRootProps, getInputProps}) => (
                  <Box {...getRootProps()} css={{
                      minWidth: 256, minHeight: 256, 
                      width: '100%', height: '100%',
                      border: '1px dashed white', 
                      padding: 20,
                      display: 'flex',
                      flexDirection: 'column',
                      justifyContent: 'center',
                      backgroundColor: 'rgba(0,0,0,.5)',
                      borderRadius: 10,
                    }}>
                    <Text color="white" h4 css={{textAlign: "center"}}>{t('DSC.DROP_IMG_TITLE')}</Text>
                    <Text color="white" small>{t('DSC.DROP_IMG_INTRO')}</Text>
                    <input {...getInputProps()} />
                  </Box>
                )}
              </Dropzone>
              
            </Grid>
              
            <Grid xs={12} sm={4} md={4} lg={4} justify="center">
              <Card 
                isPressable
                isHoverable
                variant="flat"
                onClick={() => router.push('/my/edit')}
                css={{backgroundColor: '#333', border: '1px dashed white'}}>
                <Card.Header css={{position: 'absolute', top: 0, height: '100%'}}>
                  <Text css={{flex: 1, textAlign: 'center'}} color="white">{t('BTN.GRIMOIRE_CREATE')}</Text>
                </Card.Header>
                <Card.Image 
                  containerCss={{opacity: 0.5}}
                  alt="card"
                  src="/images/cardface.png"
                  objectFit="cover"
                  />
              </Card>
            </Grid>

          </Grid.Container>

        </Container>

          {
            // -------------------------------------------------------------------
            //
            // 本機已儲存的魔法書
            //
            // -------------------------------------------------------------------
          }

        <Spacer y={2} />

        { localGrimoires.length > 0 &&
          <Zone backgroundColor="#ddd">
          
            <Grid.Container gap={2}>

              <Section title={t('SECTION.LOCAL_GRIMOIRES')}>
                <Text>|</Text>
                <Button auto light onPress={() => router.push('/my')}>
                    {t('BTN.MORE')}
                </Button>
              </Section>

              { localGrimoires.map( (doc,index) => 
                <Grid key={doc.id} xs={6} sm={3} md={2} lg={2} css={{justifyContent: 'center'}}>
                  <GrimoireCard 
                    onPress={() => router.push(`/my/${doc.id}`)}
                    image={doc?.photos[0]}
                    title={doc?.name}
                    subtitle={moment(doc?.createAt).fromNow(true)}
                    style={{animationDelay: `${index * 100}ms`}}
                    onDelete={() => onLocalGrimoireDelete(doc.id)}
                    />
                </Grid>
              )}

              <Grid xs={6} sm={3} md={2} lg={2} css={{justifyContent: 'center'}}>
                <Card 
                  isPressable
                  isHoverable
                  variant="flat"
                  onClick={() => router.push('/my/edit')}>
                  <Card.Header css={{position: 'absolute', top: 0, height: '100%'}}>
                    <Text css={{flex: 1, textAlign: 'center'}}>{t('BTN.CREATE')}</Text>
                  </Card.Header>
                  <Card.Image 
                    containerCss={{opacity: 0.05}}
                    alt="create"
                    src="/images/cardface.png"
                    width="100%"
                    height="100%"
                    objectFit="cover"
                    />
                </Card>
              </Grid>

            </Grid.Container>

          </Zone>
        }


        {
          // -------------------------------------------------------------------
          //
          // 從他人分享的項目開始
          //
          // -------------------------------------------------------------------
        }

        { availableGrimoires.length > 0 &&
          <Zone backgroundColor="#ccc">

            <Grid.Container gap={2}>

              <Section title={t('SECTION.OTHER_GRIMOIRES')} />

              { availableGrimoires.map( (doc,index) => 
                <Grid key={doc.id} xs={6} sm={3} md={2} lg={2} css={{justifyContent: 'center'}}>
                  <GrimoireCard 
                    onPress={() => router.push(`/${doc.id}`)}
                    image={doc?.photos[0]}
                    title={doc?.name}
                    subtitle={!!doc?.author ? 'by ' + doc.author : moment(doc?.createAt).fromNow(true)}
                    style={{animationDelay: `${index * 100}ms`}}
                    />
                </Grid>
              )}

              <Grid xs={6} sm={3} md={2} lg={2} css={{justifyContent: 'center', overflow: 'visible'}}>
                <Card
                  isPressable
                  isHoverable
                  variant="flat"
                  className={`${styles.cardAnimation} ${styles.cardHover} ${styles.cardNotHover} ${styles.cardStyle}`}
                  onClick={() => router.push(`/grimoires`)}
                  style={{animationDelay: `${availableGrimoires?.length + 1 * 100}ms`}}
                  >
                  <Card.Header css={{position: 'absolute', top: 0, height: '100%'}}>
                    <Text css={{flex: 1, textAlign: 'center'}}>{t('BTN.BROWSE_MORE')}</Text>
                  </Card.Header>
                  <Card.Image 
                    containerCss={{opacity: 0.05}}
                    alt="browse"
                    src="/images/cardface.png"
                    width="100%"
                    height="100%"
                    objectFit="cover"
                    />
                </Card>
              </Grid>

            </Grid.Container>
          </Zone>
        }

      </main>

      <footer className={styles.footer}>
        <Text color="white">
          {t('COPYRIGHT')}
        </Text>
      </footer>

      <Toaster />
    </>
  );
}