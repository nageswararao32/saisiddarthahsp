const loaded = new Map()

// Loads an external <script> once and caches the in-flight promise so repeat
// calls (e.g. re-opening the payment modal) don't inject it twice.
export function loadScript(src) {
  if (loaded.has(src)) return loaded.get(src)

  const promise = new Promise((resolve, reject) => {
    if (document.querySelector(`script[src="${src}"]`)) {
      resolve(true)
      return
    }
    const script = document.createElement('script')
    script.src = src
    script.onload = () => resolve(true)
    script.onerror = () => reject(new Error(`Failed to load script: ${src}`))
    document.body.appendChild(script)
  })

  loaded.set(src, promise)
  return promise
}
