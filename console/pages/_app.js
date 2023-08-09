import { createTheme, NextUIProvider } from '@nextui-org/react';
import { config, dom } from "@fortawesome/fontawesome-svg-core";
import { appWithTranslation } from 'next-i18next';

import '../styles/globals.css';

import Head from 'next/head';
import { WithUserContext } from 'context';
config.autoAddCss = false;

const theme = createTheme({
  type: "light", // it could be "light" or "dark"
  theme: {
    colors: {
    },
  }
})


function MyApp({ Component, pageProps }) {
  return (
    <NextUIProvider theme={theme}>
      <WithUserContext>
        <Head>
          <style>{dom.css()}</style>
        </Head>
        <Component {...pageProps} />
      </WithUserContext>
    </NextUIProvider>
  );
}

export default appWithTranslation(MyApp);