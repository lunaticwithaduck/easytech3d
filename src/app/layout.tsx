import type { ReactNode } from 'react';
import './globals.css';

// All routes live under `[locale]`, which renders <html>/<body>. This root layout exists only
// because Next requires one; it passes children straight through. (Standard next-intl pattern.)
export default function RootLayout({ children }: { children: ReactNode }) {
  return children;
}
