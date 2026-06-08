import { Instrument_Sans } from 'next/font/google';

// The reference site renders in Instrument Sans. Google's Instrument Sans ships Latin (+ ext);
// Cyrillic glyphs (Bulgarian) fall back through the stack below — same as the live site. If you
// want a first-class Cyrillic cut, self-host an Instrument Sans Cyrillic build and swap here.
export const instrumentSans = Instrument_Sans({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700'],
  variable: '--font-instrument-sans',
  display: 'swap',
});

export const fontVariables = instrumentSans.variable;
