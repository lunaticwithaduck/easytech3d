import { Button, Container, Heading, Icon, Link, Text } from '@/design-system';

// Translates sections/cart-template.liquid (empty-cart state only).
// The filled-cart state (CartPage, cart-items.liquid) is a separate feature;
// this component renders the empty state using design-system primitives only —
// no theme class names.

export function CartTemplate() {
  return (
    <Container className="py-16">
      {/* Filled cart (hidden — no backend in this phase) */}
      <div className="hidden" />

      {/* Empty cart */}
      <div className="flex flex-col items-center gap-6 text-center">
        <Heading as="h1" level={2}>
          Количка
        </Heading>

        <Text as="p" size="base" color="muted">
          Количката е празна. ;(
        </Text>

        <Button variant="primary" asChild>
          <Link href="/collections">
            <Text as="span" size="base" weight="bold" color="white" value="Продължете пазаруването" />
            <Icon name="tail-right" className="size-[18px] shrink-0" />
          </Link>
        </Button>
      </div>
    </Container>
  );
}
