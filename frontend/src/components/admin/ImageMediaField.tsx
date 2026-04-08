"use client";

import { useRef, useState } from "react";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/components/ui/toast";
import { adminApi } from "@/services/api";
import { openMediaLibrary } from "@/lib/cloudinaryWidget";
import { openGoogleDrivePicker } from "@/lib/googleDrivePicker";
import { Cloud, Loader2, Trash2, Upload, X } from "lucide-react";

interface ImageMediaFieldProps {
  id: string;
  label: string;
  value: string;
  onChange: (nextValue: string) => void;
  previewAlt: string;
  placeholder?: string;
  helperText?: string;
  uploadFolder?: string;
  required?: boolean;
  buttonSize?: "default" | "sm" | "lg" | "icon";
  previewWidth?: number;
  previewHeight?: number;
  previewTitle?: string;
  previewHint?: string;
  previewContainerClassName?: string;
  previewImageClassName?: string;
  containerClassName?: string;
}

type ManagedAssetRef = {
  id: number;
  url: string;
};

const ImageMediaField: React.FC<ImageMediaFieldProps> = ({
  id,
  label,
  value,
  onChange,
  previewAlt,
  placeholder = "https://...",
  helperText,
  uploadFolder,
  required = false,
  buttonSize = "sm",
  previewWidth = 60,
  previewHeight = 60,
  previewTitle = "Image preview",
  previewHint = "You can paste an image directly from your clipboard.",
  previewContainerClassName,
  previewImageClassName,
  containerClassName,
}) => {
  const { toast } = useToast();
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isDragOver, setIsDragOver] = useState(false);
  const [managedAsset, setManagedAsset] = useState<ManagedAssetRef | null>(null);

  const cloudName = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME || "";
  const cloudApiKey = process.env.NEXT_PUBLIC_CLOUDINARY_API_KEY || "";
  const googleClientId = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID || "";
  const googleApiKey = process.env.NEXT_PUBLIC_GOOGLE_API_KEY || "";

  const toNamedFile = (file: File) => {
    if (file.name) return file;
    const extension = (file.type.split("/")[1] || "png").replace("jpeg", "jpg");
    return new File([file], `clipboard-${Date.now()}.${extension}`, {
      type: file.type || "image/png",
    });
  };

  const uploadFile = async (file: File, source: "upload" | "paste" | "drop") => {
    try {
      setIsUploading(true);
      const normalizedFile = toNamedFile(file);
      const uploaded = await adminApi.uploadMediaAsset(normalizedFile, {
        title: normalizedFile.name,
        folder: uploadFolder,
      });
      setManagedAsset({ id: uploaded.id, url: uploaded.url });
      onChange(uploaded.url);
      toast({
        title: "Image uploaded",
        description:
          source === "paste"
            ? "Pasted image uploaded to Cloudinary."
            : source === "drop"
              ? "Dropped image uploaded to Cloudinary."
            : "Image uploaded to Cloudinary.",
        variant: "success",
      });
    } catch (error) {
      const detail = error instanceof Error ? error.message : "Could not upload image.";
      toast({
        title: "Upload failed",
        description: detail,
        variant: "error",
      });
    } finally {
      setIsUploading(false);
    }
  };

  const handlePickerUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      await uploadFile(file, "upload");
    }
    event.target.value = "";
  };

  const handlePaste = (event: React.ClipboardEvent<HTMLInputElement>) => {
    const imageItem = Array.from(event.clipboardData.items).find((item) =>
      item.type.startsWith("image/")
    );
    if (!imageItem) return;
    const file = imageItem.getAsFile();
    if (!file) return;
    event.preventDefault();
    void uploadFile(file, "paste");
  };

  const handleDragOver = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    event.dataTransfer.dropEffect = "copy";
    if (!isDragOver) {
      setIsDragOver(true);
    }
  };

  const handleDragLeave = () => {
    setIsDragOver(false);
  };

  const handleDrop = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    setIsDragOver(false);
    const file = Array.from(event.dataTransfer.files).find((item) => item.type.startsWith("image/"));
    if (!file) {
      toast({
        title: "Invalid file",
        description: "Drop an image file (PNG, JPG, WEBP, GIF).",
        variant: "error",
      });
      return;
    }
    void uploadFile(file, "drop");
  };

  const openCloudinaryPicker = async () => {
    if (!cloudName || !cloudApiKey) {
      toast({
        title: "Cloudinary not connected",
        description:
          "Set NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME and NEXT_PUBLIC_CLOUDINARY_API_KEY.",
        variant: "error",
      });
      return;
    }
    try {
      await openMediaLibrary(
        {
          cloud_name: cloudName,
          api_key: cloudApiKey,
          multiple: false,
        },
        (assets) => {
          const asset = assets?.[0];
          if (asset?.secure_url || asset?.url) {
            setManagedAsset(null);
            onChange(asset.secure_url || asset.url || "");
          }
        }
      );
    } catch (error) {
      const detail = error instanceof Error ? error.message : "Unable to open Cloudinary picker.";
      toast({
        title: "Cloudinary error",
        description: detail,
        variant: "error",
      });
    }
  };

  const openGooglePicker = () => {
    if (!googleClientId || !googleApiKey) {
      toast({
        title: "Google Drive not connected",
        description: "Set NEXT_PUBLIC_GOOGLE_CLIENT_ID and NEXT_PUBLIC_GOOGLE_API_KEY.",
        variant: "error",
      });
      return;
    }

    void openGoogleDrivePicker({
      clientId: googleClientId,
      apiKey: googleApiKey,
      onPick: (url) => {
        setManagedAsset(null);
        onChange(url);
      },
      onError: (message) =>
        toast({
          title: "Google Drive error",
          description: message,
          variant: "error",
        }),
    });
  };

  const resolveMediaAssetId = async (url: string): Promise<number | null> => {
    if (managedAsset?.url === url) {
      return managedAsset.id;
    }

    const response = await adminApi.getMediaAssets({ q: url, page_size: 50 });
    const exactMatch = response.items.find((item) => item.url === url);
    return exactMatch?.id ?? null;
  };

  const handleClear = () => {
    setManagedAsset(null);
    onChange("");
  };

  const handleDelete = async () => {
    if (!value) return;

    const shouldDelete = window.confirm(
      "Delete this image from Cloudinary and remove it from this field?"
    );
    if (!shouldDelete) return;

    try {
      setIsDeleting(true);
      const assetId = await resolveMediaAssetId(value);

      if (assetId) {
        await adminApi.deleteMediaAsset(assetId);
        toast({
          title: "Image deleted",
          description: "Image was removed from Cloudinary and cleared from this field.",
          variant: "success",
        });
      } else {
        toast({
          title: "No managed media record found",
          description: "Field was cleared, but no matching media record was found to delete.",
          variant: "info",
        });
      }

      setManagedAsset(null);
      onChange("");
    } catch (error) {
      const detail = error instanceof Error ? error.message : "Could not delete image.";
      toast({
        title: "Delete failed",
        description: detail,
        variant: "error",
      });
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className={containerClassName}>
      <Label htmlFor={id} className="text-gray-700">
        {label}
      </Label>
      <Input
        id={id}
        value={value}
        onChange={(event) => {
          const nextValue = event.target.value;
          if (managedAsset?.url !== nextValue) {
            setManagedAsset(null);
          }
          onChange(nextValue);
        }}
        onPaste={handlePaste}
        className="mt-1"
        placeholder={placeholder}
        required={required}
      />

      <div className="mt-2 rounded-lg border border-gray-200 bg-gray-50 p-3">
        <div className="flex flex-wrap items-center gap-2">
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={handlePickerUpload}
          />
          <Button
            type="button"
            variant="outline"
            size={buttonSize}
            className="bg-white"
            onClick={() => fileInputRef.current?.click()}
            disabled={isUploading || isDeleting}
          >
            {isUploading ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Uploading...
              </>
            ) : (
              <>
                <Upload className="h-4 w-4" />
                Upload
              </>
            )}
          </Button>
          <Button
            type="button"
            variant="outline"
            size={buttonSize}
            className="bg-white"
            onClick={openCloudinaryPicker}
            disabled={isUploading || isDeleting}
          >
            <Cloud className="h-4 w-4" />
            Cloudinary
          </Button>
          <Button
            type="button"
            variant="outline"
            size={buttonSize}
            className="bg-white"
            onClick={openGooglePicker}
            disabled={isUploading || isDeleting}
          >
            Google Drive
          </Button>
          <Button
            type="button"
            variant="ghost"
            size={buttonSize}
            onClick={handleClear}
            disabled={!value || isUploading || isDeleting}
          >
            <X className="h-4 w-4" />
            Clear
          </Button>
          <Button
            type="button"
            variant="destructive"
            size={buttonSize}
            onClick={() => {
              void handleDelete();
            }}
            disabled={!value || isUploading || isDeleting}
          >
            {isDeleting ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Deleting...
              </>
            ) : (
              <>
                <Trash2 className="h-4 w-4" />
                Delete
              </>
            )}
          </Button>
        </div>

        <div
          className={`mt-2 rounded-md border border-dashed px-3 py-2 text-xs transition ${
            isDragOver
              ? "border-primary bg-primary/5 text-primary"
              : "border-gray-300 text-gray-500"
          }`}
          onDragOver={handleDragOver}
          onDragEnter={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
        >
          Drag and drop an image file here to upload.
        </div>
      </div>

      <p className="mt-1 text-xs text-gray-500">
        Tip: focus the URL field and press Ctrl+V to paste from clipboard.
      </p>
      {helperText ? <p className="mt-1 text-xs text-gray-400">{helperText}</p> : null}

      {value ? (
        <div
          className={
            previewContainerClassName ||
            "mt-3 flex items-center gap-3 rounded-lg border border-gray-200 bg-gray-50 p-3"
          }
        >
          <Image
            src={value}
            alt={previewAlt}
            width={previewWidth}
            height={previewHeight}
            unoptimized
            className={previewImageClassName || "h-14 w-14 rounded-md object-cover"}
          />
          <div>
            <p className="text-xs font-semibold text-gray-700">{previewTitle}</p>
            <p className="text-xs text-gray-500">{previewHint}</p>
          </div>
        </div>
      ) : null}
    </div>
  );
};

export default ImageMediaField;
