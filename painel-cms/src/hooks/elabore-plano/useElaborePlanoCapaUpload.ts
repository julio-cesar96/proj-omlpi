import { useEffect, useRef, useState } from 'react';
import type { ElaborePlano, StrapiFile } from '../../lib/strapi';
import { useUploadSingleFile } from '../useUploadSingleFile';

export function useElaborePlanoCapaUpload(data: ElaborePlano | undefined) {
  const [file, setFile] = useState<StrapiFile | null>(null);
  const [pickerOpen, setPickerOpen] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const { uploadFile, uploading, progress, error, setError } = useUploadSingleFile({
    allowedTypes: ['image/*'],
    maxMB: 10,
    typeErrorMessage: 'Apenas imagens são permitidas (PNG, JPG, WebP…).',
  });

  // Preencher a partir dos dados do Strapi
  useEffect(() => {
    if (!data) return;
    setFile(data.capa ?? null);
  }, [data]);

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const selected = e.target.files?.[0];
    if (!selected) return;
    try {
      const uploaded = await uploadFile(selected);
      setFile(uploaded);
    } catch {
      // erro mantido no hook via uploadError
    }
    if (inputRef.current) inputRef.current.value = '';
  };

  const handleRemove = () => setFile(null);
  const openPicker = () => setPickerOpen(true);
  const closePicker = () => setPickerOpen(false);
  const selectFromPicker = (picked: StrapiFile) => {
    setFile(picked);
    setPickerOpen(false);
  };

  return {
    file,
    uploading,
    progress,
    uploadError: error,
    setUploadError: setError,
    pickerOpen,
    inputRef,
    handleFileSelect,
    handleRemove,
    openPicker,
    closePicker,
    selectFromPicker,
  };
}
