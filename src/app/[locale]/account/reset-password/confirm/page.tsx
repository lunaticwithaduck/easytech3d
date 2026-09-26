import type { Metadata } from 'next';
import { setRequestLocale } from 'next-intl/server';
import { SetNewPasswordForm } from '@/components/account/SetNewPasswordForm';
import { BodyClass } from '@/components/util/BodyClass';
import { routes } from '@/config/routes';
import { Container } from '@/design-system';
import { buildMetadata } from '@/lib/seo';

type Props = {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{ token?: string; email?: string }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  return buildMetadata({
    locale,
    path: routes.account.resetPasswordConfirm,
    title: 'Нова парола',
    noindex: true,
  });
}

export default async function ResetPasswordConfirmPage({ params, searchParams }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);
  const sp = await searchParams;

  return (
    <>
      <BodyClass name="template-account-reset-password-confirm" />
      <Container className="py-16">
        <SetNewPasswordForm token={sp.token ?? ''} email={sp.email ?? ''} />
      </Container>
    </>
  );
}
