# Example: Comlink Worker with Progress Reporting

Vite worker setup using Comlink for transparent RPC, typed interface, zero-copy transfer for binary data, and progress callbacks via proxy.

## Worker API Definition

```tsx
// workers/image-processor.api.ts — shared types
export interface ImageProcessorAPI {
  resize(imageData: ImageData, width: number, height: number): Promise<ImageData>
  applyFilter(imageData: ImageData, filter: FilterType): Promise<ImageData>
  processWithProgress(
    imageData: ImageData,
    operations: Operation[],
    onProgress: (percent: number, step: string) => void,
  ): Promise<ImageData>
  getCapabilities(): { maxDimension: number; supportedFilters: FilterType[] }
}

export type FilterType = 'grayscale' | 'sepia' | 'blur' | 'sharpen' | 'invert'

export interface Operation {
  type: 'resize' | 'filter'
  params: { width?: number; height?: number; filter?: FilterType }
}
```

## Worker Implementation

```tsx
// workers/image-processor.worker.ts
import * as Comlink from 'comlink'
import type { ImageProcessorAPI, FilterType, Operation } from './image-processor.api'

const SUPPORTED_FILTERS: FilterType[] = ['grayscale', 'sepia', 'blur', 'sharpen', 'invert']

const api: ImageProcessorAPI = {
  async resize(imageData, width, height) {
    // Create OffscreenCanvas for resizing
    const source = new OffscreenCanvas(imageData.width, imageData.height)
    const sourceCtx = source.getContext('2d')!
    sourceCtx.putImageData(imageData, 0, 0)

    const dest = new OffscreenCanvas(width, height)
    const destCtx = dest.getContext('2d')!
    destCtx.drawImage(source, 0, 0, width, height)

    return destCtx.getImageData(0, 0, width, height)
  },

  async applyFilter(imageData, filter) {
    const data = new Uint8ClampedArray(imageData.data)

    for (let i = 0; i < data.length; i += 4) {
      const r = data[i]
      const g = data[i + 1]
      const b = data[i + 2]

      switch (filter) {
        case 'grayscale': {
          const avg = 0.299 * r + 0.587 * g + 0.114 * b
          data[i] = data[i + 1] = data[i + 2] = avg
          break
        }
        case 'sepia': {
          data[i] = Math.min(255, r * 0.393 + g * 0.769 + b * 0.189)
          data[i + 1] = Math.min(255, r * 0.349 + g * 0.686 + b * 0.168)
          data[i + 2] = Math.min(255, r * 0.272 + g * 0.534 + b * 0.131)
          break
        }
        case 'invert': {
          data[i] = 255 - r
          data[i + 1] = 255 - g
          data[i + 2] = 255 - b
          break
        }
      }
    }

    return new ImageData(data, imageData.width, imageData.height)
  },

  async processWithProgress(imageData, operations, onProgress) {
    let current = imageData

    for (let i = 0; i < operations.length; i++) {
      const op = operations[i]
      const step = `${op.type} (${i + 1}/${operations.length})`
      onProgress((i / operations.length) * 100, step)

      if (op.type === 'resize' && op.params.width && op.params.height) {
        current = await api.resize(current, op.params.width, op.params.height)
      } else if (op.type === 'filter' && op.params.filter) {
        current = await api.applyFilter(current, op.params.filter)
      }
    }

    onProgress(100, 'Complete')
    return current
  },

  getCapabilities() {
    return { maxDimension: 4096, supportedFilters: SUPPORTED_FILTERS }
  },
}

Comlink.expose(api)
```

## React Hook

```tsx
// hooks/useImageProcessor.ts
import { useEffect, useRef, useState, useCallback } from 'react'
import * as Comlink from 'comlink'
import type { ImageProcessorAPI, Operation } from '@/workers/image-processor.api'

export function useImageProcessor() {
  const workerRef = useRef<Worker | null>(null)
  const apiRef = useRef<Comlink.Remote<ImageProcessorAPI> | null>(null)
  const [progress, setProgress] = useState<{ percent: number; step: string } | null>(null)
  const [isProcessing, setIsProcessing] = useState(false)

  useEffect(() => {
    const worker = new Worker(
      new URL('../workers/image-processor.worker.ts', import.meta.url),
      { type: 'module' },
    )
    workerRef.current = worker
    apiRef.current = Comlink.wrap<ImageProcessorAPI>(worker)

    return () => {
      worker.terminate()
      workerRef.current = null
      apiRef.current = null
    }
  }, [])

  const resize = useCallback(async (imageData: ImageData, width: number, height: number) => {
    if (!apiRef.current) throw new Error('Worker not initialized')
    setIsProcessing(true)
    try {
      return await apiRef.current.resize(imageData, width, height)
    } finally {
      setIsProcessing(false)
    }
  }, [])

  const processWithProgress = useCallback(async (imageData: ImageData, operations: Operation[]) => {
    if (!apiRef.current) throw new Error('Worker not initialized')
    setIsProcessing(true)
    setProgress({ percent: 0, step: 'Starting...' })

    try {
      const result = await apiRef.current.processWithProgress(
        imageData,
        operations,
        // Comlink.proxy wraps the callback so the worker can call it
        Comlink.proxy((percent: number, step: string) => {
          setProgress({ percent, step })
        }),
      )
      return result
    } finally {
      setIsProcessing(false)
      setProgress(null)
    }
  }, [])

  return { resize, processWithProgress, isProcessing, progress }
}
```

