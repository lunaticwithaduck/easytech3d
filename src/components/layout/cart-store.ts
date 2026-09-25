'use client';

import { useSyncExternalStore } from 'react';
import { addToCart, getCart, removeCartItem, updateCartItem } from '@/actions/cart';
import type { ShopCart } from '@/lib/shopify/types';

// Client-side cart store: drawer open/close + the cart snapshot (hydrated from the server, then
// updated optimistically-ish after each Server Action returns the fresh cart). Shared without a
// context provider via useSyncExternalStore.

const EMPTY_CART: ShopCart = {
  id: '',
  items: [],
  itemCount: 0,
  subtotal: 0,
  freeShippingThreshold: 10500,
  freeShippingRemaining: 10500,
  qualifiesForFreeShipping: false,
};

let isOpen = false;
let cart: ShopCart = EMPTY_CART;
let pending = false;
const listeners = new Set<() => void>();

function emit(): void {
  for (const l of listeners) l();
}

function subscribe(cb: () => void): () => void {
  listeners.add(cb);
  return () => {
    listeners.delete(cb);
  };
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

export const cartActions = {
  /** Seed from the server-rendered cart (no network round-trip on load). */
  seed(initial: ShopCart) {
    cart = initial;
    emit();
  },
  /** Clear the client cart (after an order is placed and the cart is consumed). */
  reset() {
    cart = EMPTY_CART;
    isOpen = false;
    emit();
  },
  async hydrate() {
    cart = await getCart();
    emit();
  },
  async add(variantId: string, quantity = 1) {
    pending = true;
    emit();
    try {
      cart = await addToCart(variantId, quantity);
      isOpen = true; // open the drawer on add (matches the live store)
    } catch (e) {
      // Callers are fire-and-forget (`void cartActions.add(...)`); swallow so a
      // transient failure neither leaves the UI stuck-pending nor throws unhandled.
      console.error('cart add failed', e);
    } finally {
      pending = false;
      emit();
    }
  },
  async update(itemId: string, quantity: number) {
    pending = true;
    emit();
    try {
      cart = await updateCartItem(itemId, quantity);
    } catch (e) {
      console.error('cart update failed', e);
    } finally {
      pending = false;
      emit();
    }
  },
  async remove(itemId: string) {
    pending = true;
    emit();
    try {
      cart = await removeCartItem(itemId);
    } catch (e) {
      console.error('cart remove failed', e);
    } finally {
      pending = false;
      emit();
    }
  },
};

export function useCartDrawerOpen(): boolean {
  return useSyncExternalStore(
    subscribe,
    () => isOpen,
    () => false,
  );
}

export function useCart(): ShopCart {
  return useSyncExternalStore(
    subscribe,
    () => cart,
    () => EMPTY_CART,
  );
}

export function useCartPending(): boolean {
  return useSyncExternalStore(
    subscribe,
    () => pending,
    () => false,
  );
}
