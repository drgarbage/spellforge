import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import { useTranslation } from "next-i18next";
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';

import { documents } from "../../libs/api-firebase";

import { Grid, Text, Navbar, Dropdown, Container } from "@nextui-org/react";
import { PhotoCard } from "../../components/photo-card";
import { User, Setting, Home } from 'react-iconly';
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faBars } from "@fortawesome/free-solid-svg-icons";

import Head from "next/head";
import Image from "next/image";
import Logo from "images/logo.svg";
import styles from '../../styles/Home.module.css';
import moment from "moment-timezone";


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
  const [docs, setDocs] = useState([]);

  const reload = async () => {
    try{
      const results = (await documents('grimoires', {})).map(d => ({...d, createAt: d.createAt.toDate()}));
      setDocs(results);
    }catch(err){
      console.error(err);
    }
  }

  useEffect(() => {reload()}, []);
  
  return (
    <>
      <Head>
        <title>SpellForge - Grimoires</title>
        <link rel="icon" href="/favicon.ico" />
        <link rel="apple-touch-icon" sizes="768x768" href="/images/avatar.png" />
      </Head>

      <Navbar variant="sticky">
        <Navbar.Brand onClick={() => router.push('/')}>
          <Image width={64} height={64} src={Logo} />
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
              </Dropdown.Section>
              <Dropdown.Section>
                <Dropdown.Item key="/" icon={<Home set="broken" />}>Home</Dropdown.Item>
              </Dropdown.Section>
            </Dropdown.Menu>
          </Dropdown>
        </Navbar.Content>
      </Navbar>

      <main className={styles.main}>

        <Container>
        
          <Grid.Container gap={2} justify="flex-start">
            { docs.map( (doc,index) => 
              <Grid xs={12} sm={6} md={4} lg={4} css={{justifyContent: 'center', overflow: 'visible'}}>
                <PhotoCard 
                  isPressable
                  isHoverable
                  viewport={{}}
                  cardClass={`${styles.cardAnimation} ${styles.cardHover} ${styles.cardNotHover} ${styles.cardStyle}`}
                  cardStyle={{animationDelay: `${index * 100}ms`}}
                  title={doc?.name}
                  subtitle={`@ ${doc?.author}`}
                  image={doc?.photos?.length > 0 ? doc.photos[0] : 'images/cardface.png'}
                  onPress={() => router.push(`/${doc.id}`)}
                  />
              </Grid>
            )}
          </Grid.Container>
          
        </Container>
        
      </main>

      <footer className={styles.footer}>
        by DrCKNY
      </footer>
    </>
  );
}