// lib/access.js
export function isImagePrivate(imageRow, albumRow) {
  if (imageRow?.override_public === 1) return false;
  if (albumRow?.password_hash) return true;
  return imageRow?.is_private === 1;
}