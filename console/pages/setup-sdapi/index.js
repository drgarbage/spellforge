import dynamic from 'next/dynamic';
import { useRouter } from 'next/router';

const MyPage = () => {
  const router = useRouter();
  const { locale } = router;
  
  const DynamicPage = dynamic(() => import(`./index.${locale}.js`));

  return <DynamicPage />;
};

export default MyPage;
