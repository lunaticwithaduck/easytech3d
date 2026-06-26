import { Container } from '@/design-system';
import { CartContents } from './CartContents';

// Cart page — renders the live server cart (CartContents is client; reads the cart store).
export function CartTemplate() {
  return (
    <Container className="py-16">
      <CartContents />
    </Container>
  );
}
