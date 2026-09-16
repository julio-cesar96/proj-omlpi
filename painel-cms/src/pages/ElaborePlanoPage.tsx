import React, { useEffect, useState } from 'react';
import { useElaborePlano } from '../hooks/elabore-plano/useElaborePlano';
import { useElaborePlanoForm } from '../hooks/elabore-plano/useElaborePlanoForm';
import { useElaborePlanoCapaUpload } from '../hooks/elabore-plano/useElaborePlanoCapaUpload';
import { useElaborePlanoArquivoUpload } from '../hooks/elabore-plano/useElaborePlanoArquivoUpload';
import { Toast } from '../components/ui/Toast';
import { ElaborePlanoHeader } from '../components/elabore-plano/ElaborePlanoHeader';
import { ElaborePlanoLoadingSkeleton } from '../components/elabore-plano/ElaborePlanoLoadingSkeleton';
import { ElaborePlanoErrorState } from '../components/elabore-plano/ElaborePlanoErrorState';
import { ElaborePlanoTextInputField } from '../components/elabore-plano/ElaborePlanoTextInputField';
import { ElaborePlanoDescricaoField } from '../components/elabore-plano/ElaborePlanoDescricaoField';
import { ElaborePlanoCapaField } from '../components/elabore-plano/ElaborePlanoCapaField';
import { ElaborePlanoImagePositionField } from '../components/elabore-plano/ElaborePlanoImagePositionField';
import { ElaborePlanoArquivoField } from '../components/elabore-plano/ElaborePlanoArquivoField';
import { ElaborePlanoSaveButton } from '../components/elabore-plano/ElaborePlanoSaveButton';
import type { ElaborePlanoPayload } from '../lib/strapi';

export const ElaborePlanoPage: React.FC = () => {
  const { data, isLoading, isError, refetch, saveElaborePlano, isSaving, saveError } =
    useElaborePlano();

  const { form, updateField } = useElaborePlanoForm(data);
  const capa = useElaborePlanoCapaUpload(data);
  const arquivo = useElaborePlanoArquivoUpload(data);

  const [toast, setToast] = useState<{ visible: boolean; message: string }>({
    visible: false,
    message: '',
  });

  // Exibir erros de salvamento em toast
  useEffect(() => {
    if (saveError) {
      setToast({ visible: true, message: saveError.message });
    }
  }, [saveError]);

  const handleSave = async () => {
    const payload: ElaborePlanoPayload = {
      titulo_secao: form.tituloSecao.trim() || null,
      titulo_guia: form.tituloGuia.trim() || null,
      descricao: form.descricao.trim() || null,
      capa: capa.file ? capa.file.id : null,
      arquivo: arquivo.file ? arquivo.file.id : null,
      image_position: form.imagePosition,
      published_at: data?.published_at || new Date().toISOString(),
    };

    try {
      await saveElaborePlano(payload);
      setToast({ visible: true, message: 'Elabore o Plano atualizado com sucesso!' });
    } catch {
      // Tratado via useEffect (saveError)
    }
  };

  if (isLoading) return <ElaborePlanoLoadingSkeleton />;
  if (isError) return <ElaborePlanoErrorState onRetry={() => refetch()} />;

  const saveDisabled = isSaving || capa.uploading || arquivo.uploading;

  return (
    <>
      <div style={{ padding: '40px 48px', maxWidth: '720px' }}>
        <ElaborePlanoHeader />

        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          <ElaborePlanoTextInputField
            id="titulo-secao"
            label="Título da Seção"
            value={form.tituloSecao}
            onChange={(value) => updateField('tituloSecao', value)}
            disabled={isSaving}
            placeholder="Ex: Elabore o plano do seu município"
            helperText="Título exibido no cabeçalho da seção na home."
          />

          <ElaborePlanoTextInputField
            id="titulo-guia"
            label="Título do Guia"
            value={form.tituloGuia}
            onChange={(value) => updateField('tituloGuia', value)}
            disabled={isSaving}
            placeholder="Ex: Guia para elaboração de Planos Intersetoriais para a Primeira Infância"
            helperText="Título em negrito exibido acima da descrição do guia."
          />

          <ElaborePlanoDescricaoField
            value={form.descricao}
            onChange={(value) => updateField('descricao', value)}
            disabled={isSaving}
          />

          <ElaborePlanoCapaField
            file={capa.file}
            uploading={capa.uploading}
            progress={capa.progress}
            uploadError={capa.uploadError}
            pickerOpen={capa.pickerOpen}
            inputRef={capa.inputRef}
            disabled={isSaving}
            onFileSelect={capa.handleFileSelect}
            onRemove={capa.handleRemove}
            onOpenPicker={capa.openPicker}
            onClosePicker={capa.closePicker}
            onSelectFromPicker={capa.selectFromPicker}
          />

          <ElaborePlanoImagePositionField
            value={form.imagePosition}
            onChange={(value) => updateField('imagePosition', value)}
            disabled={isSaving}
          />

          <ElaborePlanoArquivoField
            file={arquivo.file}
            uploading={arquivo.uploading}
            progress={arquivo.progress}
            uploadError={arquivo.uploadError}
            pickerOpen={arquivo.pickerOpen}
            inputRef={arquivo.inputRef}
            disabled={isSaving}
            onFileSelect={arquivo.handleFileSelect}
            onRemove={arquivo.handleRemove}
            onOpenPicker={arquivo.openPicker}
            onClosePicker={arquivo.closePicker}
            onSelectFromPicker={arquivo.selectFromPicker}
          />

          <ElaborePlanoSaveButton
            onClick={handleSave}
            disabled={saveDisabled}
            isSaving={isSaving}
          />
        </div>
      </div>

      <Toast
        visible={toast.visible}
        message={toast.message}
        onClose={() => setToast((t) => ({ ...t, visible: false }))}
      />
    </>
  );
};
