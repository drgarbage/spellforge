import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';

import { serverSideTranslations } from 'next-i18next/serverSideTranslations'
import { grimoire as fetchGrimoire, updateGrimoire } from 'libs/api-storage';
import ImageForger from 'components/image-forger';
import toast, { Toaster } from 'react-hot-toast';

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

export default () => {
  const router = useRouter();
  const { id : grimoireId } = router.query;
  const [grimoire, setGrimoire] = useState(null);

  const onGrimoireChanged = grimoire => {
    updateGrimoire(grimoireId, grimoire)
      .catch(() => setGrimoire(null));
    setGrimoire(grimoire);
  }
  
  useEffect(() => {
    if(!grimoireId) return;
    fetchGrimoire(grimoireId)
      .then(setGrimoire)
      .catch(err => toast.error(err.message));
  }, [grimoireId]);

  return (
    <ImageForger 
      allowRepeat
      allowAuto
      allowInfo
      allowCoverChange
      allowMeta
      allowPrompt
      onBack={() => router.back()}
      onEdit={() => router.push(`/my/edit/${grimoireId}`)}
      grimoire={grimoire} 
      onGrimoireChanged={onGrimoireChanged} />
  );
}
