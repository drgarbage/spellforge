import { faClose } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { Avatar, Button, Card, Container, Grid, Input, Row, Spacer } from "@nextui-org/react";
import { useUserContext } from "context";
import { useRouter } from "next/router";
import { useTranslation } from "next-i18next";
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';
import { InfoCircle } from "react-iconly";
import Dropzone from "react-dropzone";
import Head from "next/head";

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
  const { preferences, setPreference } = useUserContext();
  const { author, avatar, sdapi, openai } = preferences;

  const onDrop = async acceptedFiles => {
    if(acceptedFiles.length < 1) return;
    try{
      const [file] = acceptedFiles;
      const base64URL = await toBase64(file);
      setPreference('avatar', base64URL);
    }catch(err){
      console.error(err);
    }    
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
      
      <Container>
        <Grid.Container justify="center" css={{paddingTop: 80}}>
          <Grid xs={12} sm={6}>
            <Card>
              <Card.Header>
                <Button auto light 
                  css={{position: 'absolute', top: 10, right: 10}}
                  onPress={() => router.back()} 
                  icon={<FontAwesomeIcon size="lg" icon={faClose} />} />
              </Card.Header>
              <Card.Body>

                <Row justify="center">
                  <Dropzone accept={{'image/*': [".png", ".jpg", ".jpeg"]}} multiple={false} onDrop={onDrop}>
                    {({getRootProps, getInputProps}) => (
                      <>
                        <Avatar {...getRootProps()} css={{size: '$40'}} src={avatar} />
                        <input {...getInputProps()} />
                      </>
                    )}
                  </Dropzone>
                </Row>

                <Spacer />

                <Input 
                  label={t('LABEL.USER_NAME')}
                  initialValue={author} 
                  onChange={e => setPreference('author', e.target.value)}
                  />

                <Spacer />

                <Input 
                  label={t('LABEL.SDAPI_HOST')}
                  initialValue={sdapi} 
                  onChange={e => setPreference('sdapi', e.target.value)}
                  labelRight={<Button auto light css={{padding:0}} as="a" href="../setup-sdapi"><InfoCircle set="broken" /></Button>}
                  />

                <Spacer />

                <Input 
                  label={t('LABEL.OPENAI_APIKEY')}
                  type="password"
                  initialValue={openai} 
                  onChange={e => setPreference('openai', e.target.value)}
                  labelRight={<Button auto light css={{padding:0}} as="a" href="../setup-openai"><InfoCircle set="broken" /></Button>}
                  />

              </Card.Body>
              <Card.Footer>
                <Button 
                  color="silver"
                  css={{width: '100%'}} 
                  onPress={() => router.back()}>
                    {t('BTN.DONE')}
                  </Button>
              </Card.Footer>
            </Card> 
          </Grid>
        </Grid.Container>
      </Container>
    </>
  );
}