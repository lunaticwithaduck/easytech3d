'use client';

import { useEffect } from 'react';
import { cartActions } from './cart-store';

// Hydrates the client cart store from the server cart AFTER mount (client-side), so the shared
// layout never reads the cart cookie during render — keeping catalog pages statically rendered.
// The count/items pop in on first client tick (a negligible flash vs. losing ISR site-wide).
export function CartHydrator() {
  useEffect(() => {
    void cartActions.hydrate();
  }, []);
  return null;
}
