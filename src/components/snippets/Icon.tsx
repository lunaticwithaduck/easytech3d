import type { ReactElement } from 'react';
import { cn } from '@/lib/cn';

// Maps icon name -> SVG factory.
// viewBox and paths are copied verbatim from:
//   tools/output/liquid-template/snippets/icon.liquid
//   tools/output/liquid-template/snippets/icon-*.liquid
// The theme class "icon icon--<name>" is applied by default; callers may
// append extra classes via `className`.

type IconMap = Record<string, (cls: string) => ReactElement>;

const icons: IconMap = {
  // ── arrows / tails ──────────────────────────────────────────────────────
  'tail-right': (cls) => (
    <svg className={cls} viewBox="0 0 24 24" role="presentation">
      <path
        fill="currentColor"
        d="M22.707 11.293L15 3.586 13.586 5l6 6H2c-.553 0-1 .448-1 1s.447 1 1 1h17.586l-6 6L15 20.414l7.707-7.707c.391-.391.391-1.023 0-1.414z"
      />
    </svg>
  ),

  'tail-left': (cls) => (
    <svg className={cls} viewBox="0 0 24 24" role="presentation">
      <path
        fill="currentColor"
        d="M1.293 11.293L9 3.586 10.414 5l-6 6H22c.553 0 1 .448 1 1s-.447 1-1 1H4.414l6 6L9 20.414l-7.707-7.707c-.391-.391-.391-1.023 0-1.414z"
      />
    </svg>
  ),

  'arrow-bottom': (cls) => (
    <svg className={cls} viewBox="0 0 12 8" role="presentation">
      <path stroke="currentColor" strokeWidth="2" d="M10 2L6 6 2 2" fill="none" strokeLinecap="square" />
    </svg>
  ),

  // ── chevrons ─────────────────────────────────────────────────────────────
  'chevron-down': (cls) => (
    <svg
      aria-hidden="true"
      focusable={false}
      role="presentation"
      className={cls}
      viewBox="0 0 9 9"
    >
      <path
        d="M8.542 2.558a.625.625 0 0 1 0 .884l-3.6 3.6a.626.626 0 0 1-.884 0l-3.6-3.6a.625.625 0 1 1 .884-.884L4.5 5.716l3.158-3.158a.625.625 0 0 1 .884 0z"
        fill="#fff"
      />
    </svg>
  ),

  'chevron-left': (cls) => (
    <svg
      aria-hidden="true"
      focusable={false}
      role="presentation"
      className={cls}
      viewBox="0 0 14 14"
    >
      <path
        d="M10.129.604a1.125 1.125 0 0 0-1.591 0L3.023 6.12s.049-.049-.003.004l-.082.08c-.439.44-.44 1.153 0 1.592l5.6 5.6a1.125 1.125 0 0 0 1.59-1.59L5.325 7l4.805-4.805c.44-.439.44-1.151 0-1.59z"
        fill="#fff"
      />
    </svg>
  ),

  'chevron-right': (cls) => (
    <svg
      aria-hidden="true"
      focusable={false}
      role="presentation"
      className={cn(cls, 'icon-chevron-right')}
      viewBox="0 0 14 14"
    >
      <path
        d="M3.871.604c.44-.439 1.152-.439 1.591 0l5.515 5.515s-.049-.049.003.004l.082.08c.439.44.44 1.153 0 1.592l-5.6 5.6a1.125 1.125 0 0 1-1.59-1.59L8.675 7 3.87 2.195a1.125 1.125 0 0 1 0-1.59z"
        fill="#fff"
      />
    </svg>
  ),

  'caret': (cls) => (
    <svg
      aria-hidden="true"
      focusable={false}
      role="presentation"
      className={cls}
      viewBox="0 0 10 6"
    >
      <path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M9.354.646a.5.5 0 00-.708 0L5 4.293 1.354.646a.5.5 0 00-.708.708l4 4a.5.5 0 00.708 0l4-4a.5.5 0 000-.708z"
        fill="currentColor"
      />
    </svg>
  ),

  // ── search ────────────────────────────────────────────────────────────────
  'search': (cls) => (
    <svg className={cls} viewBox="0 0 21 21" role="presentation">
      <g strokeWidth="2" stroke="currentColor" fill="none" fillRule="evenodd">
        <path d="M19 19l-5-5" strokeLinecap="square" />
        <circle cx="8.5" cy="8.5" r="7.5" />
      </g>
    </svg>
  ),

  // standalone icon-search.liquid variant (large version used by header/drawer)
  'search-loop': (cls) => (
    <svg
      aria-hidden="true"
      focusable={false}
      role="presentation"
      className={cn(cls, 'icon-search')}
      viewBox="0 0 37 40"
    >
      <path d="M35.6 36l-9.8-9.8c4.1-5.4 3.6-13.2-1.3-18.1-5.4-5.4-14.2-5.4-19.7 0-5.4 5.4-5.4 14.2 0 19.7 2.6 2.6 6.1 4.1 9.8 4.1 3 0 5.9-1 8.3-2.8l9.8 9.8c.4.4.9.6 1.4.6s1-.2 1.4-.6c.9-.9.9-2.1.1-2.9zm-20.9-8.2c-2.6 0-5.1-1-7-2.9-3.9-3.9-3.9-10.1 0-14C9.6 9 12.2 8 14.7 8s5.1 1 7 2.9c3.9 3.9 3.9 10.1 0 14-1.9 1.9-4.4 2.9-7 2.9z" />
    </svg>
  ),

  // ── hamburger / close ─────────────────────────────────────────────────────
  'hamburger': (cls) => (
    <svg className={cls} viewBox="0 0 20 14" role="presentation">
      <path
        d="M0 12h20v2H0v-2zM0 0h20v2H0V0zm0 6h20v2H0V6z"
        fill="currentColor"
        fillRule="evenodd"
      />
    </svg>
  ),

  // standalone icon-hamburger.liquid (used in mobile header)
  'hamburger-large': (cls) => (
    <svg
      aria-hidden="true"
      focusable={false}
      role="presentation"
      className={cn(cls, 'icon-hamburger')}
      viewBox="0 0 37 40"
    >
      <path d="M33.5 25h-30c-1.1 0-2-.9-2-2s.9-2 2-2h30c1.1 0 2 .9 2 2s-.9 2-2 2zm0-11.5h-30c-1.1 0-2-.9-2-2s.9-2 2-2h30c1.1 0 2 .9 2 2s-.9 2-2 2zm0 23h-30c-1.1 0-2-.9-2-2s.9-2 2-2h30c1.1 0 2 .9 2 2s-.9 2-2 2z" />
    </svg>
  ),

  'hamburger-mobile': (cls) => (
    <svg className={cls} viewBox="0 0 20 16" role="presentation">
      <path
        d="M0 14h20v2H0v-2zM0 0h20v2H0V0zm0 7h20v2H0V7z"
        fill="currentColor"
        fillRule="evenodd"
      />
    </svg>
  ),

  'close': (cls) => (
    <svg className={cls} viewBox="0 0 19 19" role="presentation">
      <path
        d="M9.1923882 8.39339828l7.7781745-7.7781746 1.4142136 1.41421357-7.7781746 7.77817459 7.7781746 7.77817456L16.9705627 19l-7.7781745-7.7781746L1.41421356 19 0 17.5857864l7.7781746-7.77817456L0 2.02943725 1.41421356.61522369 9.1923882 8.39339828z"
        fill="currentColor"
        fillRule="evenodd"
      />
    </svg>
  ),

  // standalone icon-close.liquid (larger variant used in overlays)
  'close-large': (cls) => (
    <svg
      aria-hidden="true"
      focusable={false}
      role="presentation"
      className={cn(cls, 'icon-close')}
      viewBox="0 0 40 40"
    >
      <path
        d="M23.868 20.015L39.117 4.78c1.11-1.108 1.11-2.77 0-3.877-1.109-1.108-2.773-1.108-3.882 0L19.986 16.137 4.737.904C3.628-.204 1.965-.204.856.904c-1.11 1.108-1.11 2.77 0 3.877l15.249 15.234L.855 35.248c-1.108 1.108-1.108 2.77 0 3.877.555.554 1.248.831 1.942.831s1.386-.277 1.94-.83l15.25-15.234 15.248 15.233c.555.554 1.248.831 1.941.831s1.387-.277 1.941-.83c1.11-1.109 1.11-2.77 0-3.878L23.868 20.015z"
        className="layer"
      />
    </svg>
  ),

  // ── cart / basket / bag ───────────────────────────────────────────────────
  'cart': (cls) => (
    <svg className={cls} viewBox="0 0 27 24" role="presentation">
      <g transform="translate(0 1)" strokeWidth="2" stroke="currentColor" fill="none" fillRule="evenodd">
        <circle strokeLinecap="square" cx="11" cy="20" r="2" />
        <circle strokeLinecap="square" cx="22" cy="20" r="2" />
        <path d="M7.31 5h18.27l-1.44 10H9.78L6.22 0H0" />
      </g>
    </svg>
  ),

  'basket': (cls) => (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
      focusable={false}
      role="img"
      className={cn(cls, 'svg-inline--fa', 'fa-shopping-basket', 'fa-w-18')}
      viewBox="0 0 576 512"
    >
      <path
        fill="currentColor"
        d="M576 216v16c0 13.255-10.745 24-24 24h-8l-26.113 182.788C514.509 462.435 494.257 480 470.37 480H105.63c-23.887 0-44.139-17.565-47.518-41.212L32 256h-8c-13.255 0-24-10.745-24-24v-16c0-13.255 10.745-24 24-24h67.341l106.78-146.821c10.395-14.292 30.407-17.453 44.701-7.058 14.293 10.395 17.453 30.408 7.058 44.701L170.477 192h235.046L326.12 82.821c-10.395-14.292-7.234-34.306 7.059-44.701 14.291-10.395 34.306-7.235 44.701 7.058L484.659 192H552c13.255 0 24 10.745 24 24zM312 392V280c0-13.255-10.745-24-24-24s-24 10.745-24 24v112c0 13.255 10.745 24 24 24s24-10.745 24-24zm112 0V280c0-13.255-10.745-24-24-24s-24 10.745-24 24v112c0 13.255 10.745 24 24 24s24-10.745 24-24zm-224 0V280c0-13.255-10.745-24-24-24s-24 10.745-24 24v112c0 13.255 10.745 24 24 24s24-10.745 24-24z"
      />
    </svg>
  ),

  'bag': (cls) => (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
      focusable={false}
      role="img"
      className={cn(cls, 'svg-inline--fa', 'fa-shopping-bag', 'fa-w-14')}
      viewBox="0 0 448 512"
    >
      <path
        fill="currentColor"
        d="M352 160v-32C352 57.42 294.579 0 224 0 153.42 0 96 57.42 96 128v32H0v272c0 44.183 35.817 80 80 80h288c44.183 0 80-35.817 80-80V160h-96zm-192-32c0-35.29 28.71-64 64-64s64 28.71 64 64v32H160v-32zm160 120c-13.255 0-24-10.745-24-24s10.745-24 24-24 24 10.745 24 24-10.745 24-24 24zm-192 0c-13.255 0-24-10.745-24-24s10.745-24 24-24 24 10.745 24 24-10.745 24-24 24z"
      />
    </svg>
  ),

  // ── account / user / heart ────────────────────────────────────────────────
  'account': (cls) => (
    <svg className={cls} viewBox="0 0 20 22" role="presentation">
      <path
        d="M10 13c2.82 0 5.33.64 6.98 1.2A3 3 0 0 1 19 17.02V21H1v-3.97a3 3 0 0 1 2.03-2.84A22.35 22.35 0 0 1 10 13zm0 0c-2.76 0-5-3.24-5-6V6a5 5 0 0 1 10 0v1c0 2.76-2.24 6-5 6z"
        stroke="currentColor"
        strokeWidth="2"
        fill="none"
      />
    </svg>
  ),

  'user': (cls) => (
    <svg className={cls} viewBox="0 0 20 22" role="presentation">
      <path
        d="M10 13c2.82 0 5.33.64 6.98 1.2A3 3 0 0 1 19 17.02V21H1v-3.97a3 3 0 0 1 2.03-2.84A22.35 22.35 0 0 1 10 13zm0 0c-2.76 0-5-3.24-5-6V6a5 5 0 0 1 10 0v1c0 2.76-2.24 6-5 6z"
        stroke="currentColor"
        strokeWidth="2"
        fill="none"
      />
    </svg>
  ),

  'heart': (cls) => (
    <svg className={cls} viewBox="0 0 17 15" role="presentation">
      <path d="M15.0349331 1.40485867C14.1287273.49933787 12.9252477 0 11.6443673 0S9.16000731.49933787 8.25448651 1.40417371c-.01164437.01164436-.02328874.02328873-.03493311.03561806-.01164436-.01232933-.02260377-.02328873-.03424813-.0349331C7.2790995.49933787 6.07561989 0 4.79473949 0 3.51385908 0 2.31037947.49933787 1.40417371 1.40485867.49796794 2.31037947 0 3.51385908 0 4.79473949 0 6.07561989.4986529 7.2790995 1.40417371 8.1846203L8.2195534 15l6.8153797-6.8153797c.9055208-.9055208 1.4041737-2.10900041 1.4041737-3.38988081 0-1.28019545-.4986529-2.48436002-1.4041737-3.38988082z" />
    </svg>
  ),

  // ── plus / minus ─────────────────────────────────────────────────────────
  'plus': (cls) => (
    <svg className={cls} viewBox="0 0 10 10" role="presentation">
      <path d="M6 4h4v2H6v4H4V6H0V4h4V0h2v4z" fill="currentColor" fillRule="evenodd" />
    </svg>
  ),

  'minus': (cls) => (
    <svg className={cls} viewBox="0 0 10 2" role="presentation">
      <path d="M10 0v2H0V0z" fill="currentColor" />
    </svg>
  ),

  // ── social ────────────────────────────────────────────────────────────────
  'facebook': (cls) => (
    <svg
      aria-hidden="true"
      focusable={false}
      role="presentation"
      className={cn(cls, 'icon-facebook')}
      viewBox="0 0 20 20"
    >
      <path
        fill="#444"
        d="M18.05.811q.439 0 .744.305t.305.744v16.637q0 .439-.305.744t-.744.305h-4.732v-7.221h2.415l.342-2.854h-2.757v-1.83q0-.659.293-1t1.073-.342h1.488V3.762q-.976-.098-2.171-.098-1.634 0-2.635.964t-1 2.72V9.47H7.951v2.854h2.415v7.221H1.413q-.439 0-.744-.305t-.305-.744V1.859q0-.439.305-.744T1.413.81H18.05z"
      />
    </svg>
  ),

  'twitter': (cls) => (
    <svg
      aria-hidden="true"
      focusable={false}
      role="presentation"
      className={cn(cls, 'icon-twitter')}
      viewBox="0 0 20 20"
    >
      <path
        fill="#444"
        d="M19.551 4.208q-.815 1.202-1.956 2.038 0 .082.02.255t.02.255q0 1.589-.469 3.179t-1.426 3.036-2.272 2.567-3.158 1.793-3.963.672q-3.301 0-6.031-1.773.571.041.937.041 2.751 0 4.911-1.671-1.284-.02-2.292-.784T2.456 11.85q.346.082.754.082.55 0 1.039-.163-1.365-.285-2.262-1.365T1.09 7.918v-.041q.774.408 1.773.448-.795-.53-1.263-1.396t-.469-1.864q0-1.019.509-1.997 1.487 1.854 3.596 2.924T9.81 7.184q-.143-.509-.143-.897 0-1.63 1.161-2.781t2.832-1.151q.815 0 1.569.326t1.284.917q1.345-.265 2.506-.958-.428 1.386-1.732 2.18 1.243-.163 2.262-.611z"
      />
    </svg>
  ),

  'pinterest': (cls) => (
    <svg
      aria-hidden="true"
      focusable={false}
      role="presentation"
      className={cn(cls, 'icon-pinterest')}
      viewBox="0 0 20 20"
    >
      <path
        fill="#444"
        d="M9.958.811q1.903 0 3.635.744t2.988 2 2 2.988.744 3.635q0 2.537-1.256 4.696t-3.415 3.415-4.696 1.256q-1.39 0-2.659-.366.707-1.147.951-2.025l.659-2.561q.244.463.903.817t1.39.354q1.464 0 2.622-.842t1.793-2.305.634-3.293q0-2.171-1.671-3.769t-4.257-1.598q-1.586 0-2.903.537T5.298 5.897 4.066 7.775t-.427 2.037q0 1.268.476 2.22t1.427 1.342q.171.073.293.012t.171-.232q.171-.61.195-.756.098-.268-.122-.512-.634-.707-.634-1.83 0-1.854 1.281-3.183t3.354-1.329q1.83 0 2.854 1t1.025 2.61q0 1.342-.366 2.476t-1.049 1.817-1.561.683q-.732 0-1.195-.537t-.293-1.269q.098-.342.256-.878t.268-.915.207-.817.098-.732q0-.61-.317-1t-.927-.39q-.756 0-1.269.695t-.512 1.744q0 .39.061.756t.134.537l.073.171q-1 4.342-1.22 5.098-.195.927-.146 2.171-2.513-1.122-4.062-3.44T.59 10.177q0-3.879 2.744-6.623T9.957.81z"
      />
    </svg>
  ),

  'instagram': (cls) => (
    <svg
      aria-hidden="true"
      focusable={false}
      role="presentation"
      className={cn(cls, 'icon-instagram')}
      viewBox="0 0 512 512"
    >
      <path d="M256 49.5c67.3 0 75.2.3 101.8 1.5 24.6 1.1 37.9 5.2 46.8 8.7 11.8 4.6 20.2 10 29 18.8s14.3 17.2 18.8 29c3.4 8.9 7.6 22.2 8.7 46.8 1.2 26.6 1.5 34.5 1.5 101.8s-.3 75.2-1.5 101.8c-1.1 24.6-5.2 37.9-8.7 46.8-4.6 11.8-10 20.2-18.8 29s-17.2 14.3-29 18.8c-8.9 3.4-22.2 7.6-46.8 8.7-26.6 1.2-34.5 1.5-101.8 1.5s-75.2-.3-101.8-1.5c-24.6-1.1-37.9-5.2-46.8-8.7-11.8-4.6-20.2-10-29-18.8s-14.3-17.2-18.8-29c-3.4-8.9-7.6-22.2-8.7-46.8-1.2-26.6-1.5-34.5-1.5-101.8s.3-75.2 1.5-101.8c1.1-24.6 5.2-37.9 8.7-46.8 4.6-11.8 10-20.2 18.8-29s17.2-14.3 29-18.8c8.9-3.4 22.2-7.6 46.8-8.7 26.6-1.3 34.5-1.5 101.8-1.5m0-45.4c-68.4 0-77 .3-103.9 1.5C125.3 6.8 107 11.1 91 17.3c-16.6 6.4-30.6 15.1-44.6 29.1-14 14-22.6 28.1-29.1 44.6-6.2 16-10.5 34.3-11.7 61.2C4.4 179 4.1 187.6 4.1 256s.3 77 1.5 103.9c1.2 26.8 5.5 45.1 11.7 61.2 6.4 16.6 15.1 30.6 29.1 44.6 14 14 28.1 22.6 44.6 29.1 16 6.2 34.3 10.5 61.2 11.7 26.9 1.2 35.4 1.5 103.9 1.5s77-.3 103.9-1.5c26.8-1.2 45.1-5.5 61.2-11.7 16.6-6.4 30.6-15.1 44.6-29.1 14-14 22.6-28.1 29.1-44.6 6.2-16 10.5-34.3 11.7-61.2 1.2-26.9 1.5-35.4 1.5-103.9s-.3-77-1.5-103.9c-1.2-26.8-5.5-45.1-11.7-61.2-6.4-16.6-15.1-30.6-29.1-44.6-14-14-28.1-22.6-44.6-29.1-16-6.2-34.3-10.5-61.2-11.7-27-1.1-35.6-1.4-104-1.4z" />
      <path d="M256 126.6c-71.4 0-129.4 57.9-129.4 129.4s58 129.4 129.4 129.4 129.4-58 129.4-129.4-58-129.4-129.4-129.4zm0 213.4c-46.4 0-84-37.6-84-84s37.6-84 84-84 84 37.6 84 84-37.6 84-84 84z" />
      <circle cx="390.5" cy="121.5" r="30.2" />
    </svg>
  ),

  'youtube': (cls) => (
    <svg
      aria-hidden="true"
      focusable={false}
      role="presentation"
      className={cn(cls, 'icon-youtube')}
      viewBox="0 0 21 20"
    >
      <path
        fill="#444"
        d="M-.196 15.803q0 1.23.812 2.092t1.977.861h14.946q1.165 0 1.977-.861t.812-2.092V3.909q0-1.23-.82-2.116T17.539.907H2.593q-1.148 0-1.969.886t-.82 2.116v11.894zm7.465-2.149V6.058q0-.115.066-.18.049-.016.082-.016l.082.016 7.153 3.806q.066.066.066.164 0 .066-.066.131l-7.153 3.806q-.033.033-.066.033-.066 0-.098-.033-.066-.066-.066-.131z"
      />
    </svg>
  ),

  // ── misc ui ───────────────────────────────────────────────────────────────
  'check': (cls) => (
    <svg className={cls} viewBox="0 0 24 24" role="presentation">
      <path fill="currentColor" d="M9 20l-7-7 3-3 4 4L19 4l3 3z" />
    </svg>
  ),

  'check-2': (cls) => (
    <svg className={cls} viewBox="0 0 13 11" role="presentation">
      <path
        d="M1 4.166456L5.317719 9 12 1"
        stroke="currentColor"
        strokeWidth="2"
        fill="none"
        fillRule="evenodd"
      />
    </svg>
  ),

  'filter': (cls) => (
    <svg className={cls} viewBox="0 0 19 20" role="presentation">
      <path
        d="M17.0288086 4.01391602L11 9v7.0072021l-4 2.008545V9L1.01306152 4.01391602V1H17.0288086z"
        stroke="currentColor"
        strokeWidth="2"
        fill="none"
        strokeLinecap="square"
      />
    </svg>
  ),

  'grid': (cls) => (
    <svg className={cls} viewBox="0 0 18 18" role="presentation">
      <path
        d="M1 .030067h2c.55228475 0 1 .44771525 1 1v2c0 .55228475-.44771525 1-1 1H1c-.55228475 0-1-.44771525-1-1v-2c0-.55228475.44771525-1 1-1zm0 7h2c.55228475 0 1 .44771525 1 1v2c0 .5522847-.44771525 1-1 1H1c-.55228475 0-1-.4477153-1-1v-2c0-.55228475.44771525-1 1-1zm0 7h2c.55228475 0 1 .4477153 1 1v2c0 .5522847-.44771525 1-1 1H1c-.55228475 0-1-.4477153-1-1v-2c0-.5522847.44771525-1 1-1zm7-14h2c.5522847 0 1 .44771525 1 1v2c0 .55228475-.4477153 1-1 1H8c-.55228475 0-1-.44771525-1-1v-2c0-.55228475.44771525-1 1-1zm0 7h2c.5522847 0 1 .44771525 1 1v2c0 .5522847-.4477153 1-1 1H8c-.55228475 0-1-.4477153-1-1v-2c0-.55228475.44771525-1 1-1zm0 7h2c.5522847 0 1 .4477153 1 1v2c0 .5522847-.4477153 1-1 1H8c-.55228475 0-1-.4477153-1-1v-2c0-.5522847.44771525-1 1-1zm7-14h2c.5522847 0 1 .44771525 1 1v2c0 .55228475-.4477153 1-1 1h-2c-.5522847 0-1-.44771525-1-1v-2c0-.55228475.4477153-1 1-1zm0 7h2c.5522847 0 1 .44771525 1 1v2c0 .5522847-.4477153 1-1 1h-2c-.5522847 0-1-.4477153-1-1v-2c0-.55228475.4477153-1 1-1zm0 7h2c.5522847 0 1 .4477153 1 1v2c0 .5522847-.4477153 1-1 1h-2c-.5522847 0-1-.4477153-1-1v-2c0-.5522847.4477153-1 1-1z"
        fill="currentColor"
        fillRule="evenodd"
      />
    </svg>
  ),

  'list': (cls) => (
    <svg className={cls} viewBox="0 0 18 18" role="presentation">
      <path
        d="M8 1.030067h9c.5522847 0 1 .44771525 1 1s-.4477153 1-1 1H8c-.55228475 0-1-.44771525-1-1s.44771525-1 1-1zm0 7h9c.5522847 0 1 .44771525 1 1s-.4477153 1-1 1H8c-.55228475 0-1-.44771525-1-1s.44771525-1 1-1zm0 7h9c.5522847 0 1 .4477153 1 1s-.4477153 1-1 1H8c-.55228475 0-1-.4477153-1-1s.44771525-1 1-1zm-7-15h2c.55228475 0 1 .44771525 1 1v2c0 .55228475-.44771525 1-1 1H1c-.55228475 0-1-.44771525-1-1v-2c0-.55228475.44771525-1 1-1zm0 7h2c.55228475 0 1 .44771525 1 1v2c0 .5522847-.44771525 1-1 1H1c-.55228475 0-1-.4477153-1-1v-2c0-.55228475.44771525-1 1-1zm0 7h2c.55228475 0 1 .4477153 1 1v2c0 .5522847-.44771525 1-1 1H1c-.55228475 0-1-.4477153-1-1v-2c0-.5522847.44771525-1 1-1z"
        fill="currentColor"
        fillRule="evenodd"
      />
    </svg>
  ),

  'lock-2': (cls) => (
    <svg className={cls} viewBox="0 0 12 15" role="presentation">
      <g stroke="currentColor" strokeWidth="2" fill="none" fillRule="evenodd" strokeLinecap="square">
        <path d="M6 1C4.32 1 3 2.375 3 4.125V6h6V4.125C9 2.375 7.68 1 6 1zM1 6h10v8H1z" />
      </g>
    </svg>
  ),

  'newsletter': (cls) => (
    <svg className={cls} viewBox="0 0 20 17" role="presentation">
      <path
        d="M19.1666667 0H.83333333C.37333333 0 0 .37995 0 .85v15.3c0 .47005.37333333.85.83333333.85H19.1666667c.46 0 .8333333-.37995.8333333-.85V.85c0-.47005-.3733333-.85-.8333333-.85zM7.20975004 10.8719018L5.3023283 12.7794369c-.14877889.1487878-.34409888.2235631-.53941886.2235631-.19531999 0-.39063998-.0747753-.53941887-.2235631-.29832076-.2983385-.29832076-.7805633 0-1.0789018L6.1309123 9.793l1.07883774 1.0789018zm8.56950946 1.9075351c-.1487789.1487878-.3440989.2235631-.5394189.2235631-.19532 0-.39064-.0747753-.5394189-.2235631L12.793 10.8719018 13.8718377 9.793l1.9074218 1.9075351c.2983207.2983385.2983207.7805633 0 1.0789018zm.9639048-7.45186267l-6.1248086 5.44429317c-.1706197.1516625-.3946127.2278826-.6186057.2278826-.223993 0-.447986-.0762201-.61860567-.2278826l-6.1248086-5.44429317c-.34211431-.30410267-.34211431-.79564457 0-1.09974723.34211431-.30410267.89509703-.30410267 1.23721134 0L9.99975 9.1222466l5.5062029-4.8944196c.3421143-.30410267.8950971-.30410267 1.2372114 0 .3421143.30410266.3421143.79564456 0 1.09974723z"
        fill="currentColor"
      />
    </svg>
  ),

  'timer': (cls) => (
    <svg className={cls} viewBox="0 0 20 20" role="presentation">
      <g stroke="currentColor" fill="none" fillRule="evenodd">
        <circle cx="10" cy="10" r="9" />
        <path strokeLinecap="square" d="M10 6.02856445V10l3.0130615 2.0200195" />
      </g>
    </svg>
  ),

  'zoom': (cls) => (
    <svg className={cls} viewBox="0 0 10 10" role="presentation">
      <path
        d="M7.58801492 6.8808396L9.999992 9.292784l-.70716.707208-2.41193007-2.41199543C6.15725808 8.15916409 5.24343297 8.50004 4.25 8.50004c-2.347188 0-4.249968-1.902876-4.249968-4.2501C.000032 1.902704 1.902812.000128 4.25.000128c2.347176 0 4.249956 1.902576 4.249956 4.249812 0 .99341752-.34083418 1.90724151-.91194108 2.6308996zM4.25.999992C2.455064.999992.999992 2.454944.999992 4.24994c0 1.794984 1.455072 3.249936 3.250008 3.249936 1.794924 0 3.249996-1.454952 3.249996-3.249936C7.499996 2.454944 6.044924.999992 4.25.999992z"
        fill="currentColor"
        fillRule="evenodd"
      />
    </svg>
  ),

  'sale': (cls) => (
    <svg className={cls} role="presentation" viewBox="0 0 24 24">
      <path
        d="M22.707 12.293l-11-11A1.002 1.002 0 0 0 11 1H2a1 1 0 0 0-1 1v9c0 .265.105.52.293.707l11 11a.997.997 0 0 0 1.414 0l9-9a.999.999 0 0 0 0-1.414zM7 9a2 2 0 1 1-.001-3.999A2 2 0 0 1 7 9zm6 8.414L8.586 13 10 11.586 14.414 16 13 17.414zm3-3L11.586 10 13 8.586 17.414 13 16 14.414z"
        fill="currentColor"
      />
    </svg>
  ),

  'cross-sold-out': (cls) => (
    <svg className={cls} viewBox="0 0 14 14" role="presentation">
      <g fillRule="nonzero" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="square">
        <path d="M11.89949494 2L2 11.89949494M1.99999906 2l9.89949494 9.89949494" />
      </g>
    </svg>
  ),

  'package': (cls) => (
    <svg className={cls} viewBox="0 0 46 46" role="presentation">
      <g stroke="currentColor" strokeWidth="2" fill="none" fillRule="evenodd">
        <path d="M11 8l24 14m10-6L25 28 1 14m24 14v16" />
        <path strokeLinecap="square" d="M45 16v14L25 44 1 30V14L21 2z" />
      </g>
    </svg>
  ),

  'address': (cls) => (
    <svg className={cls} viewBox="0 0 46 45" role="presentation">
      <g transform="translate(1 1)" stroke="currentColor" strokeWidth="2" fill="none" fillRule="evenodd" strokeLinecap="square">
        <path d="M38 9.5L44 8v30l-16 4-12-4-16 4V12l6-1.5" />
        <path d="M32 10c0 6.172-10 16.25-10 16.25S12 16.172 12 10c0-6.328 5.168-10 10-10s10 3.672 10 10z" />
        <circle cx="22" cy="10" r="3" />
      </g>
    </svg>
  ),
};

/**
 * Renders a theme inline SVG icon by name.
 *
 * The base class `icon icon--<name>` is always applied (matching the Liquid
 * `{%- capture icon_class -%}icon icon--{{ icon }}{%- endcapture -%}`).
 * Pass `className` to append additional classes.
 *
 * Unknown names return null.
 */
export function Icon({
  name,
  className,
}: {
  name: string;
  className?: string;
}): ReactElement | null {
  const factory = icons[name];
  if (!factory) return null;

  // Build the base class the Liquid theme generates for every icon.
  const baseClass = `icon icon--${name}`;
  const mergedClass = className ? cn(baseClass, className) : baseClass;

  return factory(mergedClass);
}
