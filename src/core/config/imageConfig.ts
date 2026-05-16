export function resolveImageUrl(imagePath: string | null | undefined): string | null {
  if (imagePath == null) return null;
  const trimmed = imagePath.trim();
  if (trimmed === '') return null;
  if (trimmed.startsWith('http://') || trimmed.startsWith('https://')) return trimmed;

  const cloudName = process.env.EXPO_PUBLIC_CLOUDINARY_CLOUD_NAME;
  if (cloudName && cloudName.trim() !== '') {
    const id = trimmed.replace(/^\/+/, '');
    return `https://res.cloudinary.com/${cloudName}/image/upload/${id}`;
  }

  return trimmed;
}

export default resolveImageUrl;
