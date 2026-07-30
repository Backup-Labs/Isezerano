// API configuration for the frontend
export const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:8000';

export const getMediaUrl = (path: string | null) => {
  if (!path) return '';
  
  // Absolute URLs
  if (path.startsWith('http://') || path.startsWith('https://')) {
    try {
      const url = new URL(path);
      // Rewrite local backend media/static paths to the current API host
      if (
        (url.hostname === '127.0.0.1' || url.hostname === 'localhost') &&
        (url.pathname.startsWith('/media/') || url.pathname.startsWith('/static/'))
      ) {
        return `${API_BASE_URL}${url.pathname}${url.search}`;
      }
    } catch {
      // fall through
    }
    return path;
  }

  // Relative /media or /static (or bare storage path) → Django API host
  if (
    path.startsWith('/media/') ||
    path.startsWith('/static/') ||
    path.startsWith('media/') ||
    path.startsWith('static/')
  ) {
    const cleanPath = path.startsWith('/') ? path : `/${path}`;
    return `${API_BASE_URL}${cleanPath}`;
  }

  // Other relative paths — prefix with API base
  const cleanPath = path.startsWith('/') ? path : `/${path}`;
  return `${API_BASE_URL}${cleanPath}`;
};
