// API configuration for the frontend
export const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:8000';

export const getMediaUrl = (path: string | null) => {
  if (!path) return '';
  
  // If it's a relative path, just append it to API_BASE_URL
  if (!path.startsWith('http://') && !path.startsWith('https://')) {
    const cleanPath = path.startsWith('/') ? path : `/${path}`;
    return `${API_BASE_URL}${cleanPath}`;
  }

  // If it's an absolute URL but points to localhost/127.0.0.1 (local backend) or the backend server domain,
  // we should convert it to use the dynamic API_BASE_URL.
  // This handles the case where the backend DB has stored/generated local URLs, or we have HTTP/HTTPS mismatch.
  try {
    const url = new URL(path);
    if (url.pathname.startsWith('/media/') || url.pathname.startsWith('/static/')) {
      return `${API_BASE_URL}${url.pathname}${url.search}`;
    }
  } catch (e) {
    // Fallback if URL parsing fails
  }

  // If it's an external URL (e.g. unsplash), return it as-is
  return path;
};
