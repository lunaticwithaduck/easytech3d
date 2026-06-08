import { cva } from 'class-variance-authority';

// Breadcrumb trail: a single muted row that reads small, with the brand `primary` hover on the
// linked crumbs. Matches the reference's secondary-navigation rhythm above collection/product pages.
export const breadcrumbsNav = cva('w-full');

export const breadcrumbsList = cva('flex flex-wrap items-center gap-1.5 text-sm text-muted');

export const breadcrumbsItem = cva('flex items-center gap-1.5');

export const breadcrumbsSeparator = cva('shrink-0 text-muted');

export const breadcrumbsLink = cva('text-muted transition-colors hover:text-primary');

export const breadcrumbsCurrent = cva('text-text');
