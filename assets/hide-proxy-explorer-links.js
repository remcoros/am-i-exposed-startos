;(() => {
  const guard = '__startosProxyExplorerLinkPatch'
  if (window[guard]) return
  window[guard] = true

  const hideBrokenExplorerLinks = (root) => {
    const anchors =
      root instanceof HTMLAnchorElement
        ? [root]
        : (root.querySelectorAll?.('a[href]') ?? [])

    for (const anchor of anchors) {
      if (anchor.dataset.startosProxyExplorerHidden === 'true') continue
      if (anchor.target !== '_blank') continue

      let target
      try {
        target = new URL(anchor.href, window.location.href)
      } catch {
        continue
      }

      if (target.hostname !== window.location.hostname) continue
      if (!/^\/(?:tx|address)\//.test(target.pathname)) continue

      anchor.dataset.startosProxyExplorerHidden = 'true'
      anchor.setAttribute('aria-hidden', 'true')
      anchor.style.display = 'none'
    }
  }

  const start = () => {
    hideBrokenExplorerLinks(document)
    new MutationObserver((mutations) => {
      for (const mutation of mutations) {
        if (mutation.type === 'attributes') {
          hideBrokenExplorerLinks(mutation.target)
          continue
        }
        for (const node of mutation.addedNodes) {
          if (node instanceof Element) hideBrokenExplorerLinks(node)
        }
      }
    }).observe(document.documentElement, {
      attributes: true,
      attributeFilter: ['href'],
      childList: true,
      subtree: true,
    })
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', start, { once: true })
  } else {
    start()
  }
})()
