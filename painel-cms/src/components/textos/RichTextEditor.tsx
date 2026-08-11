import React, { useEffect, useState } from 'react';
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Link from '@tiptap/extension-link';
import Image from '@tiptap/extension-image';
import Underline from '@tiptap/extension-underline';
import { LinkImageModal } from './LinkImageModal';

interface RichTextEditorProps {
  content: string;
  onChange: (html: string) => void;
}

export const RichTextEditor: React.FC<RichTextEditorProps> = ({ content, onChange }) => {
  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        heading: {
          levels: [1, 2],
        },
      }),
      Underline,
      Link.configure({
        openOnClick: false,
        HTMLAttributes: {
          class: 'editor-link',
        },
      }),
      Image.configure({
        HTMLAttributes: {
          class: 'editor-image',
        },
      }),
    ],
    content: content,
    onUpdate: ({ editor }) => {
      onChange(editor.getHTML());
    },
  });

  // Sincronizar conteúdo se mudar de fora (ex: ao carregar dados do banco)
  useEffect(() => {
    if (editor && content !== editor.getHTML()) {
      editor.commands.setContent(content);
    }
  }, [content, editor]);

  if (!editor) {
    return (
      <div style={{ padding: '20px', color: 'var(--text-soft)', fontSize: '14px' }}>
        Carregando editor...
      </div>
    );
  }

  // Estados para controle dos modais de URL e Imagem
  const [modalOpen, setModalOpen] = useState(false);
  const [modalType, setModalType] = useState<'link' | 'image'>('link');
  const [modalDefaultValue, setModalDefaultValue] = useState('');

  const handleLinkClick = () => {
    const previousUrl = editor.getAttributes('link').href || '';
    setModalType('link');
    setModalDefaultValue(previousUrl);
    setModalOpen(true);
  };

  const handleImageClick = () => {
    setModalType('image');
    setModalDefaultValue('');
    setModalOpen(true);
  };

  const handleModalSubmit = (url: string) => {
    setModalOpen(false);

    if (modalType === 'link') {
      if (url === '') {
        editor.chain().focus().extendMarkRange('link').unsetLink().run();
        return;
      }
      
      const { from, to } = editor.state.selection;
      if (from === to) {
        // Se não houver seleção, inserir o próprio link como texto e aplicar o link
        editor.chain().focus().insertContent(`<a href="${url}">${url}</a>`).run();
      } else {
        editor.chain().focus().extendMarkRange('link').setLink({ href: url }).run();
      }
    } else {
      if (url) {
        editor.chain().focus().setImage({ src: url }).run();
      }
    }
  };

  const handleLinkRemove = () => {
    setModalOpen(false);
    editor.chain().focus().extendMarkRange('link').unsetLink().run();
  };

  return (
    <div
      style={{
        border: '1px solid var(--border)',
        borderRadius: '12px',
        overflow: 'hidden',
        background: 'var(--card)',
        display: 'flex',
        flexDirection: 'column',
      }}
    >
      {/* Toolbar */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '4px',
          padding: '8px 12px',
          borderBottom: '1px solid var(--border)',
          background: 'var(--bg)',
          color: 'var(--text-soft)',
          flexWrap: 'wrap',
        }}
      >
        {/* Dropdown de formatação */}
        <select
          value={
            editor.isActive('heading', { level: 1 })
              ? 'h1'
              : editor.isActive('heading', { level: 2 })
              ? 'h2'
              : 'paragraph'
          }
          onChange={(e) => {
            const val = e.target.value;
            if (val === 'h1') {
              editor.chain().focus().setHeading({ level: 1 }).run();
            } else if (val === 'h2') {
              editor.chain().focus().setHeading({ level: 2 }).run();
            } else {
              editor.chain().focus().setParagraph().run();
            }
          }}
          style={{
            height: '32px',
            border: '1px solid var(--border)',
            borderRadius: '8px',
            padding: '0 8px',
            background: 'var(--card)',
            fontSize: '12.5px',
            fontWeight: 700,
            marginRight: '6px',
            outline: 'none',
            color: 'var(--text)',
            cursor: 'pointer',
          }}
        >
          <option value="paragraph">Parágrafo</option>
          <option value="h1">Título 1</option>
          <option value="h2">Título 2</option>
        </select>

        {/* Separator */}
        <div style={{ width: '1px', height: '20px', background: 'var(--border)', margin: '0 4px' }} />

        {/* Bold */}
        <button
          type="button"
          onClick={() => editor.chain().focus().toggleBold().run()}
          style={{
            width: '32px',
            height: '32px',
            borderRadius: '8px',
            border: 'none',
            background: editor.isActive('bold') ? 'var(--muted)' : 'transparent',
            color: editor.isActive('bold') ? 'var(--primary)' : 'var(--text-soft)',
            fontWeight: 800,
            fontSize: '15px',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
          title="Negrito"
        >
          B
        </button>

        {/* Italic */}
        <button
          type="button"
          onClick={() => editor.chain().focus().toggleItalic().run()}
          style={{
            width: '32px',
            height: '32px',
            borderRadius: '8px',
            border: 'none',
            background: editor.isActive('italic') ? 'var(--muted)' : 'transparent',
            color: editor.isActive('italic') ? 'var(--primary)' : 'var(--text-soft)',
            fontStyle: 'italic',
            fontSize: '15px',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
          title="Itálico"
        >
          I
        </button>

        {/* Underline */}
        <button
          type="button"
          onClick={() => editor.chain().focus().toggleUnderline().run()}
          style={{
            width: '32px',
            height: '32px',
            borderRadius: '8px',
            border: 'none',
            background: editor.isActive('underline') ? 'var(--muted)' : 'transparent',
            color: editor.isActive('underline') ? 'var(--primary)' : 'var(--text-soft)',
            textDecoration: 'underline',
            fontSize: '15px',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
          title="Sublinhado"
        >
          U
        </button>

        {/* Separator */}
        <div style={{ width: '1px', height: '20px', background: 'var(--border)', margin: '0 4px' }} />

        {/* Bullet List */}
        <button
          type="button"
          onClick={() => editor.chain().focus().toggleBulletList().run()}
          style={{
            width: '32px',
            height: '32px',
            borderRadius: '8px',
            border: 'none',
            background: editor.isActive('bulletList') ? 'var(--muted)' : 'transparent',
            color: editor.isActive('bulletList') ? 'var(--primary)' : 'var(--text-soft)',
            fontSize: '16px',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
          title="Lista sem ordenação"
        >
          •
        </button>

        {/* Ordered List */}
        <button
          type="button"
          onClick={() => editor.chain().focus().toggleOrderedList().run()}
          style={{
            width: '32px',
            height: '32px',
            borderRadius: '8px',
            border: 'none',
            background: editor.isActive('orderedList') ? 'var(--muted)' : 'transparent',
            color: editor.isActive('orderedList') ? 'var(--primary)' : 'var(--text-soft)',
            fontSize: '13px',
            fontWeight: 700,
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
          title="Lista ordenada"
        >
          1.
        </button>

        {/* Link */}
        <button
          type="button"
          onClick={handleLinkClick}
          style={{
            width: '32px',
            height: '32px',
            borderRadius: '8px',
            border: 'none',
            background: editor.isActive('link') ? 'var(--muted)' : 'transparent',
            color: editor.isActive('link') ? 'var(--primary)' : 'var(--text-soft)',
            fontSize: '14px',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
          title="Inserir Link"
        >
          🔗
        </button>

        {/* Image */}
        <button
          type="button"
          onClick={handleImageClick}
          style={{
            width: '32px',
            height: '32px',
            borderRadius: '8px',
            border: 'none',
            background: 'transparent',
            color: 'var(--text-soft)',
            fontSize: '14px',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
          title="Inserir Imagem por URL"
        >
          🖼️
        </button>

        {/* Blockquote */}
        <button
          type="button"
          onClick={() => editor.chain().focus().toggleBlockquote().run()}
          style={{
            width: '32px',
            height: '32px',
            borderRadius: '8px',
            border: 'none',
            background: editor.isActive('blockquote') ? 'var(--muted)' : 'transparent',
            color: editor.isActive('blockquote') ? 'var(--primary)' : 'var(--text-soft)',
            fontSize: '14px',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
          title="Citação"
        >
          ❝
        </button>
      </div>

      {/* Editor Content Area */}
      <div style={{ flex: 1, padding: '16px 20px', minHeight: '300px' }} className="tiptap-editor-container">
        <EditorContent editor={editor} />
      </div>

      {/* Modais de Link/Imagem */}
      <LinkImageModal
        isOpen={modalOpen}
        type={modalType}
        defaultValue={modalDefaultValue}
        onClose={() => setModalOpen(false)}
        onSubmit={handleModalSubmit}
        onRemove={handleLinkRemove}
      />

      <style>{`
        .tiptap-editor-container .ProseMirror {
          outline: none;
          min-height: 280px;
          font-family: 'Plus Jakarta Sans', sans-serif;
          font-size: 14.5px;
          line-height: 1.6;
          color: var(--text);
        }
        .tiptap-editor-container .ProseMirror p {
          margin: 0 0 12px 0;
        }
        .tiptap-editor-container .ProseMirror h1 {
          font-family: 'Nunito', sans-serif;
          font-size: 22px;
          font-weight: 800;
          margin: 16px 0 10px 0;
          color: var(--text);
        }
        .tiptap-editor-container .ProseMirror h2 {
          font-family: 'Nunito', sans-serif;
          font-size: 18px;
          font-weight: 800;
          margin: 14px 0 8px 0;
          color: var(--text);
        }
        .tiptap-editor-container .ProseMirror blockquote {
          border-left: 3px solid var(--primary);
          padding-left: 14px;
          margin: 12px 0;
          color: var(--text-soft);
          font-style: italic;
        }
        .tiptap-editor-container .ProseMirror ul,
        .tiptap-editor-container .ProseMirror ol {
          padding-left: 20px;
          margin-bottom: 12px;
        }
        .tiptap-editor-container .ProseMirror ul li {
          list-style-type: disc;
        }
        .tiptap-editor-container .ProseMirror ol li {
          list-style-type: decimal;
        }
        .editor-link {
          color: var(--primary);
          text-decoration: underline;
          cursor: pointer;
        }
        .editor-image {
          max-width: 100%;
          border-radius: 8px;
          margin: 10px 0;
        }
      `}</style>
    </div>
  );
};
