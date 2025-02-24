import { useState, useCallback } from 'react';
import { uploadToPinata, ipfsToHttpUrl } from 'app/utils/submit-hackathon/pinata';

interface ImageUploaderProps {
  onImageUploaded: (ipfsUrl: string) => void;
}

export function ImageUploader({ onImageUploaded }: ImageUploaderProps) {
  const [isUploading, setIsUploading] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  const handleFileChange = useCallback(async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Créer une URL de prévisualisation
    const objectUrl = URL.createObjectURL(file);
    setPreviewUrl(objectUrl);

    try {
      setIsUploading(true);
      const ipfsUrl = await uploadToPinata(file);
      onImageUploaded(ipfsUrl);
    } catch (error) {
      console.error('Erreur lors du téléversement:', error);
      alert('Erreur lors du téléversement de l\'image');
    } finally {
      setIsUploading(false);
    }

    // Nettoyer l'URL de prévisualisation
    return () => URL.revokeObjectURL(objectUrl);
  }, [onImageUploaded]);

  return (
    <div className="flex flex-col items-center gap-4">
      <div className="relative w-full max-w-md aspect-video border-2 border-dashed border-gray-300 rounded-lg overflow-hidden">
        {previewUrl ? (
          <img
            src={previewUrl}
            alt="Aperçu"
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="flex items-center justify-center h-full">
            <p className="text-gray-500">Cliquez pour téléverser une image</p>
          </div>
        )}
        <input
          type="file"
          accept="image/*"
          onChange={handleFileChange}
          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
          disabled={isUploading}
        />
      </div>
      {isUploading && (
        <div className="text-sm text-blue-600">
          Téléversement en cours...
        </div>
      )}
    </div>
  );
} 