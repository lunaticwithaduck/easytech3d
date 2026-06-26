'use client';

import { useEffect, useState, useTransition } from 'react';
import { type CheckoutInput, submitCheckout } from '@/actions/checkout';
import { getEcontCities, getEcontOffices } from '@/actions/courier';
import { cartActions } from '@/components/layout/cart-store';
import { routes } from '@/config/routes';
import { Button, cn, Heading, Image, Text } from '@/design-system';
import { useRouter } from '@/i18n/navigation';
import { dualPrice, money } from '@/lib/shopify/money';
import type { EcontCity, EcontOffice, ShippingMethodInfo, ShopCart } from '@/lib/shopify/types';

const inputCls =
  'w-full rounded-input border border-border bg-surface px-4 py-3 text-base text-ink outline-none transition-colors placeholder:text-ink/40 focus:border-ink';

function Field({
  label,
  name,
  value,
  onChange,
  type = 'text',
  required = true,
  className,
}: {
  label: string;
  name: string;
  value: string;
  onChange: (v: string) => void;
  type?: string;
  required?: boolean;
  className?: string;
}) {
  return (
    <label className={cn('block', className)}>
      <Text as="span" size="sm" weight="medium" className="mb-1 block">
        {label}
        {required ? ' *' : ''}
      </Text>
      <input
        name={name}
        type={type}
        required={required}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className={inputCls}
      />
    </label>
  );
}

