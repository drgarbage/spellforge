import { useEffect, useState } from "react";
import { useTranslation } from "next-i18next";
import { useUserContext } from "context";
import { PostGenerator } from 'libs/post-generator';
import { fetchWeather } from 'libs/api-weather';
import { updatePngInfo } from "libs/api-storage";
import { isEnglish, asBase64PngURL, ensureImageURL } from "libs/utils";
import { request } from "libs/api-base";
import moment from "moment-timezone";
import api from 'libs/api-spellforge-aigc';
// import api from 'libs/api-sd-remote';

export const useGrimoire = ({grimoire : initialGrimoire = null, allowMeta = false, onError = () => {}, onSuccess = () => {}}) => {
  const { t } = useTranslation();
  const { preferences } = useUserContext();
  const { openai: apiKey, sdapi } = preferences;
  const [ grimoire, setGrimoire ] = useState(initialGrimoire);
  const [ loading, setLoading ] = useState(false);
  const [ post, setPost ] = useState({ prompt: '', comment: '', background: null, images: [] });
  const [ auto, setAuto ] = useState(false);
  const [ stamp, setStamp ] = useState(0);
  const [ selectedImages, setSelectedImages ] = useState([]);
  const [ latestSeed, setLatestSeed ] = useState(-1);
  const [ customPrompt, setCustomPrompt ] = useState('');

  const toggleSelection = (index) => {
    if (selectedImages.includes(index)) {
      setSelectedImages(selectedImages.filter((i) => i !== index));
    } else {
      setSelectedImages([...selectedImages, index]);
    }
  }

  const shareSelected = async () => {
    if (!post || !post.images) return;

    try {
      navigator.clipboard.writeText(post?.comment);
      onSuccess(t('MSG.COMMENTS_COPIED_TO_CLIPBOARD'));
    } catch (err) {
      onError(err);
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
      if(!!navigator.canShare && navigator.canShare(shareData))
        await navigator.share(shareData);
    }catch(err){
      onError(err);
    }
  }

  const isSelected = (index) => 
    selectedImages.includes(index);
  
  const generatePrompt = async () => {
    let output = null;
    
    try{
      setLoading(true);

      if(grimoire.type === 'OpenAIGenerator' && apiKey?.length === 0)
        throw new Error(t('ERR.OPENAI_APIKEY_NOT_SET'));

      const datetime = moment().tz('Asia/Taipei').format('hh:mm a');
      const weather = await fetchWeather();
      
      const onUpdate = ({background, prompt, comment}) => {
        setPost(p => ({...p, prompt, comment, background}));
      }

      const postGen = PostGenerator.fromConfig({...grimoire, onUpdate});
      const { prompt } = await postGen.generate({datetime, weather, openaiApiKey: apiKey});

      output = prompt;
    }catch(err){
      console.error(err);
      onError(err);
    }finally{
      setLoading(false);
    }

    return output;
  }

  const generateImage = async (p = undefined) => {
    try{
      setLoading(true);

      const prompt = p || post?.prompt;

      if(!prompt) throw new Error(t('ERR.PROMPT_FORMAT_INCORRECT'));
      if(!sdapi) throw new Error(t('ERR.SDAPI_HOST_NOT_SET'));

      const enCustomPrompt = isEnglish(customPrompt) ? customPrompt :
        await request(`${window.location.host}/api/en`, { method: 'POST', body: customPrompt})
          .catch(() => customPrompt);
      
      const { txt2img } = api(sdapi);
      const { images : rawImages, info } = await txt2img({prompt: `(${enCustomPrompt}) ${prompt}`, ...grimoire?.txt2imgOptions});
      const images = allowMeta ? rawImages : rawImages.map(img => {
        if(img.startsWith('http')) return img;
        return updatePngInfo(img, {parameters: ''});
      });
      const collection = post?.images.length > 0 ?
        [...post.images, ...images]:
        images;
      setPost(p => ({ ...p, images: collection }));
      // setLatestSeed(JSON.parse(info).seed);
    }catch(err){
      console.error(err);
      onError(err);
    }finally{
      setLoading(false);
    }
  }

  const generate = async () => {
    const prompt = await generatePrompt();
    await generateImage(prompt);
    setStamp(moment().unix());
  }

  const resetSeed = () => {
    setGrimoire(g => ({...g, txt2imgOptions: {...g.txt2imgOptions, seed: -1}}));
  }

  const reuseSeed = () => {
    setGrimoire(g => ({...g, txt2imgOptions: {...g.txt2imgOptions, seed: latestSeed}}));
  }

  const deleteImage = (targetIndex) => {
    const nextImages = [...post.images];
    nextImages.splice(targetIndex,1);
    setPost({...post, images: nextImages});
  };

  const useAsCoverImage = async (targetIndex) => {
    const nextGrimoire = {...grimoire };
    if(!nextGrimoire.photos)
      nextGrimoire.photos = [];
    nextGrimoire.photos[0] = ensureImageURL(post.images[targetIndex]);
    setGrimoire(nextGrimoire);
    onSuccess(t('MSG.COVER_UPDATED'));
  };

  useEffect(() => {
    if(loading) return;
    if(!auto) return;
    generate();
  }, [auto, stamp]);

  return {
    loading, setLoading,
    grimoire, setGrimoire,
    post, setPost,
    selectedImages, setSelectedImages, 
    auto, setAuto,
    latestSeed, resetSeed, reuseSeed,
    toggleSelection,
    shareSelected,
    isSelected,
    deleteImage,
    useAsCoverImage,
    generate,
    generatePrompt,
    generateImage: () => generateImage(),
    customPrompt, setCustomPrompt,
  }
}