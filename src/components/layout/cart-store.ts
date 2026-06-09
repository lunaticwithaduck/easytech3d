'use client';

import { useSyncExternalStore } from 'react';

// Tiny external store for the cart drawer's open/close state — shared between the header cart button
// and the drawer panel without a context provider. (No real cart backend yet; this is just the UI.)
let isOpen = false;
const listeners = new Set<() => void>();

function emit() {
  for (const l of listeners) l();
}

export const cartDrawer = {
  open() {
    if (!isOpen) {
      isOpen = true;
      emit();
    }
  },
  close() {
    if (isOpen) {
      isOpen = false;
      emit();
    }
  },
  toggle() {
    isOpen = !isOpen;
    emit();
  },
};

function subscribe(cb: () => void) {
  listeners.add(cb);
  return () => {
    listeners.delete(cb);
  };
}

export function useCartDrawerOpen() {
  return useSyncExternalStore(
    subscribe,
    () => isOpen,
    () => false,
  );
}
