import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';

import { serverSideTranslations } from 'next-i18next/serverSideTranslations'
import { document } from 'libs/api-firebase';
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
  
  useEffect(() => {
    if(!grimoireId) return;
    document('grimoires', grimoireId)
      .then(setGrimoire)
      .catch(err => toast.error(err.message));
  }, [grimoireId]);

  return (
    <>
      <ImageForger 
        allowAuto
        allowPrompt
        onBack={() => router.back()}
        grimoire={grimoire} />
      <Toaster />
    </>
  );
}