export function CheckoutForm({ cart, methods }: { cart: ShopCart; methods: ShippingMethodInfo[] }) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  const [form, setForm] = useState({
    email: '',
    firstName: '',
    lastName: '',
    phone: '',
    city: '',
    postalCode: '',
    address1: '',
    address2: '',
  });
  const [shippingMethod, setShippingMethod] = useState<'ECONT' | 'SPEEDY'>(
    methods[0]?.id ?? 'ECONT',
  );
  const [paymentMethod, setPaymentMethod] = useState<'COD' | 'CARD'>('COD');

  // Delivery target. Office pickup is available for Econt (its office API is public); Speedy needs
  // a contract account, so it stays address-only until those credentials are configured.
  const [deliveryType, setDeliveryType] = useState<'ADDRESS' | 'OFFICE'>('ADDRESS');
  const [cities, setCities] = useState<EcontCity[]>([]);
  const [offices, setOffices] = useState<EcontOffice[]>([]);
  const [officeCity, setOfficeCity] = useState('');
  const [officeCode, setOfficeCode] = useState('');
  const [loadingOffices, setLoadingOffices] = useState(false);

  const supportsOffice = shippingMethod === 'ECONT';
  const usingOffice = supportsOffice && deliveryType === 'OFFICE';

  // Lazy-load the city list the first time office pickup is chosen.
  useEffect(() => {
    if (usingOffice && cities.length === 0) {
      getEcontCities().then(setCities);
    }
  }, [usingOffice, cities.length]);

  const set = (k: keyof typeof form) => (v: string) => setForm((f) => ({ ...f, [k]: v }));

  const pickCity = (name: string) => {
    setOfficeCity(name);
    setOfficeCode('');
    setOffices([]);
    if (cities.some((c) => c.name === name)) {
      setLoadingOffices(true);
      getEcontOffices(name)
        .then(setOffices)
        .finally(() => setLoadingOffices(false));
    }
  };

  const selectedOffice = offices.find((o) => o.code === officeCode);
  const shippingCost = methods.find((m) => m.id === shippingMethod)?.priceCents ?? 0;
  const total = cart.subtotal + shippingCost;

  const chooseMethod = (id: 'ECONT' | 'SPEEDY') => {
    setShippingMethod(id);
    if (id !== 'ECONT') setDeliveryType('ADDRESS'); // Speedy = address-only for now
  };

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    let input: CheckoutInput;
    if (usingOffice) {
      if (!selectedOffice) {
        setError('Моля, изберете офис на Еконт.');
        return;
      }
      input = {
        email: form.email,
        firstName: form.firstName,
        lastName: form.lastName,
        phone: form.phone,
        city: selectedOffice.city,
        postalCode: selectedOffice.postCode,
        address1: `${selectedOffice.name} — ${selectedOffice.address}`,
        shippingMethod,
        deliveryType: 'OFFICE',
        officeCode: selectedOffice.code,
        officeName: selectedOffice.name,
        paymentMethod,
      };
    } else {
      input = { ...form, shippingMethod, deliveryType: 'ADDRESS', paymentMethod };
    }

    startTransition(async () => {
      const res = await submitCheckout(input);
      if (res.ok) {
        cartActions.reset();
        router.push(routes.order(res.order.id));
      } else {
        setError(res.error);
      }
    });
  };

  return (
    <form onSubmit={onSubmit} className="grid gap-10 lg:grid-cols-[1fr_400px]">
      {/* Left — details */}
      <div className="flex flex-col gap-8">
        <section>
          <Heading as="h2" level={4} className="mb-4">
            Контакт
          </Heading>
          <div className="grid gap-4 sm:grid-cols-2">
            <Field
              label="Имейл"
              name="email"
              type="email"
              value={form.email}
              onChange={set('email')}
              className="sm:col-span-2"
            />
            <Field
              label="Име"
              name="firstName"
              value={form.firstName}
              onChange={set('firstName')}
            />
            <Field
              label="Фамилия"
              name="lastName"
              value={form.lastName}
              onChange={set('lastName')}
            />
            <Field
              label="Телефон"
              name="phone"
              value={form.phone}
              onChange={set('phone')}
              className="sm:col-span-2"
            />
          </div>
        </section>

        <section>
          <Heading as="h2" level={4} className="mb-4">
            Доставка
          </Heading>
          <div className="flex flex-col gap-3">
            {methods.map((m) => (
              <label
                key={m.id}
                className={cn(
                  'flex cursor-pointer items-center justify-between rounded-btn border px-4 py-3 transition-colors',
                  shippingMethod === m.id ? 'border-primary bg-primary/5' : 'border-border',
                )}
              >
                <span className="flex items-center gap-3">
                  <input
                    type="radio"
                    name="shippingMethod"
                    checked={shippingMethod === m.id}
                    onChange={() => chooseMethod(m.id)}
                    className="accent-primary"
                  />
                  <Text as="span" size="base" weight="medium">
                    {m.label}
                  </Text>
                </span>
                <Text
                  as="span"
                  size="sm"
                  weight="bold"
                  value={m.priceCents === 0 ? 'Безплатно' : money(m.priceCents)}
                />
              </label>
            ))}
          </div>

          {/* Delivery target — Econt supports office pickup; Speedy is address-only for now. */}
          {supportsOffice && (
            <div className="mt-4 flex gap-2">
              {(
                [
                  ['ADDRESS', 'До адрес'],
                  ['OFFICE', 'До офис на Еконт'],
                ] as const
              ).map(([val, label]) => (
                <button
                  key={val}
                  type="button"
                  onClick={() => setDeliveryType(val)}
                  className={cn(
                    'flex-1 rounded-btn border px-4 py-2 text-sm font-medium transition-colors',
                    deliveryType === val
                      ? 'border-primary bg-primary text-surface'
                      : 'border-border bg-surface text-ink hover:border-ink',
                  )}
                >
                  {label}
                </button>
              ))}
            </div>
          )}

          {/* Office picker */}
          {usingOffice ? (
            <div className="mt-4 grid gap-4">
              <label className="block">
                <Text as="span" size="sm" weight="medium" className="mb-1 block">
                  Населено място *
                </Text>
                <input
                  list="econt-cities"
                  value={officeCity}
                  onChange={(e) => pickCity(e.target.value)}
                  placeholder="Започнете да пишете…"
                  className={inputCls}
                />
                <datalist id="econt-cities">
                  {cities.map((c) => (
                    <option key={c.name} value={c.name} />
                  ))}
                </datalist>
              </label>

              {officeCity && cities.some((c) => c.name === officeCity) && (
                <label className="block">
                  <Text as="span" size="sm" weight="medium" className="mb-1 block">
                    Офис / Еконтомат *
                  </Text>
                  <select
                    value={officeCode}
                    onChange={(e) => setOfficeCode(e.target.value)}
                    className={inputCls}
                    disabled={loadingOffices}
                  >
                    <option value="">
                      {loadingOffices ? 'Зареждане…' : `Изберете офис (${offices.length})`}
                    </option>
                    {offices.map((o) => (
                      <option key={o.code} value={o.code}>
                        {o.isAPS ? '📦 ' : ''}
                        {o.name} — {o.address}
                      </option>
                    ))}
                  </select>
                </label>
              )}

              {selectedOffice && (
                <div className="rounded-btn border border-primary/30 bg-primary/5 px-4 py-3">
                  <Text as="span" size="sm" weight="bold" value={selectedOffice.name} />
                  <Text as="p" size="xs" color="muted">
                    {selectedOffice.city} · {selectedOffice.address}
                  </Text>
                </div>
              )}
            </div>
          ) : (
            <div className="mt-4 grid gap-4 sm:grid-cols-2">
              <Field label="Град" name="city" value={form.city} onChange={set('city')} />
              <Field
                label="Пощенски код"
                name="postalCode"
                value={form.postalCode}
                onChange={set('postalCode')}
              />
              <Field
                label="Адрес"
                name="address1"
                value={form.address1}
                onChange={set('address1')}
                className="sm:col-span-2"
              />
              <Field
                label="Адрес (ред 2)"
                name="address2"
                value={form.address2}
                onChange={set('address2')}
                required={false}
                className="sm:col-span-2"
              />
            </div>
          )}
        </section>

        <section>
          <Heading as="h2" level={4} className="mb-4">
            Плащане
          </Heading>
          <div className="flex flex-col gap-3">
            <label
              className={cn(
                'flex cursor-pointer items-center gap-3 rounded-btn border px-4 py-3 transition-colors',
                paymentMethod === 'COD' ? 'border-primary bg-primary/5' : 'border-border',
              )}
            >
              <input
                type="radio"
                name="paymentMethod"
                checked={paymentMethod === 'COD'}
                onChange={() => setPaymentMethod('COD')}
                className="accent-primary"
              />
              <Text as="span" size="base" weight="medium">
                Наложен платеж (при доставка)
              </Text>
            </label>
            <label
              className={cn(
                'flex cursor-pointer items-center gap-3 rounded-btn border px-4 py-3 transition-colors',
                paymentMethod === 'CARD' ? 'border-primary bg-primary/5' : 'border-border',
              )}
            >
              <input
                type="radio"
                name="paymentMethod"
                checked={paymentMethod === 'CARD'}
                onChange={() => setPaymentMethod('CARD')}
                className="accent-primary"
              />
              <Text as="span" size="base" weight="medium">
                Карта <span className="text-ink/50">(защитено плащане)</span>
              </Text>
            </label>
          </div>
        </section>
      </div>

      {/* Right — summary */}
      <aside className="h-fit rounded-lg border border-border bg-surface p-6">
        <Heading as="h2" level={4} className="mb-4">
          Вашата поръчка
        </Heading>
        <ul className="mb-4 divide-y divide-border">
          {cart.items.map((item) => (
            <li key={item.id} className="flex items-center gap-3 py-3">
              <span className="relative block size-[52px] shrink-0 overflow-hidden rounded-md bg-page">
                {item.image && (
                  <Image
                    src={item.image.src}
                    alt={item.image.alt}
                    fill
                    sizes="52px"
                    className="object-contain"
                  />
                )}
              </span>
              <span className="min-w-0 flex-1">
                <Text as="span" size="sm" weight="medium" className="line-clamp-1">
                  {item.productTitle}
                </Text>
                <Text as="span" size="xs" color="muted">
                  × {item.quantity}
                </Text>
              </span>
              <Text as="span" size="sm" weight="bold" value={money(item.lineTotal)} />
            </li>
          ))}
        </ul>
        <div className="space-y-1 border-t border-border pt-4">
          <div className="flex justify-between">
            <Text as="span" size="sm" color="muted" value="Междинна сума" />
            <Text as="span" size="sm" value={money(cart.subtotal)} />
          </div>
          <div className="flex justify-between">
            <Text as="span" size="sm" color="muted" value="Доставка" />
            <Text
              as="span"
              size="sm"
              value={shippingCost === 0 ? 'Безплатно' : money(shippingCost)}
            />
          </div>
          <div className="flex justify-between pt-2">
            <Text as="span" size="base" weight="bold" value="Общо" />
            <Text as="span" size="base" weight="bold" value={dualPrice(total)} />
          </div>
          <Text as="p" size="xs" color="muted" className="pt-1" value="ДДС включено." />
        </div>

        {error && <Text as="p" size="sm" className="mt-3 text-sale" value={error} />}

        <Button variant="primary" block type="submit" disabled={pending} className="mt-4">
          <Text
            as="span"
            weight="bold"
            color="white"
            value={pending ? 'Изпращане…' : 'Завърши поръчката'}
          />
        </Button>
      </aside>
    </form>
  );
}
