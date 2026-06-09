'use client';

import { useEffect } from 'react';

// Replicates Liquid's `<body class="template-{page_type}">`. The theme has a few page-scoped CSS
// rules keyed on `body.template-*`; route pages drop one of these to apply the right one. Set
// client-side after mount to avoid SSR/hydration mismatch (the chrome layout owns <body>).
export function BodyClass({ name }: { name: string }) {
  useEffect(() => {
    const classes = name.split(/\s+/).filter(Boolean);
    document.body.classList.add(...classes);
    return () => document.body.classList.remove(...classes);
  }, [name]);
  return null;
}
