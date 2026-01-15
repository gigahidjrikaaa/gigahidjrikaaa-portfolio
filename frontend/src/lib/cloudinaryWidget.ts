type CloudinaryUploadResult = {
  secure_url?: string;
  url?: string;
  public_id?: string;
  width?: number;
  height?: number;
  bytes?: number;
};

type MediaLibraryAsset = {
  secure_url?: string;
  url?: string;
  public_id?: string;
  width?: number;
  height?: number;
  bytes?: number;
  folder?: string;
  tags?: string[];
};

declare global {
  interface Window {
    cloudinary?: {
      createUploadWidget: (
        options: Record<string, unknown>,
        callback: (error: unknown, result?: CloudinaryWidgetResult) => void
      ) => { open: () => void };
      createMediaLibrary: (
        options: Record<string, unknown>,
        handlers: { insertHandler: (data: { assets: MediaLibraryAsset[] }) => void }
      ) => { show: () => void };
    };
  }
}

const loadScript = (src: string) =>
  new Promise<void>((resolve, reject) => {
    if (document.querySelector(`script[src="${src}"]`)) {
      resolve();
      return;
    }
    const script = document.createElement("script");
    script.src = src;
    script.async = true;
    script.onload = () => resolve();
    script.onerror = () => reject(new Error(`Failed to load ${src}`));
    document.body.appendChild(script);
  });

export const ensureUploadWidget = async () => {
  await loadScript("https://widget.cloudinary.com/v2.0/global/all.js");
  if (!window.cloudinary) {
    throw new Error("Cloudinary widget not available");
  }
  return window.cloudinary;
};

export const ensureMediaLibrary = async () => {
  await loadScript("https://media-library.cloudinary.com/global/all.js");
  if (!window.cloudinary) {
    throw new Error("Cloudinary media library not available");
  }
  return window.cloudinary;
};

type CloudinaryWidgetResult = {
  event?: string;
  info?: CloudinaryUploadResult;
};

export const openUploadWidget = async (options: Record<string, unknown>, onSuccess: (result: CloudinaryUploadResult) => void) => {
  const cloudinary = await ensureUploadWidget();
  const widget = cloudinary.createUploadWidget(options, (error: unknown, result?: CloudinaryWidgetResult) => {
    if (!error && result?.event === "success") {
      if (result.info) {
        onSuccess(result.info);
      }
    }
  });
  widget.open();
};

export const openMediaLibrary = async (
  options: Record<string, unknown>,
  onInsert: (assets: MediaLibraryAsset[]) => void
) => {
  const cloudinary = await ensureMediaLibrary();
  const mediaLibrary = cloudinary.createMediaLibrary(
    options,
    {
      insertHandler: (data: { assets: MediaLibraryAsset[] }) => {
        onInsert(data.assets || []);
      },
    }
  );
  mediaLibrary.show();
};

export type { CloudinaryUploadResult, MediaLibraryAsset };
