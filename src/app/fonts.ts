import { Archivo_Narrow, Instrument_Sans } from 'next/font/google';

// EXACT theme fonts: header/body = Instrument Sans, navigation = Archivo Narrow.
// Latin subset only (Google's Instrument Sans / Archivo Narrow don't ship Cyrillic); Bulgarian
// Cyrillic falls back through the stack — same behaviour as the live site. Self-host a Cyrillic
// cut later if crisper BG glyphs are wanted.
export const instrumentSans = Instrument_Sans({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700'],
  variable: '--font-instrument-sans',
  display: 'swap',
});

export const archivoNarrow = Archivo_Narrow({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700'],
  variable: '--font-archivo-narrow',
  display: 'swap',
});

export const fontVariables = `${instrumentSans.variable} ${archivoNarrow.variable}`;
