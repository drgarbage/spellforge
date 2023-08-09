import { useState } from "react";
import { useRouter } from "next/router";
import { useTranslation } from "next-i18next";
import { serverSideTranslations } from 'next-i18next/serverSideTranslations'
import { Button, Card, Grid, Input, Col, Row, Container } from "@nextui-org/react"
import { createGrimoire } from "libs/api-storage";
import Head from "next/head";

// Grimoire
const GRIMOIRE_DEFAULTS = {
  name: '',
  type: 'PatternGenerator',
  photos: [],
  linked: {
    instagram: {
      username: '',
      password: ''
    }
  },
  prompt: '',
  comment: '[auto-comment]',
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

export default (props) =>{
  const router = useRouter();
  const { t } = useTranslation();
  const [ name, setName ] = useState('');

  const createSeriesAndContinue = async () => {
    if(!name || name.length === 0) return;
    const rs = await createGrimoire({ ...GRIMOIRE_DEFAULTS, name, createAt: new Date() });
    router.replace(`/my/edit/${rs.id}`);
  }

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
      
      <Container fluid gap={1} css={{overflow: 'visible', backgroundColor: 'silver'}}>
        <Grid.Container gap={1} justify="center" css={{overflow: 'visible'}}>
          <Grid xs={12} sm={6} md={4} css={{overflow: 'visible', display: 'flex', flexDirection: 'column', justifyContent:'center', height: '90vh' }}>
            <Card>
              <Card.Image 
                src="/images/cardface.png"
                />
              <Card.Body>
                <Col>
                  <Input 
                    css={{width: '100%'}}
                    label={t('MSG.CREATE_GRIMOIRE')}
                    placeholder={t('MSG.ENTER_NAME')}
                    initialValue={name}
                    onChange={e => setName(e.target.value)}
                    />
                </Col>
              </Card.Body>
              <Card.Footer>
                <Button 
                  auto
                  css={{width: '100%'}}
                  disabled={!name || name.length === 0}
                  onPress={createSeriesAndContinue}>{t('BTN.CREATE')}</Button>
              </Card.Footer>
            </Card>
          </Grid>
        </Grid.Container>
      </Container>
    </>
  );
}