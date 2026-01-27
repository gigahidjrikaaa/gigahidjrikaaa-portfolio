type GooglePickerDoc = {
  id?: string;
  url?: string;
  name?: string;
};

type GapiLike = {
  load: (apiName: string, callback: () => void) => void;
};

type PickerCallbackData = { action: string; docs?: GooglePickerDoc[] };

type PickerInstanceLike = {
  setVisible: (visible: boolean) => void;
};

type PickerBuilderLike = {
  addView: (view: unknown) => PickerBuilderLike;
  setOAuthToken: (token: string) => PickerBuilderLike;
  setDeveloperKey: (key: string) => PickerBuilderLike;
  setCallback: (cb: (data: PickerCallbackData) => void) => PickerBuilderLike;
  build: () => PickerInstanceLike;
};

type GoogleLike = {
  accounts: {
    oauth2: {
      initTokenClient: (config: {
        client_id: string;
        scope: string;
        callback: (tokenResponse: { access_token?: string }) => void;
      }) => {
        requestAccessToken: (options: { prompt?: string }) => void;
      };
    };
  };
  picker: {
    PickerBuilder: new () => PickerBuilderLike;
    ViewId: { DOCS_IMAGES: unknown; DOCS: unknown };
    Action: { PICKED: string };
  };
};

const GOOGLE_API_SCRIPT = "https://apis.google.com/js/api.js";
const GOOGLE_GSI_SCRIPT = "https://accounts.google.com/gsi/client";

const loadScript = (src: string) =>
  new Promise<void>((resolve, reject) => {
    if (document.querySelector(`script[src=\"${src}\"]`)) {
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

const buildDriveUrl = (doc: GooglePickerDoc) => {
  if (doc.url) return doc.url;
  if (doc.id) return `https://drive.google.com/uc?id=${doc.id}`;
  return "";
};

export const openGoogleDrivePicker = async ({
  clientId,
  apiKey,
  onPick,
  onError,
}: {
  clientId: string;
  apiKey: string;
  onPick: (url: string) => void;
  onError?: (message: string) => void;
}) => {
  try {
    await loadScript(GOOGLE_API_SCRIPT);
    await loadScript(GOOGLE_GSI_SCRIPT);

    const gapi = (window as unknown as { gapi?: GapiLike }).gapi;
    const google = (window as unknown as { google?: GoogleLike }).google;

    if (!gapi || !google) {
      throw new Error("Google APIs are not available.");
    }

    await new Promise<void>((resolve) => gapi.load("picker", resolve));

    const tokenClient = google.accounts.oauth2.initTokenClient({
      client_id: clientId,
      scope: "https://www.googleapis.com/auth/drive.readonly",
      callback: (tokenResponse: { access_token?: string }) => {
        if (!tokenResponse.access_token) {
          onError?.("Unable to authenticate with Google Drive.");
          return;
        }

        const picker = new google.picker.PickerBuilder()
          .addView(google.picker.ViewId.DOCS_IMAGES)
          .addView(google.picker.ViewId.DOCS)
          .setOAuthToken(tokenResponse.access_token)
          .setDeveloperKey(apiKey)
          .setCallback((data: PickerCallbackData) => {
            if (data.action !== google.picker.Action.PICKED) return;
            const doc = data.docs?.[0];
            if (!doc) return;
            const url = buildDriveUrl(doc);
            if (url) onPick(url);
          })
          .build();

        picker.setVisible(true);
      },
    });

    tokenClient.requestAccessToken({ prompt: "consent" });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Google Drive picker failed.";
    onError?.(message);
  }
};
