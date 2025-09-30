// Lightweight HTML sanitizer/enhancer for rendering trusted-but-uncontrolled HTML
// - Removes script/style and dangerous tags
// - Strips inline event handlers and javascript: URLs
// - Normalizes anchors to open in new tab with rel protections
// - Adds lazy loading to images

export function sanitizeHtml(input?: string | null): string {
  if (!input || typeof input !== 'string') return '';

  // Fast-path: ignore obviously empty/whitespace
  const html = input.trim();
  if (!html) return '';

  try {
    // Use browser DOMParser when available to handle HTML safely
    const parser = new DOMParser();

    // If content looks like it has been entity-encoded (e.g. &lt;p&gt;), decode once first
    const looksEncoded = /&lt;\/?[a-zA-Z]/.test(html) || /&amp;lt;\/?[a-zA-Z]/.test(html);
    const decodedOnce = looksEncoded ? decodeEntities(html) : html;

    const doc = parser.parseFromString(decodedOnce, 'text/html');

    // Remove potentially dangerous elements entirely
    const forbiddenTags = ['script', 'style', 'link', 'meta', 'object', 'embed', 'form'];
    forbiddenTags.forEach(tag => {
      doc.querySelectorAll(tag).forEach(el => el.remove());
    });

    // Optionally allow iframe/video but limit attributes (or remove iframes for safety)
    // Here we remove iframes to be conservative for now
    doc.querySelectorAll('iframe').forEach(el => el.remove());

    // Strip inline event handlers and javascript: URLs
    const walk = (root: Element | Document) => {
      const all = root.querySelectorAll('*');
      all.forEach((el) => {
        // Remove on* attributes
        for (const attr of Array.from(el.attributes)) {
          if (attr.name.toLowerCase().startsWith('on')) {
            el.removeAttribute(attr.name);
          }
          // Drop javascript: in href/src
          if ((attr.name === 'href' || attr.name === 'src') && /^\s*javascript:/i.test(attr.value)) {
            el.removeAttribute(attr.name);
          }
        }

        // Normalize anchors
        if (el.tagName.toLowerCase() === 'a') {
          const a = el as HTMLAnchorElement;
          if (a.getAttribute('href')) {
            a.setAttribute('target', '_blank');
            a.setAttribute('rel', 'nofollow noopener noreferrer');
          }
        }

        // Images: ensure responsive and lazy
        if (el.tagName.toLowerCase() === 'img') {
          const img = el as HTMLImageElement;
          if (!img.getAttribute('loading')) img.setAttribute('loading', 'lazy');
          img.removeAttribute('srcset'); // avoid large bandwidth surprises
        }
      });
    };

    walk(doc);

    // Return sanitized HTML string
    return doc.body.innerHTML;
  } catch {
    // Fallback: very conservative regex-based cleanup
    return input
      .replace(/<\/(?:script|style)[^>]*>/gi, '')
      .replace(/<(?:script|style)[^>]*>[\s\S]*?<\/(?:script|style)>/gi, '')
      .replace(/ on[a-z]+=\"[^\"]*\"/gi, '')
      .replace(/ on[a-z]+='[^']*'/gi, '')
      .replace(/\s(href|src)\s*=\s*\"\s*javascript:[^\"]*\"/gi, '')
      .replace(/\s(href|src)\s*=\s*'\s*javascript:[^']*'/gi, '');
  }
}

// Decode a single layer of HTML entities like &lt; &gt; &amp; etc. using the DOM
function decodeEntities(s: string): string {
  try {
    const el = document.createElement('textarea');
    el.innerHTML = s;
    return el.value;
  } catch {
    return s
      .replace(/&lt;/g, '<')
      .replace(/&gt;/g, '>')
      .replace(/&amp;/g, '&')
      .replace(/&quot;/g, '"')
      .replace(/&#39;/g, "'");
  }
}
