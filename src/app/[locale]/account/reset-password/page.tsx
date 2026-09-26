import type { Metadata } from 'next';
import { redirect } from 'next/navigation';
import { setRequestLocale } from 'next-intl/server';
import { getCurrentCustomer } from '@/actions/account';
import { RequestPasswordResetForm } from '@/components/account/RequestPasswordResetForm';
import { BodyClass } from '@/components/util/BodyClass';
import { routes } from '@/config/routes';
import { Container } from '@/design-system';
import { buildMetadata } from '@/lib/seo';

type Props = { params: Promise<{ locale: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  return buildMetadata({
    locale,
    path: routes.account.resetPassword,
    title: 'Забравена парола',
    noindex: true,
  });
}

export default async function ResetPasswordPage({ params }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);

  if (await getCurrentCustomer()) redirect(`/${locale}${routes.account.home}`);

  return (
    <>
      <BodyClass name="template-account-reset-password" />
      <Container className="py-16">
        <RequestPasswordResetForm />
      </Container>
    </>
  );
}
