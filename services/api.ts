import { AnalysisResult } from '../types';

export const analyzeCode = async (
  apiUrl: string,
  code?: string,
  file?: File
): Promise<AnalysisResult> => {
  // 1. Prepare Headers
  // 'ngrok-skip-browser-warning' is required to bypass the interstitial page on free ngrok accounts
  const headers: Record<string, string> = {
    'ngrok-skip-browser-warning': 'true',
  };

  let body: FormData | string;

  if (file) {
    const formData = new FormData();
    formData.append('file', file);
    body = formData;
    // Note: Do NOT set Content-Type for FormData; the browser sets it with the correct boundary
  } else if (code) {
    body = JSON.stringify({ code });
    headers['Content-Type'] = 'application/json';
  } else {
    throw new Error('No input provided');
  }

  // 2. URL Processing
  let targetUrl = apiUrl.trim();

  // If the user hasn't provided http/s, assume https
  if (!targetUrl.startsWith('http://') && !targetUrl.startsWith('https://')) {
    targetUrl = `https://${targetUrl}`;
  }

  // Check for Mixed Content (HTTPS -> HTTP)
  const isHttps = typeof window !== 'undefined' && window.location.protocol === 'https:';
  if (isHttps && targetUrl.startsWith('http://') && !targetUrl.includes('localhost') && !targetUrl.includes('127.0.0.1')) {
     throw new Error(
        `Security Block: You are on a secure site (HTTPS) but trying to connect to an insecure backend (${targetUrl}).\n\nBrowsers block this. Please use your HTTPS ngrok URL.`
      );
  }

  // Ensure endpoint is correct
  targetUrl = targetUrl.replace(/\/+$/, ''); // Remove trailing slashes
  if (!targetUrl.endsWith('/analyze')) {
    targetUrl = `${targetUrl}/analyze`;
  }

  // 3. Execution
  try {
    const response = await fetch(targetUrl, {
      method: 'POST',
      headers,
      body,
    });

    if (!response.ok) {
      // Try to parse error message from JSON, fallback to status text, fallback to HTML (if ngrok warning)
      const contentType = response.headers.get('content-type');
      if (contentType && contentType.includes('application/json')) {
         const errorData = await response.json();
         throw new Error(errorData.error || `Server Error: ${response.status} ${response.statusText}`);
      } else {
         // Likely HTML from ngrok warning or 404/500 page
         throw new Error(`Server returned status ${response.status} (${response.statusText}).\n\nIf you are using ngrok, this might be the "Visit Site" warning page. Please click "Open Tunnel & Verify" in Settings to authorize your browser.`);
      }
    }

    const data = await response.json();
    return data as AnalysisResult;

  } catch (error: any) {
    console.error('Fetch error details:', error);

    // If it's the security error we threw earlier, rethrow it as is
    if (error.message && error.message.includes('Security Block')) {
        throw error;
    }

    // Generic network error (Failed to fetch)
    if (error.message === 'Failed to fetch' || error.name === 'TypeError') {
       throw new Error(
         `Connection failed to: "${targetUrl}"\n\nTroubleshooting:\n1. Is the backend running?\n2. Is ngrok running?\n3. Did you click "Open Tunnel & Verify" to bypass the ngrok warning?`
       );
    }

    // Add target URL to context if missing
    if (error.message && !error.message.includes(targetUrl) && !error.message.includes('http')) {
        error.message += ` (Target: ${targetUrl})`;
    }

    throw error;
  }
};