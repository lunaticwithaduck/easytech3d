# Web Workers

## Dedicated Worker

### Basic Setup

```tsx
// worker.ts
self.addEventListener('message', (e: MessageEvent<{ items: number[] }>) => {
  const result = e.data.items.map((x) => x * x)
  self.postMessage({ result })
})

// main.ts
const worker = new Worker(new URL('./worker.ts', import.meta.url))
worker.postMessage({ items: [1, 2, 3, 4, 5] })
worker.addEventListener('message', (e: MessageEvent<{ result: number[] }>) => {
  console.log('Result:', e.data.result) // [1, 4, 9, 16, 25]
})

// Cleanup
worker.terminate()
```

### Error Handling

```tsx
worker.addEventListener('error', (e: ErrorEvent) => {
  console.error(`Worker error: ${e.message} at ${e.filename}:${e.lineno}`)
  e.preventDefault() // Prevent default error reporting
})

worker.addEventListener('messageerror', () => {
  console.error('Failed to deserialize worker message')
})
```

## Typed Message Protocol

```tsx
// shared-types.ts
type WorkerRequest =
  | { type: 'parse'; payload: { raw: string; format: 'csv' | 'json' } }
  | { type: 'sort'; payload: { data: number[]; order: 'asc' | 'desc' } }
  | { type: 'cancel' }

type WorkerResponse =
  | { type: 'result'; payload: { data: unknown[]; durationMs: number } }
  | { type: 'progress'; payload: { percent: number } }
  | { type: 'error'; payload: { message: string } }

// worker.ts
self.addEventListener('message', (e: MessageEvent<WorkerRequest>) => {
  const request = e.data

  switch (request.type) {
    case 'parse': {
      const start = performance.now()
      try {
        const data = request.payload.format === 'csv'
          ? parseCSV(request.payload.raw)
          : JSON.parse(request.payload.raw)
        const response: WorkerResponse = {
          type: 'result',
          payload: { data, durationMs: performance.now() - start },
        }
        self.postMessage(response)
      } catch (err) {
        const response: WorkerResponse = {
          type: 'error',
          payload: { message: (err as Error).message },
        }
        self.postMessage(response)
      }
      break
    }
    case 'sort': {
      const sorted = [...request.payload.data].sort((a, b) =>
        request.payload.order === 'asc' ? a - b : b - a,
      )
      const response: WorkerResponse = { type: 'result', payload: { data: sorted, durationMs: 0 } }
      self.postMessage(response)
      break
    }
    case 'cancel':
      // Clean up any in-progress work
      break
  }
})

// main.ts
const worker = new Worker(new URL('./worker.ts', import.meta.url))

worker.addEventListener('message', (e: MessageEvent<WorkerResponse>) => {
  switch (e.data.type) {
    case 'result':
      console.log('Got result:', e.data.payload.data)
      break
    case 'progress':
      updateProgressBar(e.data.payload.percent)
      break
    case 'error':
      showError(e.data.payload.message)
      break
  }
})

const request: WorkerRequest = { type: 'parse', payload: { raw: csvString, format: 'csv' } }
worker.postMessage(request)
```

## Transferable Objects

### What Transfers vs What Copies

| Type | Transfer (zero-copy) | Structured Clone (copy) |
|------|---------------------|------------------------|
| ArrayBuffer | Yes | Yes |
| MessagePort | Yes | No |
| OffscreenCanvas | Yes | No |
| ImageBitmap | Yes | No |
| ReadableStream | Yes | No |
| string, number, boolean | N/A | Yes (always copied) |
| Object, Array | N/A | Yes (deep clone) |
| Map, Set, Date, RegExp | N/A | Yes |
| Function, DOM Node | N/A | **No** (not cloneable) |

### Transfer Syntax

