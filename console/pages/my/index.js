import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import { useUserContext } from "context";
import { useTranslation } from "next-i18next";
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';
import { Navbar, Card, Col, Grid, Text, Avatar, Container, Row, Button, Dropdown} from "@nextui-org/react";
import { GrimoireCard } from "components/grimoire-card";
import { grimoires as fetchGrimoires, deleteGrimoire } from "libs/api-storage";
import { documents } from "libs/api-firebase";

import { User, Plus, Setting, Home, MoreSquare } from 'react-iconly';
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faBars } from "@fortawesome/free-solid-svg-icons";

import moment from "moment-timezone";
import Image from "next/image";
import Head from "next/head";
import styles from 'styles/Home.module.css';
import Logo from "images/logo.svg";


const Section = ({title, children}) => 
  <Row align="center">
    <Text h4 css={{margin: 20}}>{title}</Text>
    {children}
  </Row>;

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
  const { avatar, author } = preferences;
  const [localDocs, setLocalDocs] = useState([]);
  const [sharedDocs, setSharedDocs] = useState([]);

  const reload = async () => {
    try{
      const rs = await Promise.all([
        fetchGrimoires().catch(err => ([])),
        documents('grimoires', {}).catch(err => ([]))
      ]);
      setLocalDocs(rs[0]);
      setSharedDocs(rs[1].map(v => ({...v, createAt: new Date(v.createAt.seconds * 1000)})));

    }catch(err){
      console.error(err);
    }
  }

  const onLocalGrimoireDelete = async (id) => {
    if(!confirm(t('MSG.CONFIRM_DELETE'))) return;
    await deleteGrimoire(id);
    reload();
  }

  useEffect(() => {reload()}, []);

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
            background-color: #ddddde;
          }

          .banner {
            background: black url(/images/bg-home.jpg);
            background-size: cover;
            background-position: center;
            min-height: 320px;
            margin-bottom: 120px;
          }
        `}
      </style>

      <main className={styles.main}>

        <Row className="banner">
          <Col>

            <Navbar isCompact variant="floating">
              <Navbar.Brand onClick={() => router.push('/')}>
                <Image width={64} height={64} src={Logo} alt="logo" />
                <Text style={{lineHeight: '16px', textAlign: 'left'}}>
                  <strong>{t('SITE.NAME')}</strong><br/>
                  <small>{t('SITE.SLOGON')}</small>
                </Text>
              </Navbar.Brand>
              <Navbar.Content>
                <Dropdown>
                  <Dropdown.Button light iconRight={<FontAwesomeIcon icon={faBars} />} />
                  <Dropdown.Menu onAction={key => router.push(key)}>
                    <Dropdown.Section>
                      <Dropdown.Item key="/my" icon={<User set="broken" />}>Profile</Dropdown.Item>
                      <Dropdown.Item key="/my/preferences" icon={<Setting set="broken" />}>Preferences</Dropdown.Item>
                      <Dropdown.Item key="/beta" icon={<MoreSquare set="broken" />}>Beta</Dropdown.Item>
                    </Dropdown.Section>
                    <Dropdown.Section>
                      <Dropdown.Item key="/" icon={<Home set="broken" />}>Home</Dropdown.Item>
                    </Dropdown.Section>
                  </Dropdown.Menu>
                </Dropdown>
              </Navbar.Content>
            </Navbar>

          </Col>
        </Row>

        <Container gap={1}>
          <Grid.Container gap={1} className={styles.cardContainer}>

            <Section title={t('SECTION.LOCAL_GRIMOIRES')}>
              <Button light auto as="a" 
                onPress={() => router.push("/my/edit")} 
                icon={<Plus />} 
                />
            </Section>

            { localDocs.map( (doc,index) => 
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
                  src="/images/cardface.png"
                  width="100%"
                  height="100%"
                  objectFit="cover"
                  />
              </Card>
            </Grid>

            { sharedDocs.length > 0 && <Section title={t('SECTION.SHARING_GRIMOIRES')} /> }

            { sharedDocs.map( (doc,index) => 
              <Grid key={doc.id} xs={6} sm={3} md={2} lg={2} css={{justifyContent: 'center', overflow: 'visible'}}>
                <GrimoireCard 
                  onPress={() => router.push(`/${doc.id}`)} 
                  image={doc?.photos[0]} 
                  title={doc?.name}
                  subtitle={moment(doc?.createAt).fromNow(true)}
                  style={{animationDelay: `${index * 100}ms`}}
                  />
              </Grid>
            )}


          </Grid.Container>
        </Container>

        <Row css={{position: 'absolute', top: '185px'}}>
          <Col align="center" css={{padding: 40}}>
            <Avatar css={{size: '$40'}} src={avatar}/>
            <Text h4>{author}</Text>
          </Col>
        </Row>
      </main>

      <footer className={styles.footer}>
        <Text>
          {t('COPYRIGHT')}
        </Text>
      </footer>
    </>
  );
}