/**
 * Web Platform Observers (IntersectionObserver, ResizeObserver, MutationObserver)
 *
 * Provides typed, clean subscription helpers for the 3 major browser observers:
 * 1. observeIntersection: For infinite scroll sentinels and lazy image loading
 * 2. observeResize: For responsive container queries without polling or window resize listeners
 * 3. observeMutations: For DOM tree change detection
 */

export function observeIntersection(
  target: Element,
  onIntersect: (isIntersecting: boolean, entry: IntersectionObserverEntry) => void,
  options?: IntersectionObserverInit
): () => void {
  const observer = new IntersectionObserver((entries) => {
    for (const entry of entries) {
      onIntersect(entry.isIntersecting, entry)
    }
  }, options)

  observer.observe(target)
  return () => observer.disconnect()
}

export function observeResize(
  target: Element,
  onResize: (contentRect: DOMRectReadOnly, entry: ResizeObserverEntry) => void
): () => void {
  const observer = new ResizeObserver((entries) => {
    for (const entry of entries) {
      onResize(entry.contentRect, entry)
    }
  })

  observer.observe(target)
  return () => observer.disconnect()
}

export function observeMutations(
  target: Node,
  onMutate: (mutations: MutationRecord[]) => void,
  options: MutationObserverInit = { childList: true, subtree: true }
): () => void {
  const observer = new MutationObserver((mutations) => {
    onMutate(mutations)
  })

  observer.observe(target, options)
  return () => observer.disconnect()
}
