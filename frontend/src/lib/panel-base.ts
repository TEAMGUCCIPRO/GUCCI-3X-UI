/**
 * Builds a subscription base URL from the domain the panel is currently served
 * on. Every deployment (any fork, any custom domain) therefore produces links
 * that match its own address instead of a hardcoded host.
 */
export function panelBase(path = '/sub/'): string {
  const suffix = path.startsWith('/') ? path : `/${path}`;
  if (typeof window === 'undefined' || !window.location?.origin) {
    return suffix;
  }
  return `${window.location.origin.replace(/\/$/, '')}${suffix}`;
}

export default panelBase;
