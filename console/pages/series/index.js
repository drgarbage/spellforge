import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import { documents } from "../../libs/api-firebase";
import { Card, Grid, Col, Text } from "@nextui-org/react";
import { PhotoCard } from "../../components/photo-card";
import Head from "next/head";
import styles from '../../styles/Home.module.css';


export default () => {
  const router = useRouter();
  const [docs, setDocs] = useState([]);

  const reload = async () => {
    try{
      const results = await documents('/series', {});
      setDocs(results);
    }catch(err){
      console.error(err);
    }
  }

  useEffect(() => {reload()}, []);
  return (
    <>
      <Head>
        <title>Series</title>
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <main className={styles.main}>
        <Grid.Container gap={2} justify="flex-start" className={styles.cardContainer}>
          { docs.map( (doc,index) => 
            <Grid xs={12} sm={6} md={4} lg={4} css={{justifyContent: 'center'}}>
              <PhotoCard 
                isPressable
                isHoverable
                viewport={{
                  width: 'calc((100vh - 100px) * 768 / 1024)',
                  height: 'calc(100vh - 100px)',
                }}
                cardClass={`${styles.cardAnimation} ${styles.cardHover} ${styles.cardNotHover} ${styles.cardStyle}`}
                cardStyle={{animationDelay: `${index * 100}ms`}}
                title={doc?.name}
                subtitle={`@${doc?.linked?.instagram?.username}`}
                image={doc?.photos?.length > 0 ? doc.photos[0] : 'images/cardface.png'}
                onPress={() => router.push(`/series/${doc.id}`)}
                />
            </Grid>
          )}
        </Grid.Container>
      </main>

      <footer className={styles.footer}>
        by DrCKNY
      </footer>
    </>
  );
}