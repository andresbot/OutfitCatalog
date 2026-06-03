import { Platform } from 'react-native';

export async function uploadToCloudinary(uri: string): Promise<string> {
  const cloudName = process.env.EXPO_PUBLIC_CLOUDINARY_CLOUD_NAME;
  const uploadPreset = process.env.EXPO_PUBLIC_CLOUDINARY_UPLOAD;

  if (!cloudName || !uploadPreset) {
    throw new Error('Cloudinary no configurado. Verifica EXPO_PUBLIC_CLOUDINARY_CLOUD_NAME y EXPO_PUBLIC_CLOUDINARY_UPLOAD en el .env');
  }

  const formData = new FormData();

  if (Platform.OS === 'web') {
    const blobResponse = await fetch(uri);
    const blob = await blobResponse.blob();
    formData.append('file', new File([blob], 'upload.jpg', { type: blob.type || 'image/jpeg' }));
  } else {
    formData.append('file', { uri, type: 'image/jpeg', name: 'upload.jpg' } as any);
  }

  formData.append('upload_preset', uploadPreset);

  const url = `https://api.cloudinary.com/v1_1/${cloudName}/image/upload`;
  console.log('[Cloudinary] POST', url, '| preset:', uploadPreset);

  let response: Response;
  try {
    response = await fetch(url, { method: 'POST', body: formData as unknown as BodyInit_ });
  } catch (networkError: any) {
    throw new Error('No se pudo conectar a Cloudinary: ' + (networkError?.message ?? 'error de red'));
  }

  const responseText = await response.text().catch(() => '');

  if (!response.ok) {
    console.error('[Cloudinary] Error', response.status, responseText);
    let detail = responseText;
    try {
      const parsed = JSON.parse(responseText) as { error?: { message?: string } };
      detail = parsed?.error?.message ?? responseText;
    } catch { /* raw text */ }

    if (response.status === 401) {
      throw new Error(`Cloudinary 401: "${detail}". Verifica que el cloud name sea correcto y el preset "${uploadPreset}" esté en modo Unsigned.`);
    }
    if (response.status === 400) {
      throw new Error(`Cloudinary 400: "${detail}".`);
    }
    throw new Error(`Cloudinary ${response.status}: ${detail}`);
  }

  const data = JSON.parse(responseText) as { secure_url: string };
  return data.secure_url;
}

export async function uploadBase64ToCloudinary(base64: string): Promise<string> {
  const cloudName = process.env.EXPO_PUBLIC_CLOUDINARY_CLOUD_NAME;
  const uploadPreset = process.env.EXPO_PUBLIC_CLOUDINARY_UPLOAD;

  if (!cloudName || !uploadPreset) {
    throw new Error('Cloudinary no configurado. Verifica EXPO_PUBLIC_CLOUDINARY_CLOUD_NAME y EXPO_PUBLIC_CLOUDINARY_UPLOAD en el .env');
  }

  const dataUri = base64.startsWith('data:') ? base64 : `data:image/jpeg;base64,${base64}`;

  const url = `https://api.cloudinary.com/v1_1/${cloudName}/image/upload`;
  const body = new URLSearchParams({ file: dataUri, upload_preset: uploadPreset });

  let response: Response;
  try {
    response = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: body.toString(),
    });
  } catch (networkError: any) {
    throw new Error('No se pudo conectar a Cloudinary: ' + (networkError?.message ?? 'error de red'));
  }

  const responseText = await response.text().catch(() => '');

  if (!response.ok) {
    let detail = responseText;
    try {
      const parsed = JSON.parse(responseText) as { error?: { message?: string } };
      detail = parsed?.error?.message ?? responseText;
    } catch { /* raw text */ }
    throw new Error(`Cloudinary ${response.status}: ${detail}`);
  }

  const data = JSON.parse(responseText) as { secure_url: string };
  return data.secure_url;
}
