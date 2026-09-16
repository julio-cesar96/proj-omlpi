import React from 'react';
import type { Sobre, SobrePayload } from '../../lib/strapi';
import { useSobreForm } from '../../hooks/sobre/useSobreForm';
import { useSobreImage } from '../../hooks/sobre/useSobreImage';
import { SobreModalHeader } from './SobreModalHeader';
import { SobreModalFooter } from './SobreModalFooter';
import { SobreTitleField } from './SobreTitleField';
import { SobreSectionCustomizationFields } from './SobreSectionCustomizationFields';
import { SobreTextField } from './SobreTextField';
import { SobreImageField } from './SobreImageField';
import { SobreLinksSection } from './SobreLinksSection';

interface SobreModalProps {
  open: boolean;
  sobre: Sobre | null; // null = modo criação
  onClose: () => void;
  onSaveDraft: (payload: SobrePayload) => void;
  onPublish: (payload: SobrePayload) => void;
  isSaving: boolean;
  defaultSectionType?: 'sobre' | 'historico';
}

export const SobreModal: React.FC<SobreModalProps> = ({
  open,
  sobre,
  onClose,
  onSaveDraft,
  onPublish,
  isSaving,
  defaultSectionType,
}) => {
  const { form, updateField, linksExpanded, toggleLinksExpanded, isValid, buildPayload } =
    useSobreForm({ open, sobre, defaultSectionType });

  const image = useSobreImage({ open, sobre });

  if (!open) return null;

  const isEditingPublished = sobre !== null && sobre.published_at !== null;

  const handleSaveDraft = () => {
    if (!isValid) return;
    onSaveDraft(buildPayload(image.image, null));
  };

  const handlePublish = () => {
    if (!isValid) return;
    const publishedAt = sobre?.published_at ? sobre.published_at : new Date().toISOString();
    onPublish(buildPayload(image.image, publishedAt));
  };

  return (
    <>
      {/* Overlay */}
      <div
        onClick={onClose}
        style={{
          position: 'fixed',
          inset: 0,
          background: 'rgba(44,44,20,.32)',
          zIndex: 200,
          animation: 'fadeIn .2s ease',
        }}
      />

      {/* Modal */}
      <div
        style={{
          position: 'fixed',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          width: '620px',
          maxWidth: '94vw',
          background: 'var(--card)',
          borderRadius: '16px',
          boxShadow: 'var(--shadow-lg)',
          zIndex: 201,
          display: 'flex',
          flexDirection: 'column',
          maxHeight: '92vh',
          overflow: 'hidden',
          animation: 'slideIn .25s ease',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <SobreModalHeader
          isEditing={sobre !== null}
          isPublished={Boolean(sobre?.published_at)}
          onClose={onClose}
        />

        {/* Body */}
        <div
          style={{
            padding: '20px 24px',
            display: 'flex',
            flexDirection: 'column',
            gap: '18px',
            overflowY: 'auto',
            flex: 1,
            minHeight: 0,
          }}
        >
          <SobreTitleField value={form.title} onChange={(v) => updateField('title', v)} />

          <SobreSectionCustomizationFields
            sectionLabel={form.section_label}
            sectionTitle={form.section_title}
            onSectionLabelChange={(v) => updateField('section_label', v)}
            onSectionTitleChange={(v) => updateField('section_title', v)}
            defaultSectionType={defaultSectionType}
          />

          <SobreTextField value={form.text} onChange={(v) => updateField('text', v)} />

          <SobreImageField
            image={image.image}
            uploading={image.uploading}
            progress={image.progress}
            uploadError={image.uploadError}
            pickerOpen={image.pickerOpen}
            fileInputRef={image.fileInputRef}
            onFileSelect={image.handleFileSelect}
            onRemoveImage={image.handleRemoveImage}
            onOpenPicker={image.openPicker}
            onClosePicker={image.closePicker}
            onSelectFromPicker={image.selectFromPicker}
          />

          <SobreLinksSection
            expanded={linksExpanded}
            onToggle={toggleLinksExpanded}
            link={form.link}
            linkTitle={form.link_title}
            link2={form.link2}
            link2Title={form.link2_title}
            onLinkChange={(v) => updateField('link', v)}
            onLinkTitleChange={(v) => updateField('link_title', v)}
            onLink2Change={(v) => updateField('link2', v)}
            onLink2TitleChange={(v) => updateField('link2_title', v)}
          />
        </div>

        <SobreModalFooter
          isSaving={isSaving}
          uploading={image.uploading}
          isValid={isValid}
          isEditingPublished={isEditingPublished}
          onClose={onClose}
          onSaveDraft={handleSaveDraft}
          onPublish={handlePublish}
        />
      </div>
    </>
  );
};
