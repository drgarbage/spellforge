import { useState } from 'react';
import { useRouter } from 'next/router';
import { completions } from '../../libs/api-openai';
import { txt2img } from '../../libs/api-sd';
import { fetchWeather } from '../../libs/api-weather';
import { Card, Grid, Col, Text, Button, Navbar, IconButton, Loading, Checkbox, Modal } from '@nextui-org/react';
import { Send, InfoSquare } from 'react-iconly';
import toast, { Toaster } from 'react-hot-toast';
import profiles from '../../profiles';
import moment from 'moment-timezone';
import Head from 'next/head';

const viewport = {
  width: 'calc((100vh - 100px) * 768 / 1024)',
  height: 'calc(100vh - 100px)',
};
const size = {
  width: 768,
  height: 1024
}

const pick = (items) =>
  items[Math.floor(Math.random()*items.length)];

function completionPrompt(profile) {
  return profile.completionPrompt
    .replace(/\[prefix\]/g, profile.template.prefix || '')
    .replace(/\[posing\]/g, profile.template.posing || '')
    .replace(/\[dressing\]/g, profile.template.dressing || '')
    .replace(/\[quality\]/g, profile.template.quality || '')
    .replace(/\[lora\]/g, profile.template.lora || '')
    .replace(/\[embedding\]/g, profile.template.embedding || '')
    .replace(/\[datetime\]/g, profile.datetime || '')
    .replace(/\[weather\]/g, profile.weather || '')
    .replace(/\[place\]/g, profile.place || '')
    .replace(/\[name\]/g, profile.name || '')
    .replace(/\[character\]/g, profile.character || '')
    ;
}

function templatePrompt(profile) {
  let output = profile.templatePrompt
    .replace(/\[prefix\]/g, profile.template.prefix || '')
    .replace(/\[posing\]/g, profile.template.posing || '')
    .replace(/\[dressing\]/g, profile.template.dressing || '')
    .replace(/\[quality\]/g, profile.template.quality || '')
    .replace(/\[lora\]/g, profile.template.lora || '')
    .replace(/\[embedding\]/g, profile.template.embedding || '')
    .replace(/\[datetime\]/g, profile.datetime || '')
    .replace(/\[weather\]/g, profile.weather || '')
    .replace(/\[place\]/g, profile.place || '')
    .replace(/\[name\]/g, profile.name || '')
    .replace(/\[character\]/g, profile.character || '');

  if(!profile.random) return output;

  for(let key in profile.random) {
    output = output.replace(
      `[random:${key}]`, 
      pick(profile.random[key]));
  }

  return output;
}

const PhotoCard = ({title, subtitle, loading, image, checked, onToggle, onShare}) => 
  <Grid xs={12} css={{justifyContent: 'center'}}>
    <Card css={{...viewport, backgroundColor: '#EEEEEE'}}>

      <Card.Header css={{position: 'absolute', top: 0}}>
        <Col>
          <Text h3 color='white' css={{margin:0}}>{title}</Text>
          <Text  color='white' css={{margin:0}}>{subtitle}</Text>
        </Col>
      </Card.Header>

      { image && 
        <Checkbox 
          checked={checked} 
          onChange={onToggle} 
          css={{
            position: 'absolute', 
            top: 20, 
            right: 20,
          }} />
      }
      
      <Card.Image 
        alt={title}
        src={image}
        containerCss={{...viewport, backgroundSize: 'cover'}}
        width={viewport.width}
        height={viewport.height}
        objectFit="cover"
        />

      { loading &&
        <Card.Body css={{position: 'absolute', top: 'calc((100vh - 100px) * 768 / 1024 * 0.5)'}}>
          <Loading size="xl" color="white" />
        </Card.Body>
      }
    </Card>
  </Grid>


export default function Home() {
  const router = useRouter();
  const { profile : profileName } = router.query;
  const profile = !!profileName ? profiles[profileName] : {name: 'N/A'};
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
      const files = await Promise.all(imagesForShare.map(async (base64img, index) => {
        const blob = await(await fetch(`data:image/png;base64,${base64img}`)).blob();
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

      const { images } = await txt2img({prompt, ...size});
      const collection = post?.images.length > 0 ?
        [...post.images, ...images]:
        images;

      setPost({ prompt, comment, images: collection });

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
      
      const [ prompt, comment ] = await ( async () => {
        if(!!profile.templatePrompt)
          return [templatePrompt({...profile, datetime, weather}), profile.comment];

        const promptForDesc = completionPrompt({...profile, datetime, weather});
        setBackground(promptForDesc);

        const completion = await completions({prompt: promptForDesc});
        const completionResult = completion.data.choices[0].text.trim();
        return completionResult.split('@:@').map(s => 
            s.replace('Prompt:','')
            .replace('prompt:','')
            .replace('Comment:','')
            .replace('comment:','')
            .trim());
      })();

      setPost(p => ({ ...p, prompt, comment }));

      const { images } = await txt2img({prompt, ...size, n_iter: 1});
      const collection = post?.images.length > 0 ?
        [...post.images, ...images]:
        images;

      setPost({ prompt, comment, images: collection });
    }catch(err){
      console.error(err);
      setError(err);
    }finally{
      setLoading(false);
    }
  }

  return (
    <>
      <Head>
        <title>{profile.name}</title>
        <meta name="description" content={post?.comment || profile.name} />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <meta property="og:title" content={post?.prompt || profile.name} />
        <meta property="og:description" content={post?.comment || profile.name} />
        {post?.images.length > 0 && post?.images.map((item,index) => 
          <meta key={index} property="og:image" content={`data:image/png;base64,${item}`} />
        )}
        <meta property="og:image:width" content={size.width} />
        <meta property="og:image:height" content={size.height} />
        <meta property="og:image:alt" content="Photo of a beautiful sunset" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <main>
        <Navbar css={{position: 'fixed', bottom: 0}}>
          <Navbar.Brand>
            <Text h3>{profile.name}</Text>
          </Navbar.Brand>
          <Navbar.Content css={{ "@xs": { jc: "flex-end" }}}>
            {
              loading ?
              <Loading size='sm' /> :
              <>
                <Navbar.Link onClick={selfie}>Generate</Navbar.Link>
                <Navbar.Link onClick={another}>More</Navbar.Link>
              </>
            }
            <Navbar.Link onClick={share}><Send set="broken" /></Navbar.Link>
            <Navbar.Link onClick={info}><InfoSquare set="broken" /></Navbar.Link>
          </Navbar.Content>
        </Navbar>

        <Grid.Container gap={2} justify="center" alignItems="center" css={{ minHeight: '100vh', paddingBottom: '80px' }}>

          <PhotoCard 
            title={profile.name}
            subtitle={profile.username}
            image={profile.avatar}
            loading={loading}
            />

          {post?.images.map((item, index) => (
            <PhotoCard 
              title={profile.name}
              subtitle={profile.username}
              image={`data:image/png;base64,${item}`}
              checked={selectedImages.includes(index)}
              onToggle={() => toggleImageSelection(index)}
              />
          ))}

          { loading && 
            <PhotoCard 
              loading={loading}
              />
          }
        </Grid.Container>
        <Modal scroll closeButton open={showInfo} onClose={()=>setShowInfo(false)}>
          <Modal.Header>
            {profile.name}
          </Modal.Header>
          <Modal.Body>
            <Text h4>Comment</Text>
            <Text>{post?.comment}</Text>
            <Text h4>Image Prompt</Text>
            <Text>{post?.prompt}</Text>

            { !!background &&
              <>
                <Text h4>completion Prompt</Text>
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