```tsx
// Transfer (zero-copy — buffer becomes unusable in sender)
const buffer = new ArrayBuffer(1024 * 1024) // 1MB
worker.postMessage({ type: 'process', data: buffer }, [buffer])
console.log(buffer.byteLength) // 0 — buffer is "neutered"

// Without transfer (copies all 1MB — slow for large data)
worker.postMessage({ type: 'process', data: buffer })
console.log(buffer.byteLength) // 1048576 — still usable

// Transfer typed array's underlying buffer
const floats = new Float32Array(10000)
worker.postMessage({ type: 'analyze', data: floats }, [floats.buffer])

// Transfer multiple buffers
worker.postMessage(
  { bufferA: buf1, bufferB: buf2 },
  [buf1, buf2], // Transfer list
)
```

**Rule of thumb:** Transfer any ArrayBuffer > 1KB.

## SharedWorker

```tsx
// shared-worker.ts
const ports: Set<MessagePort> = new Set()

self.addEventListener('connect', (e: MessageEvent) => {
  const port = e.ports[0]
  ports.add(port)

  port.addEventListener('message', (event: MessageEvent) => {
    // Broadcast to all connected tabs
    for (const p of ports) {
      p.postMessage({ type: 'broadcast', data: event.data, tabCount: ports.size })
    }
  })

  port.start()

  // Handle tab closing
  port.addEventListener('close', () => {
    ports.delete(port)
  })
})

// main.ts (in any tab)
const worker = new SharedWorker(new URL('./shared-worker.ts', import.meta.url))
worker.port.start()

worker.port.postMessage({ type: 'hello', from: 'tab1' })
worker.port.addEventListener('message', (e: MessageEvent) => {
  console.log('Received:', e.data)
})

// Cleanup on tab close
window.addEventListener('beforeunload', () => {
  worker.port.close()
})
```

### Use Cases for SharedWorker
- Shared WebSocket connection (one connection for N tabs)
- Cross-tab state synchronization
- Shared computation cache (compute once, serve to all tabs)
- Tab coordination (leader election)

## Comlink

### Basic Setup

```tsx
// worker.ts
import { expose } from 'comlink'

const api = {
  async processData(items: number[]): Promise<number[]> {
    // Heavy computation — runs off main thread
    return items.map((x) => expensiveCalculation(x))
  },

  async analyzeText(text: string): Promise<{ words: number; sentences: number }> {
    return {
      words: text.split(/\s+/).length,
      sentences: text.split(/[.!?]+/).length - 1,
    }
  },
}

export type WorkerAPI = typeof api
expose(api)

// main.ts
import { wrap } from 'comlink'
import type { WorkerAPI } from './worker'

const worker = wrap<WorkerAPI>(new Worker(new URL('./worker.ts', import.meta.url)))

// Call like a normal async function — fully typed
const result = await worker.processData([1, 2, 3])
const analysis = await worker.analyzeText('Hello world. How are you?')
```

### Comlink with Transferable Objects

```tsx
import { wrap, transfer } from 'comlink'

const imageBuffer = new ArrayBuffer(1024 * 1024)
// transfer() marks the buffer for zero-copy transfer
const result = await worker.processImage(transfer(imageBuffer, [imageBuffer]))
```

### Comlink with Callbacks (proxy)

```tsx
import { expose, proxy } from 'comlink'

// Worker — accepts a callback
const api = {
  async processWithProgress(
    data: number[],
    onProgress: (percent: number) => void,
  ): Promise<number[]> {
    const results: number[] = []
    for (let i = 0; i < data.length; i++) {
      results.push(expensiveCalculation(data[i]))
      onProgress(((i + 1) / data.length) * 100)
    }
    return results
  },
}
expose(api)

// Main — wrap callback with proxy()
const result = await worker.processWithProgress(
  largeDataset,
  proxy((percent: number) => {
    setProgress(percent) // Update React state from worker progress
  }),
)
```

### React Hook for Comlink

