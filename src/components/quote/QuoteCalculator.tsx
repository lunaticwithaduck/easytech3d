'use client';

import { useMemo, useRef, useState } from 'react';
import { Button, cn, Heading, Icon, Text } from '@/design-system';
import {
  deliveryEstimate,
  formatTime,
  getDiscount,
  infillHint,
  MATERIAL_COLORS,
  MATERIALS,
  MAX_DIM_MM,
  type MaterialId,
  MIN_PRICE,
  PLA_GROUPS,
} from './materials';
import { Stl3DPreview } from './Stl3DPreview';
import { analyze, calcWeight, parseSTL } from './stl';

type FileEntry = {
  id: string;
  name: string;
  size: number;
  volumeCm3: number;
  dims: { x: number; y: number; z: number };
  buffer: ArrayBuffer;
};

const selectCls =
  'w-full rounded-md border border-border bg-surface px-3 py-2.5 text-base text-ink outline-none focus:border-ink';
const inputCls =
  'w-full rounded-md border border-border bg-surface px-3 py-2 text-sm text-ink outline-none placeholder:text-ink/40 focus:border-ink';

export function QuoteCalculator() {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [files, setFiles] = useState<FileEntry[]>([]);
  const [materialId, setMaterialId] = useState<MaterialId>('pla');
  const [color, setColor] = useState<string>(MATERIAL_COLORS.pla[0]);
  const [infill, setInfill] = useState(20);
  const [qty, setQty] = useState(1);
  const [printNotes, setPrintNotes] = useState('');
  const [contact, setContact] = useState({ name: '', phone: '', email: '', notes: '' });
  const [error, setError] = useState<string | null>(null);
  const [analyzing, setAnalyzing] = useState(false);
  const [dragOver, setDragOver] = useState(false);
  const [lightbox, setLightbox] = useState<FileEntry | null>(null);
  const [submitState, setSubmitState] = useState<'idle' | 'sending' | 'done'>('idle');

  const material = MATERIALS.find((m) => m.id === materialId) ?? MATERIALS[0];

  const pricing = useMemo(() => {
    if (files.length === 0) return null;
    const { pricePerGram: ppg, density, flow } = material;
    let totalWeight = 0;
    let totalRaw = 0;
    let totalHours = 0;
    const measured = files.map((f) => {
      const weight = calcWeight(f.volumeCm3, density, infill);
      totalWeight += weight;
      totalRaw += weight * ppg;
      totalHours += weight / flow;
      return { file: f, weight, raw: weight * ppg };
    });
    const rawTotal = Math.max(MIN_PRICE, totalRaw);
    // Distribute the (possibly minimum-floored) unit subtotal across files in
    // proportion to each file's raw cost, so the per-file cards ALWAYS sum to the
    // displayed total (above the minimum, each card just shows its own raw cost).
    const perFile = measured.map((m) => ({
      file: m.file,
      weight: m.weight,
      price: totalRaw > 0 ? (m.raw / totalRaw) * rawTotal : rawTotal / files.length,
    }));
    const discount = getDiscount(qty);
    const discountAmt = (rawTotal * discount) / 100;
    const unitPrice = rawTotal - discountAmt;
    const finalPrice = unitPrice * qty;
    const totalTime = totalHours * qty;
    return {
      perFile,
      totalWeight,
      discount,
      discountAmt,
      unitPrice,
      finalPrice,
      belowMin: totalRaw < MIN_PRICE,
      time: formatTime(totalTime),
      delivery: deliveryEstimate(totalTime),
    };
  }, [files, material, infill, qty]);

  async function processFiles(list: FileList | File[]) {
    setError(null);
    const incoming = Array.from(list).filter((f) => f.name.toLowerCase().endsWith('.stl'));
    if (incoming.length === 0) {
      setError('Моля, качете STL файл(ове).');
      return;
    }
    const tooBig = incoming.find((f) => f.size > 100 * 1024 * 1024);
    if (tooBig) {
      setError(`Файлът "${tooBig.name}" е над 100MB.`);
      return;
    }
    setAnalyzing(true);
    const added: FileEntry[] = [];
    for (const file of incoming) {
      try {
        const buffer = await file.arrayBuffer();
        const tris = parseSTL(buffer);
        if (tris.length === 0) throw new Error(`Невалиден STL: ${file.name}`);
        const { volMm3, dims } = analyze(tris);
        if (dims.x > MAX_DIM_MM || dims.y > MAX_DIM_MM || dims.z > MAX_DIM_MM) {
          setError(
            `${file.name}: твърде голям (${dims.x.toFixed(0)}x${dims.y.toFixed(0)}x${dims.z.toFixed(0)}mm). Макс: ${MAX_DIM_MM}mm.`,
          );
          continue;
        }
        added.push({
          id: `${Date.now()}-${Math.random()}`,
          name: file.name,
          size: file.size,
          volumeCm3: volMm3 / 1000,
          dims,
          buffer,
        });
      } catch (e) {
        setError(e instanceof Error ? e.message : 'Грешка при четене на файла.');
      }
    }
    setFiles((prev) => [...prev, ...added]);
    setAnalyzing(false);
  }

  function changeMaterial(id: MaterialId) {
    setMaterialId(id);
    const colors = MATERIAL_COLORS[id];
    if (!colors.includes(color)) setColor(colors[0]);
  }

  async function onSubmit() {
    setError(null);
    if (files.length === 0) return setError('Моля, качете STL файл.');
    if (!contact.name.trim()) return setError('Моля, попълнете вашето име.');
    if (!contact.phone.trim()) return setError('Моля, попълнете телефон.');
    if (!contact.email.trim()) return setError('Моля, попълнете имейл адрес.');
    if (!pricing) return;

    setSubmitState('sending');
    const primary = files[0];
    const payload = {
      fileNames: files.map((f) => f.name),
      qty,
      unitPrice: Number(pricing.unitPrice.toFixed(2)),
      totalPrice: Number(pricing.finalPrice.toFixed(2)),
      material: material.label,
      color,
      infill,
      totalVolumeCm3: Number(files.reduce((s, f) => s + f.volumeCm3, 0).toFixed(2)),
      totalWeightG: Number(pricing.totalWeight.toFixed(1)),
      dims: `${primary.dims.x.toFixed(1)}x${primary.dims.y.toFixed(1)}x${primary.dims.z.toFixed(1)}`,
      customer: {
        name: contact.name.trim(),
        phone: contact.phone.trim(),
        email: contact.email.trim(),
      },
      notes: [printNotes.trim(), contact.notes.trim()].filter(Boolean).join('\n'),
    };
    // Upload the actual STL bytes alongside the metadata (multipart → Route Handler → backend).
    const fd = new FormData();
    for (const f of files) {
      fd.append('files', new Blob([f.buffer], { type: 'model/stl' }), f.name);
    }
    fd.append('payload', JSON.stringify(payload));
    try {
      const res = await fetch('/api/print-quote', { method: 'POST', body: fd });
      if (res.ok) {
        setSubmitState('done');
      } else {
        const body = (await res.json().catch(() => ({}))) as { error?: string };
        setSubmitState('idle');
        setError(body.error ?? 'Неуспешно изпращане на заявката.');
      }
    } catch {
      setSubmitState('idle');
      setError('Възникна грешка при изпращането.');
    }
  }

  function emailQuote() {
    if (!pricing) return;
    const filesList = files
      .map(
        (f) =>
          `  - ${f.name} (${f.dims.x.toFixed(1)}x${f.dims.y.toFixed(1)}x${f.dims.z.toFixed(1)}mm, ${f.volumeCm3.toFixed(1)}cm³)`,
      )
      .join('\n');
    const subject = `3D Принт заявка — ${files.length} файл(а)`;
    const body =
      `Здравейте,\n\nБих искал/а да поръчам 3D принт:\n\nФайлове:\n${filesList}\n\n` +
      `Материал: ${material.label}\nЦвят: ${color}\nЗапълване: ${infill}%\nКоличество: ${qty} бр.\n` +
      `Ориентировъчна цена: ${pricing.finalPrice.toFixed(2)} €\nОчаквана доставка: ${pricing.delivery}\n` +
      (printNotes ? `\nБележки: ${printNotes}\n` : '') +
      '\nМоля, потвърдете поръчката.\n\nБлагодаря!';
    window.open(
      `mailto:info@easytech3d.com?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`,
      '_self',
    );
  }

  return (
    <div className="rounded-xl bg-surface p-6 shadow-sm sm:p-8">
      <Heading as="h1" level={3} className="mb-1">
        3D Принт по поръчка
      </Heading>
      <Text
        as="p"
        color="muted"
        className="mb-6"
        value="Качете STL файлове и получете моментална цена. Доставка в цяла България."
      />

      {/* Upload */}
      <button
        type="button"
        onClick={() => fileInputRef.current?.click()}
        onDragOver={(e) => {
          e.preventDefault();
          setDragOver(true);
        }}
        onDragLeave={() => setDragOver(false)}
        onDrop={(e) => {
          e.preventDefault();
          setDragOver(false);
          if (e.dataTransfer.files.length) void processFiles(e.dataTransfer.files);
        }}
        className={cn(
          'mb-6 w-full rounded-xl border-2 border-dashed px-6 py-10 text-center transition-colors',
          dragOver
            ? 'border-primary bg-primary/5'
            : files.length
              ? 'border-success bg-success/5'
              : 'border-border hover:border-primary hover:bg-primary/5',
        )}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept=".stl,.STL"
          multiple
          className="hidden"
          onChange={(e) => {
            if (e.target.files?.length) void processFiles(e.target.files);
            e.target.value = '';
          }}
        />
        <div className="mb-2 text-4xl">📦</div>
        <Text as="span" size="base" color="muted">
          Плъзнете STL файлове тук или{' '}
          <span className="font-bold text-primary">изберете файлове</span>
        </Text>
        <Text
          as="p"
          size="xs"
          color="muted"
          className="mt-1"
          value="Може да качите няколко файла наведнъж"
        />
      </button>

      {analyzing && (
        <Text
          as="p"
          size="sm"
          color="muted"
          className="mb-4 text-center"
          value="Анализиране на модели…"
        />
      )}
      {error && (
        <Text
          as="p"
          size="sm"
          className="mb-4 rounded-md bg-sale/10 px-4 py-3 text-sale"
          value={error}
        />
      )}

      {/* File cards */}
      {pricing && (
        <div className="mb-6 flex flex-col gap-3">
          {pricing.perFile.map(({ file, price }) => (
            <div
              key={file.id}
              className="relative grid grid-cols-[120px_1fr] gap-4 rounded-xl border border-border bg-page p-4 max-[480px]:grid-cols-1"
            >
              <Stl3DPreview
                buffer={file.buffer}
                onClick={() => setLightbox(file)}
                className="h-[100px] w-[120px] cursor-zoom-in rounded-md max-[480px]:h-[160px] max-[480px]:w-full"
              />
              <div className="flex flex-col justify-center gap-1">
                <Text as="span" size="sm" weight="bold" className="break-all">
                  {file.name}
                </Text>
                <div className="flex flex-wrap gap-1.5 text-xs text-ink/60">
                  <span className="rounded bg-ink/5 px-2 py-0.5">
                    {(file.size / 1024).toFixed(0)} KB
                  </span>
                  <span className="rounded bg-ink/5 px-2 py-0.5">
                    {file.dims.x.toFixed(1)} × {file.dims.y.toFixed(1)} × {file.dims.z.toFixed(1)}{' '}
                    mm
                  </span>
                  <span className="rounded bg-ink/5 px-2 py-0.5">
                    {file.volumeCm3.toFixed(1)} cm³
                  </span>
                </div>
                <Text
                  as="span"
                  size="base"
                  weight="bold"
                  color="primary"
                  className="mt-1"
                  value={`${price.toFixed(2)} €`}
                />
              </div>
              <button
                type="button"
                aria-label="Премахни"
                onClick={() => setFiles((prev) => prev.filter((f) => f.id !== file.id))}
                className="absolute right-2 top-2 flex size-7 items-center justify-center rounded-full bg-surface text-ink/50 shadow hover:text-sale"
              >
                <Icon name="close" className="size-4" />
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Material + colour */}
      <div className="mb-6 grid gap-4 sm:grid-cols-2">
        <label className="block">
          <Text as="span" size="sm" weight="bold" className="mb-1 block" value="Материал" />
          <select
            className={selectCls}
            value={materialId}
            onChange={(e) => changeMaterial(e.target.value as MaterialId)}
          >
            {MATERIALS.map((m) => (
              <option key={m.id} value={m.id}>
                {m.label} — {m.pricePerGram.toFixed(2)} €/г
              </option>
            ))}
          </select>
          <Text
            as="span"
            size="xs"
            weight="bold"
            color="primary"
            className="mt-1 block"
            value={`${material.pricePerGram.toFixed(2)} €/г`}
          />
        </label>
        <label className="block">
          <Text as="span" size="sm" weight="bold" className="mb-1 block" value="Цвят" />
          <select className={selectCls} value={color} onChange={(e) => setColor(e.target.value)}>
            {materialId === 'pla'
              ? Object.entries(PLA_GROUPS).map(([group, colors]) => (
                  <optgroup key={group} label={group}>
                    {colors.map((c) => (
                      <option key={c} value={c}>
                        {c}
                      </option>
                    ))}
                  </optgroup>
                ))
              : MATERIAL_COLORS[materialId].map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
          </select>
        </label>
      </div>

      {/* Infill */}
      <div className="mb-6">
        <Text as="span" size="sm" weight="bold" className="mb-1 block">
          Запълване (Infill): {infill}%
        </Text>
        <input
          type="range"
          min={10}
          max={100}
          step={5}
          value={infill}
          onChange={(e) => setInfill(Number(e.target.value))}
          className="w-full accent-primary"
        />
        <Text as="p" size="xs" color="muted" className="mt-1" value={infillHint(infill)} />
      </div>

      {/* Notes */}
      <div className="mb-6">
        <Text as="span" size="sm" weight="bold" className="mb-1 block" value="Бележки (по избор)" />
        <textarea
          value={printNotes}
          onChange={(e) => setPrintNotes(e.target.value)}
          placeholder="Специални изисквания, срок, пост-обработка…"
          className={cn(inputCls, 'min-h-[100px] resize-y')}
        />
      </div>

      {pricing && (
        <>
          {/* Estimates */}
          <div className="mb-4 grid grid-cols-2 gap-3 max-[480px]:grid-cols-1">
            <div className="rounded-lg bg-page px-4 py-3 text-center">
              <Text
                as="p"
                size="2xs"
                color="muted"
                className="uppercase tracking-wide"
                value="Време за печат"
              />
              <Text as="p" size="h5" weight="bold" value={pricing.time} />
            </div>
            <div className="rounded-lg bg-page px-4 py-3 text-center">
              <Text
                as="p"
                size="2xs"
                color="muted"
                className="uppercase tracking-wide"
                value="Очаквана доставка"
              />
              <Text as="p" size="h5" weight="bold" value={pricing.delivery} />
            </div>
          </div>

          {/* Price box */}
          <div className="mb-4 rounded-xl bg-ink p-6 text-surface">
            <div className="mb-2 flex justify-between text-sm text-surface/70">
              <span>Общо тегло</span>
              <span>
                {pricing.totalWeight.toFixed(1)} г ({files.length} файл{files.length > 1 ? 'а' : ''}
                )
              </span>
            </div>
            <div className="mb-2 flex justify-between text-sm text-surface/70">
              <span>Материал</span>
              <span>
                {material.label} @ {material.pricePerGram.toFixed(2)} €/г
              </span>
            </div>
            {pricing.discount > 0 && (
              <div className="mb-2 flex justify-between text-sm">
                <span className="text-surface/70">Отстъпка за количество</span>
                <span className="font-bold text-success">
                  −{pricing.discount}% (−{(pricing.discountAmt * qty).toFixed(2)} €)
                </span>
              </div>
            )}
            <div className="mt-4 flex items-baseline justify-between border-t border-surface/20 pt-4">
              <span className="text-base font-semibold">Цена</span>
              <span>
                <span className="text-3xl font-bold text-primary">
                  {pricing.finalPrice.toFixed(2)}
                </span>
                <span className="ml-1 text-base text-surface/70">€</span>
              </span>
            </div>
          </div>

          {pricing.belowMin && (
            <Text
              as="p"
              size="sm"
              weight="bold"
              className="mb-4 rounded-md border border-primary bg-primary/5 px-4 py-2.5 text-center text-primary"
              value={`Минималната поръчка е ${MIN_PRICE.toFixed(2)} €. Цената е коригирана.`}
            />
          )}
          {pricing.discount > 0 && (
            <Text
              as="p"
              size="sm"
              weight="bold"
              className="mb-4 rounded-md border border-success bg-success/10 px-4 py-2.5 text-center text-success"
              value={`Отстъпка ${pricing.discount}% за ${qty} бр!`}
            />
          )}

          {/* Contact */}
          <div className="mb-4 rounded-lg border border-border bg-page p-4">
            <Text as="span" size="base" weight="bold" className="mb-3 block" value="Заяви оферта" />
            <div className="grid gap-2.5 sm:grid-cols-2">
              <input
                className={inputCls}
                placeholder="Име"
                autoComplete="name"
                value={contact.name}
                onChange={(e) => setContact((c) => ({ ...c, name: e.target.value }))}
              />
              <input
                className={inputCls}
                placeholder="Телефон"
                autoComplete="tel"
                value={contact.phone}
                onChange={(e) => setContact((c) => ({ ...c, phone: e.target.value }))}
              />
              <input
                className={cn(inputCls, 'sm:col-span-2')}
                type="email"
                placeholder="Имейл"
                autoComplete="email"
                value={contact.email}
                onChange={(e) => setContact((c) => ({ ...c, email: e.target.value }))}
              />
            </div>
          </div>

          {/* Actions */}
          {submitState === 'done' ? (
            <Text
              as="p"
              size="base"
              weight="bold"
              className="rounded-md bg-success/10 px-4 py-3 text-center text-success"
              value="Заявено! Ще се свържем с Вас по имейл."
            />
          ) : (
            <div className="flex flex-col gap-3 sm:flex-row">
              <div className="flex items-center overflow-hidden rounded-md border border-border">
                <button
                  type="button"
                  onClick={() => setQty((q) => Math.max(1, q - 1))}
                  className="h-12 w-10 bg-page text-lg font-bold hover:bg-ink/10"
                >
                  −
                </button>
                <input
                  type="number"
                  min={1}
                  max={99}
                  value={qty}
                  onChange={(e) =>
                    setQty(Math.min(99, Math.max(1, Number.parseInt(e.target.value, 10) || 1)))
                  }
                  className="w-12 border-0 text-center text-base font-bold outline-none"
                />
                <button
                  type="button"
                  onClick={() => setQty((q) => Math.min(99, q + 1))}
                  className="h-12 w-10 bg-page text-lg font-bold hover:bg-ink/10"
                >
                  +
                </button>
              </div>
              <Button
                variant="primary"
                type="button"
                className="flex-1"
                disabled={submitState === 'sending'}
                onClick={onSubmit}
              >
                <Text
                  as="span"
                  weight="bold"
                  color="white"
                  value={submitState === 'sending' ? 'Изпращане…' : 'Заяви оферта'}
                />
              </Button>
              <Button variant="secondary" type="button" className="flex-1" onClick={emailQuote}>
                <Text as="span" weight="bold" value="Изпрати оферта" />
              </Button>
            </div>
          )}
          <Text
            as="p"
            size="xs"
            color="muted"
            className="mt-4 text-center"
            value="Ще получите имейл с потвърждение. Поръчката се обработва след потвърждение."
          />
        </>
      )}

      {/* Lightbox */}
      {lightbox && (
        <button
          type="button"
          aria-label="Затвори визуализацията"
          className="fixed inset-0 z-[9999] flex cursor-zoom-out items-center justify-center bg-black/85"
          onClick={() => setLightbox(null)}
        >
          <Stl3DPreview
            buffer={lightbox.buffer}
            className="h-[80vh] max-h-[700px] w-[80vw] max-w-[900px] rounded-2xl"
          />
          <span className="absolute bottom-6 left-1/2 -translate-x-1/2 rounded-full bg-black/50 px-4 py-1.5 text-sm text-white">
            {lightbox.name}
          </span>
        </button>
      )}
    </div>
  );
}
