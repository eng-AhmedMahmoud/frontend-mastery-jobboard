/**
 * The fake network. Latency varies, requests can be cancelled, and because the delay
 * is random two requests can land out of order — which is exactly the bug the search
 * box has to survive in module 7.
 */
export const latency = () => 180 + Math.random() * 420

export const wait = (ms: number, signal?: AbortSignal) =>
  new Promise<void>((resolve, reject) => {
    const timer = setTimeout(resolve, ms)
    signal?.addEventListener('abort', () => {
      clearTimeout(timer)
      reject(new DOMException('Aborted', 'AbortError'))
    })
  })
