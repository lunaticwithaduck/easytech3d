import { notFound } from 'next/navigation';
import { setRequestLocale } from 'next-intl/server';
import type { Metadata } from 'next';
import { getBlog } from '@/data/catalog';
import { BodyClass } from '@/components/util/BodyClass';
import { BlogTemplate } from '@/components/templates/BlogTemplate';

type Props = {
  params: Promise<{ locale: string; blog: string }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { blog: blogParam } = await params;
  const blog = getBlog(decodeURIComponent(blogParam));
  if (!blog) return {};
  return { title: `${blog.title} – easytech3d` };
}

export default async function BlogPage({ params }: Props) {
  const { locale, blog: blogHandle } = await params;
  setRequestLocale(locale);

  const blog = getBlog(decodeURIComponent(blogHandle));
  if (!blog) notFound();

  return (
    <>
      <BodyClass name="template-blog" />
      <BlogTemplate blog={blog} articles={blog.articles} />
    </>
  );
}