```tsx
import { useRef, useEffect, useCallback } from 'react'
import { wrap, type Remote } from 'comlink'

function useWorker<T>(createWorker: () => Worker) {
  const workerRef = useRef<Remote<T> | null>(null)
  const rawWorkerRef = useRef<Worker | null>(null)

  // Lazy initialization
  const getWorker = useCallback(() => {
    if (!workerRef.current) {
      const rawWorker = createWorker()
      rawWorkerRef.current = rawWorker
      workerRef.current = wrap<T>(rawWorker)
    }
    return workerRef.current
  }, [createWorker])

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      rawWorkerRef.current?.terminate()
      workerRef.current = null
      rawWorkerRef.current = null
    }
  }, [])

  return getWorker
}

// Usage
function MyComponent() {
  const getProcessor = useWorker<WorkerAPI>(
    () => new Worker(new URL('./worker.ts', import.meta.url)),
  )

  const handleProcess = async () => {
    const worker = getProcessor()
    const result = await worker.processData([1, 2, 3])
  }
}
```

## Bundler Configuration

### Vite

```tsx
// Standard pattern (works in all bundlers)
const worker = new Worker(new URL('./worker.ts', import.meta.url), { type: 'module' })

// Vite-specific import with ?worker suffix
import MyWorker from './worker?worker'
const worker = new MyWorker()
```

### webpack 5

```tsx
// webpack automatically bundles the worker entry point
const worker = new Worker(new URL('./worker.ts', import.meta.url))
```

### Next.js

- Workers only work in **client components** (`'use client'`)
- Create worker in `useEffect` or event handler (not during SSR)
- Use the `new URL('./worker.ts', import.meta.url)` pattern

## Worker Pool

```tsx
class WorkerPool<TInput, TOutput> {
  private workers: Worker[] = []
  private available: Worker[] = []
  private queue: Array<{
    data: TInput
    resolve: (result: TOutput) => void
    reject: (error: Error) => void
  }> = []

  constructor(
    private workerUrl: URL,
    private poolSize = navigator.hardwareConcurrency || 4,
  ) {
    for (let i = 0; i < this.poolSize; i++) {
      const worker = new Worker(this.workerUrl, { type: 'module' })
      this.workers.push(worker)
      this.available.push(worker)
    }
  }

  exec(data: TInput): Promise<TOutput> {
    return new Promise((resolve, reject) => {
      const worker = this.available.pop()
      if (worker) {
        this.runOnWorker(worker, data, resolve, reject)
      } else {
        this.queue.push({ data, resolve, reject })
      }
    })
  }

  private runOnWorker(
    worker: Worker,
    data: TInput,
    resolve: (r: TOutput) => void,
    reject: (e: Error) => void,
  ) {
    const handler = (e: MessageEvent<TOutput>) => {
      worker.removeEventListener('message', handler)
      this.available.push(worker)
      resolve(e.data)
      this.processQueue()
    }
    worker.addEventListener('message', handler)
    worker.postMessage(data)
  }

  private processQueue() {
    if (this.queue.length > 0 && this.available.length > 0) {
      const { data, resolve, reject } = this.queue.shift()!
      this.runOnWorker(this.available.pop()!, data, resolve, reject)
    }
  }

  terminate() {
    this.workers.forEach((w) => w.terminate())
    this.workers = []
    this.available = []
    this.queue.forEach(({ reject }) => reject(new Error('Pool terminated')))
    this.queue = []
  }
}

// Usage
const pool = new WorkerPool<number[], number>(
  new URL('./sum-worker.ts', import.meta.url),
  4,
)

const results = await Promise.all([
  pool.exec([1, 2, 3]),
  pool.exec([4, 5, 6]),
  pool.exec([7, 8, 9]),
])
```

## Performance Tips

- **Profile in DevTools** — Performance tab shows workers as separate threads
- **Batch messages** — avoid frequent small messages; combine into larger payloads
- **Transfer, don't copy** — use transferable objects for data > 1KB
- **OffscreenCanvas** — render canvas in worker, transfer to main thread
- **SharedArrayBuffer + Atomics** — shared memory for real-time coordination (requires cross-origin isolation: `Cross-Origin-Opener-Policy: same-origin` + `Cross-Origin-Embedder-Policy: require-corp`)
