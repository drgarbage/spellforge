import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import { txt2img } from '../../libs/api-sd';
import { fetchWeather } from '../../libs/api-weather';
import { Card, Grid, Col, Text, Navbar, Loading, Checkbox, Modal, Button, Row } from '@nextui-org/react';
import { Send, InfoSquare, EditSquare, Play, TimeCircle } from 'react-iconly';
import toast, { Toaster } from 'react-hot-toast';
import moment from 'moment-timezone';
import Head from 'next/head';
import { document } from '../../libs/api-firebase';
import { PostGenerator } from '../../libs/post-generator';
import { PhotoCard } from '../../components/photo-card';
import { ensureImageURL } from 'libs/utils';

const size = {
  width: 768,
  height: 1024
}

export default function Series() {
  const router = useRouter();
  const { id : seriesId } = router.query;
  const [ series, setSeries ] = useState();
  const [ loading, setLoading ] = useState(false);
  const [ error, setError ] = useState(null);
  const [ background, setBackground ] = useState(null);
  const [ post, setPost ] = useState({ prompt: '', comment: '', images: [] });
  const [showInfo, setShowInfo ] = useState(false);
  const [selectedImages, setSelectedImages] = useState([]);

  const toggleImageSelection = (index) => {
    if (selectedImages.includes(index)) {
      setSelectedImages(selectedImages.filter((i) => i !== index));
    } else {
      setSelectedImages([...selectedImages, index]);
    }
  };

  const info = () => {
    setShowInfo(true);
  };

  const share = async () => {
    if (!post || !post.images) return;

    try {
      navigator.clipboard.writeText(post?.comment);
      toast('Comments were copied to clipboard.');
    } catch (err) {
      console.error(err);
    }
    
    try{
      const imagesForShare = post?.images.filter((img, index) => selectedImages.includes(index));
      const files = await Promise.all(imagesForShare.map(async (image, index) => {
        const blob = await(await fetch(ensureImageURL(image))).blob();
        const file = new File([blob], `photo-${index}.png`, { type: blob.type });
        return file;
      }));
      const shareData = {
        title: post?.comment,
        text: post?.comment,
        files
      };
      if(navigator.canShare(shareData))
        await navigator.share(shareData);
    }catch(err){
      console.error(err);
      alert(err.message);
    }
  }

  const another = async () => {
    try{
      if(post?.prompt?.length == 0) return;
      const { prompt, comment } = post;

      setError(null);
      setLoading(true);

      const { images } = await txt2img({prompt, ...size, ...series?.txt2imgOptions});
      const collection = post?.images.length > 0 ?
        [...post.images, ...images]:
        images;

      setPost(p => ({ ...p, images: collection }));

    }catch(err){
      console.error(err);
    }finally{
      setLoading(false);
    }
  }
  
  const selfie = async () => {
    try{
      setError(null);
      setLoading(true);
      const datetime = moment().tz('Asia/Taipei').format('hh:mm a');
      const weather = await fetchWeather();
      
      const onUpdate = ({background, prompt, comment}) => {
        setBackground(background);
        setPost(p => ({...p, prompt, comment}));
      }

      const postGen = PostGenerator.fromConfig({...series, onUpdate});
      const { prompt, comment } = await postGen.generate({datetime, weather});
      
      if(!prompt) throw new Error('Prompt format incorrect.');

      const { images } = await txt2img({prompt, ...size, ...series?.txt2imgOptions});
      const collection = post?.images.length > 0 ?
        [...post.images, ...images]:
        images;

      setPost(p => ({ ...p, images: collection }));
    }catch(err){
      console.error(err);
      setError(err);
    }finally{
      setLoading(false);
    }
  }

  const reload = async () => {
    if(!seriesId) return;
    try{
      setError(null);
      setLoading(true);
      const result = await document('/series', seriesId);
      setSeries(result);
    }catch(err){
      setError(err);
    }finally{
      setLoading(false);
    }
  }

  useEffect(() => {reload()}, [seriesId]);

  return (
    <>
      <Head>
        <title>{series?.name}</title>
        <meta name="description" content={post?.comment || series?.name || 'Post Generator'} />
        <meta name="viewport" content="width=device-width, user-scalable=no" />
        <meta property="og:title" content={post?.prompt || series?.name || 'Post Generator'} />
        <meta property="og:description" content={post?.comment || series?.name || 'Post Generator'} />
        {post?.images.length > 0 && post?.images.map((item,index) => 
          <meta key={index} property="og:image" content={ensureImageURL(item)} />
        )}
        <meta property="og:image:width" content={size.width} />
        <meta property="og:image:height" content={size.height} />
        <meta property="og:image:alt" content="Photo of a beautiful sunset" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <Navbar css={{position: 'fixed', bottom: 0, alignItems: 'center'}}>
        <Navbar.Brand>
          <Row alignItems="center">
            <Text h3>{series?.name}</Text>
            <Button auto light onPress={() => router.push(`/series/edit/${seriesId}`)} icon={<EditSquare set="broken"/>} />
          </Row>
        </Navbar.Brand>

        <Navbar.Content>
          <Loading size='sm' css={{display: loading ? 'inherit' : 'none'}} />
          <Navbar.Item css={{display: loading ? 'none' : 'inherit'}}>
            <Row>
              <Button auto light onPress={selfie} icon={<Play set="broken"/>} />
              <Button auto light onPress={another} icon={<TimeCircle set="broken"/>} />
              <Button 
                auto light 
                onPress={share} 
                icon={<Send set="broken" />} 
                />
                <Button auto light onPress={info} icon={<InfoSquare set="broken" />} />
            </Row>
          </Navbar.Item>
        </Navbar.Content>
      </Navbar>

      <main>

        <Grid.Container gap={2} justify="center" alignItems="center" css={{ overflow: 'hidden', minHeight: '100vh', paddingBottom: '80px' }}>

          <Grid xs={12} justify="center">
            <PhotoCard 
              viewport={{
                width: 'calc((100vh - 100px) * 768 / 1024)',
                height: 'calc(100vh - 100px)',
              }}
              title={series?.name}
              subtitle={series?.linked?.instagram?.username}
              image={series?.photos[0] || '/images/cardface.png'}
              loading={loading}
              />
          </Grid>

          {post?.images.map((item, index) => (
            <Grid xs={12} justify="center">
              <PhotoCard 
                viewport={{
                  width: 'calc((100vh - 100px) * 768 / 1024)',
                  height: 'calc(100vh - 100px)',
                }}
                key={index}
                title={series?.name}
                subtitle={series?.username}
                image={ensureImageURL(item)}
                checked={selectedImages.includes(index)}
                onToggle={() => toggleImageSelection(index)}
                />
            </Grid>
          ))}

          { loading && 
            <Grid xs={12} justify="center">
              <PhotoCard 
                viewport={{
                  width: 'calc((100vh - 100px) * 768 / 1024)',
                  height: 'calc(100vh - 100px)',
                }}
                loading={loading}
              />
            </Grid>
          }
        </Grid.Container>
        <Modal scroll closeButton open={showInfo} onClose={()=>setShowInfo(false)}>
          <Modal.Header>
            {series?.name}
          </Modal.Header>
          <Modal.Body>
            <Text h4>Comment</Text>
            <Text>{post?.comment}</Text>
            <Text h4>Image Prompt</Text>
            <Text>{post?.prompt}</Text>

            { !!background &&
              <>
                <Text h4>Background Story</Text>
                <Text>{background}</Text>
              </>
            }
          </Modal.Body>
        </Modal>
        <Toaster />
      </main>
    </>
  );
}
