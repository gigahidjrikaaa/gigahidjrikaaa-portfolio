from __future__ import annotations

from typing import Any, Dict, Optional

import cloudinary
import cloudinary.uploader
from fastapi.concurrency import run_in_threadpool

from ..core.config import settings


cloudinary.config(
    cloud_name=settings.CLOUDINARY_CLOUD_NAME,
    api_key=settings.CLOUDINARY_API_KEY,
    api_secret=settings.CLOUDINARY_API_SECRET,
    secure=True,
)


def _ensure_cloudinary_configured() -> None:
    if not (settings.CLOUDINARY_CLOUD_NAME and settings.CLOUDINARY_API_KEY and settings.CLOUDINARY_API_SECRET):
        raise ValueError("Cloudinary configuration is missing. Set CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, and CLOUDINARY_API_SECRET.")


async def upload_image(
    *,
    file_bytes: bytes,
    filename: str,
    folder: Optional[str] = None,
    tags: Optional[list[str]] = None,
) -> Dict[str, Any]:
    _ensure_cloudinary_configured()
    upload_folder = folder or settings.CLOUDINARY_FOLDER

    def _upload() -> Dict[str, Any]:
        return cloudinary.uploader.upload(
            file_bytes,
            folder=upload_folder,
            public_id=None,
            resource_type="image",
            filename=filename,
            use_filename=True,
            unique_filename=True,
            overwrite=False,
            tags=tags or None,
            quality="auto",
            fetch_format="auto",
        )

    return await run_in_threadpool(_upload)


async def delete_image(public_id: str) -> Dict[str, Any]:
    _ensure_cloudinary_configured()

    def _destroy() -> Dict[str, Any]:
        return cloudinary.uploader.destroy(public_id, resource_type="image")

    return await run_in_threadpool(_destroy)
