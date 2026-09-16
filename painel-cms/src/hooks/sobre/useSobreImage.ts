import { useEffect, useRef, useState } from 'react';
import type { Sobre, StrapiFile } from '../../lib/strapi';
import { useUploadSingleFile } from '../useUploadSingleFile';

interface UseSobreImageParams {
  open: boolean;
  sobre: Sobre | null; // null = modo criação
}

export function useSobreImage({ open, sobre }: UseSobreImageParams) {
  const [image, setImage] = useState<StrapiFile | null>(null);
  const [pickerOpen, setPickerOpen] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const { uploadFile, uploading, progress, error: uploadError, setError: setUploadError } =
    useUploadSingleFile({
      allowedTypes: ['image/*'],
      maxMB: 10,
      typeErrorMessage: 'Apenas imagens são permitidas (PNG, JPG, WebP…).',
    });

  // Sincronizar imagem ao abrir
  useEffect(() => {
    if (!open) return;
    setImage(sobre?.image ?? null);
    setUploadError(null);
  }, [open, sobre, setUploadError]);

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      const uploaded = await uploadFile(file);
      setImage(uploaded);
    } catch {
      // Erro já setado em uploadError via hook
    }
    // Reset input so same file can be re-selected
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleRemoveImage = () => setImage(null);

  const openPicker = () => setPickerOpen(true);
  const closePicker = () => setPickerOpen(false);

  const selectFromPicker = (file: StrapiFile) => {
    setImage(file);
    setPickerOpen(false);
  };

  return {
    image,
    uploading,
    progress,
    uploadError,
    pickerOpen,
    fileInputRef,
    handleFileSelect,
    handleRemoveImage,
    openPicker,
    closePicker,
    selectFromPicker,
  };
}
