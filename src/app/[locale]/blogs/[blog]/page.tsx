import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { setRequestLocale } from 'next-intl/server';
import { BlogTemplate } from '@/components/templates/BlogTemplate';
import { BodyClass } from '@/components/util/BodyClass';
import { routes } from '@/config/routes';
import { getBlog } from '@/data/catalog';
import { buildMetadata } from '@/lib/seo';

type Props = {
  params: Promise<{ locale: string; blog: string }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale, blog: blogParam } = await params;
  const blog = getBlog(decodeURIComponent(blogParam));
  if (!blog) return {};
  return buildMetadata({
    locale,
    path: routes.blogIndex(blog.handle),
    title: blog.title,
    description: `${blog.title} — новини, ръководства и съвети за 3D печат от екипа на EasyTech3D.`,
  });
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
