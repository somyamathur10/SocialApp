import { useState } from 'react';
import { SessionContextProvider } from '@supabase/auth-helpers-react';
import { ThemeProvider } from 'next-themes';
import { supabase } from '../lib/supabaseClient';
import '../styles/globals.css';

function MyApp({ Component, pageProps }) {
  return (
    <SessionContextProvider
      supabaseClient={supabase}
      initialSession={pageProps.initialSession}
    >
      <ThemeProvider attribute="class">
        <Component {...pageProps} />
      </ThemeProvider>
    </SessionContextProvider>
  );
}

export default MyApp;
