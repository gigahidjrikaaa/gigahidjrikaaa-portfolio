const GOOGLE_DRIVE_HOSTS = new Set(['drive.google.com', 'www.drive.google.com']);

export const extractGoogleDriveFileId = (rawUrl: string): string | null => {
  try {
    const url = new URL(rawUrl.trim());
    if (!GOOGLE_DRIVE_HOSTS.has(url.hostname.toLowerCase())) {
      return null;
    }

    const queryId = url.searchParams.get('id');
    if (queryId) {
      return queryId;
    }

    const segments = url.pathname.split('/').filter(Boolean);
    const fileIndex = segments.indexOf('file');

    // Supports /file/d/<id>/view and similar variants.
    if (fileIndex >= 0 && segments[fileIndex + 1] === 'd' && segments[fileIndex + 2]) {
      return segments[fileIndex + 2];
    }

    return null;
  } catch {
    return null;
  }
};

export const toDirectDownloadUrl = (rawUrl?: string | null): string | undefined => {
  const trimmed = rawUrl?.trim();
  if (!trimmed) {
    return undefined;
  }

  const fileId = extractGoogleDriveFileId(trimmed);
  if (!fileId) {
    return trimmed;
  }

  return `https://drive.google.com/uc?export=download&id=${encodeURIComponent(fileId)}`;
};