## Image Editor Component

```tsx
// components/ImageEditor.tsx
'use client'

import { useState, useRef, useCallback } from 'react'
import { useImageProcessor } from '@/hooks/useImageProcessor'
import type { Operation, FilterType } from '@/workers/image-processor.api'

const FILTERS: FilterType[] = ['grayscale', 'sepia', 'invert']

export function ImageEditor() {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [hasImage, setHasImage] = useState(false)
  const [operations, setOperations] = useState<Operation[]>([])
  const { processWithProgress, isProcessing, progress } = useImageProcessor()

  const loadImage = useCallback((file: File) => {
    const img = new Image()
    img.onload = () => {
      const canvas = canvasRef.current!
      canvas.width = img.width
      canvas.height = img.height
      const ctx = canvas.getContext('2d')!
      ctx.drawImage(img, 0, 0)
      setHasImage(true)
      URL.revokeObjectURL(img.src)
    }
    img.src = URL.createObjectURL(file)
  }, [])

  const addFilter = (filter: FilterType) => {
    setOperations((prev) => [...prev, { type: 'filter', params: { filter } }])
  }

  const addResize = (width: number, height: number) => {
    setOperations((prev) => [...prev, { type: 'resize', params: { width, height } }])
  }

  const applyOperations = async () => {
    const canvas = canvasRef.current!
    const ctx = canvas.getContext('2d')!
    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height)

    const result = await processWithProgress(imageData, operations)
    canvas.width = result.width
    canvas.height = result.height
    ctx.putImageData(result, 0, 0)
    setOperations([])
  }

  return (
    <div className="space-y-4">
      {/* File input */}
      <input
        type="file"
        accept="image/*"
        onChange={(e) => e.target.files?.[0] && loadImage(e.target.files[0])}
        className="text-sm"
      />

      {/* Canvas */}
      <canvas
        ref={canvasRef}
        className="max-w-full rounded-lg border bg-muted/20"
      />

      {hasImage && (
        <>
          {/* Filter buttons */}
          <div className="flex flex-wrap gap-2">
            {FILTERS.map((filter) => (
              <button
                key={filter}
                onClick={() => addFilter(filter)}
                disabled={isProcessing}
                className="rounded-lg border px-3 py-1.5 text-sm capitalize hover:bg-muted disabled:opacity-50"
              >
                {filter}
              </button>
            ))}
            <button
              onClick={() => addResize(800, 600)}
              disabled={isProcessing}
              className="rounded-lg border px-3 py-1.5 text-sm hover:bg-muted disabled:opacity-50"
            >
              Resize 800x600
            </button>
          </div>

          {/* Pending operations */}
          {operations.length > 0 && (
            <div className="flex items-center gap-3">
              <span className="text-sm text-muted-foreground">
                {operations.length} operation{operations.length !== 1 ? 's' : ''} queued
              </span>
              <button
                onClick={applyOperations}
                disabled={isProcessing}
                className="rounded-lg bg-primary px-4 py-1.5 text-sm text-primary-foreground disabled:opacity-50"
              >
                Apply All
              </button>
              <button
                onClick={() => setOperations([])}
                disabled={isProcessing}
                className="text-sm text-muted-foreground hover:underline"
              >
                Clear
              </button>
            </div>
          )}

          {/* Progress bar */}
          {progress && (
            <div className="space-y-1">
              <div className="flex justify-between text-xs text-muted-foreground">
                <span>{progress.step}</span>
                <span>{Math.round(progress.percent)}%</span>
              </div>
              <div className="h-2 rounded-full bg-muted">
                <div
                  className="h-full rounded-full bg-primary transition-all duration-200"
                  style={{ width: `${progress.percent}%` }}
                />
              </div>
            </div>
          )}
        </>
      )}
    </div>
  )
}
```

## Vite Config

```tsx
// vite.config.ts — no special config needed for Vite 5+
// Workers using `new URL(..., import.meta.url)` are auto-bundled

// For older Vite or custom needs:
import { defineConfig } from 'vite'

export default defineConfig({
  worker: {
    format: 'es', // Use ES modules in workers (default in Vite 5+)
  },
})
```

## Key Patterns

1. **Comlink.expose / Comlink.wrap** — Worker exposes a plain object with async methods. Main thread wraps the worker to get a typed proxy. No manual `postMessage` / `onmessage` handling.
2. **Comlink.proxy for callbacks** — `Comlink.proxy(fn)` wraps a callback so the worker can invoke it across the thread boundary. Used here for real-time progress reporting from worker to main thread.
3. **Shared API type** — `ImageProcessorAPI` interface is defined once in a separate `.api.ts` file and imported by both worker and hook. Full TypeScript safety across the thread boundary.
4. **Worker lifecycle in React** — `useEffect` creates and terminates the worker. `useRef` holds the Comlink proxy. Cleanup on unmount prevents memory leaks.
5. **OffscreenCanvas in worker** — Image manipulation runs entirely off-main-thread using `OffscreenCanvas`, keeping the UI responsive during heavy pixel operations.
6. **Operation queue pattern** — Operations are batched in state and applied together via `processWithProgress`, reducing worker round-trips and enabling a single progress bar.
