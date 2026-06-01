export interface TryOnService {
  /**
   * @param userPhotoUrl URL pública de la foto del usuario (Cloudinary)
   * @param garmentImageUrl URL pública de la imagen de la prenda (Cloudinary)
   * @returns URL de la imagen generada por la IA
   */
  tryOn(userPhotoUrl: string, garmentImageUrl: string): Promise<string>;
}
