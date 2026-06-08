import { setRequestLocale } from 'next-intl/server';
import { CartPage } from '@/features/cart/CartPage';
import { getAllProducts } from '@/server/catalog/data';

type Props = { params: Promise<{ locale: string }> };

export default async function CartRoute({ params }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);

  // No live cart this session — seed the stub line-item rows from the catalog.
  const sampleProducts = getAllProducts();

  return (
    <main>
      <CartPage sampleProducts={sampleProducts} />
    </main>
  );
}
