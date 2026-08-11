import React, { useState, useRef, useEffect } from 'react';
import { MoreVertical, Image as ImageIcon, Download, Trash2 } from 'lucide-react';
import type { StrapiFile } from '../../lib/strapi';
import { getMediaType, formatFileSize, MEDIA_TYPE_CONFIG } from '../../lib/media';

interface MediaCardProps {
  file: StrapiFile;
  onDelete: (id: number, name: string, relatedCount: number) => void;
}

export const MediaCard: React.FC<MediaCardProps> = ({ file, onDelete }) => {
  const [menuOpen, setMenuOpen] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const [hoveredItem, setHoveredItem] = useState<'view' | 'delete' | null>(null);
  const menuRef = useRef<HTMLDivElement>(null);

  const type = getMediaType(file.mime);
  const config = MEDIA_TYPE_CONFIG[type];
  const isImg = type === 'img';
  const relatedCount = file.related?.length ?? 0;

  const formatDate = (dateStr: string) => {
    try {
      const date = new Date(dateStr);
      return date.toLocaleDateString('pt-BR', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
      });
    } catch (_) {
      return dateStr;
    }
  };

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setMenuOpen(false);
      }
    };
    if (menuOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [menuOpen]);

  const handleOpen = () => {
    const STRAPI_URL = import.meta.env.VITE_STRAPI_URL || 'https://omlpi-strapi.rnpiobserva.org.br';
    const fileUrl = file.url.startsWith('http') ? file.url : `${STRAPI_URL}${file.url}`;
    window.open(fileUrl, '_blank', 'noopener,noreferrer');
    setMenuOpen(false);
  };

  const handleDeleteClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    onDelete(file.id, file.name, relatedCount);
    setMenuOpen(false);
  };

  return (
    <div
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onClick={handleOpen}
      style={{
        background: 'var(--card)',
        border: '1px solid var(--border)',
        borderColor: isHovered ? 'var(--primary)' : 'var(--border)',
        borderRadius: '14px',
        boxShadow: isHovered 
          ? '0 10px 28px rgba(68,69,37,.1)' 
          : 'var(--shadow, 0 1px 2px rgba(68,69,37,.04), 0 8px 24px rgba(68,69,37,.05))',
        overflow: 'hidden',
        cursor: 'pointer',
        position: 'relative',
        display: 'flex',
        flexDirection: 'column',
        height: '172px',
        transition: 'all 0.2s ease',
      }}
    >
      {/* Thumbnail Area */}
      <div
        style={{
          height: '110px',
          background: config.bg,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          position: 'relative',
          flexShrink: 0,
        }}
      >
        {isImg ? (
          file.formats?.thumbnail?.url ? (
            <img
              src={
                file.formats.thumbnail.url.startsWith('http')
                  ? file.formats.thumbnail.url
                  : `${import.meta.env.VITE_STRAPI_URL || 'https://omlpi-strapi.rnpiobserva.org.br'}${file.formats.thumbnail.url}`
              }
              alt={file.name}
              style={{
                width: '100%',
                height: '100%',
                objectFit: 'cover',
              }}
            />
          ) : (
            <ImageIcon size={40} color={config.color} />
          )
        ) : (
          <span
            style={{
              fontFamily: "'Nunito', sans-serif",
              fontWeight: 900,
              fontSize: '20px',
              color: config.color,
              letterSpacing: '.5px',
            }}
          >
            {config.label}
          </span>
        )}

        {/* Menu Dot Button */}
        <div
          ref={menuRef}
          style={{ position: 'absolute', top: '9px', right: '9px' }}
          onClick={(e) => e.stopPropagation()}
        >
          <button
            onClick={() => setMenuOpen((prev) => !prev)}
            style={{
              background: 'rgba(255, 255, 255, 0.9)',
              color: 'var(--text-soft)',
              width: '26px',
              height: '26px',
              borderRadius: '8px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              border: 'none',
              cursor: 'pointer',
              boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
            }}
            title="Ações"
          >
            <MoreVertical size={16} />
          </button>

          {/* Dropdown Menu */}
          {menuOpen && (
            <div
              style={{
                position: 'absolute',
                top: '32px',
                right: 0,
                background: 'var(--card)',
                border: '1px solid var(--border)',
                borderRadius: '8px',
                boxShadow: '0 4px 12px rgba(68,69,37,0.14)',
                zIndex: 10,
                minWidth: '150px',
                padding: '4px 0',
              }}
            >
              <button
                onClick={handleOpen}
                onMouseEnter={() => setHoveredItem('view')}
                onMouseLeave={() => setHoveredItem(null)}
                style={{
                  width: '100%',
                  padding: '8px 12px',
                  fontSize: '13px',
                  fontWeight: 600,
                  color: 'var(--text)',
                  background: hoveredItem === 'view' ? 'var(--muted)' : 'transparent',
                  border: 'none',
                  textAlign: 'left',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                }}
              >
                <Download size={14} />
                Visualizar/Baixar
              </button>
              <button
                onClick={handleDeleteClick}
                onMouseEnter={() => setHoveredItem('delete')}
                onMouseLeave={() => setHoveredItem(null)}
                style={{
                  width: '100%',
                  padding: '8px 12px',
                  fontSize: '13px',
                  fontWeight: 600,
                  color: 'var(--destructive)',
                  background: hoveredItem === 'delete' ? '#fbeaee' : 'transparent',
                  border: 'none',
                  textAlign: 'left',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                }}
              >
                <Trash2 size={14} />
                Excluir
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Info Area */}
      <div style={{ padding: '11px 13px', flex: 1, minWidth: 0 }}>
        <div
          style={{
            fontSize: '12.5px',
            fontWeight: 700,
            color: 'var(--text)',
            whiteSpace: 'nowrap',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
          }}
          title={file.name}
        >
          {file.name}
        </div>
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginTop: '5px',
          }}
        >
          <span style={{ fontSize: '11px', color: 'var(--text-soft)', fontWeight: 600 }}>
            {formatFileSize(file.size)}
          </span>
          <span style={{ fontSize: '11px', color: 'var(--text-soft)', fontWeight: 600 }}>
            {formatDate(file.created_at)}
          </span>
        </div>
      </div>
    </div>
  );
};
export default MediaCard;
