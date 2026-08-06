import { useEffect, useRef } from 'react';
import { useConfiguracoes } from './useConfiguracoes';

interface UseAutosaveOptions<T> {
  /**
   * Dados atuais do formulário. Qualquer mudança neste objeto dispara
   * o debounce. Deve ser memoizado com useMemo no componente de uso
   * para evitar re-renders desnecessários.
   */
  data: T;
  /**
   * Função que executa o save. É referenciada via ref internamente,
   * portanto não precisa ser estável (useCallback) no componente pai.
   */
  onSave: (data: T) => Promise<void>;
  /**
   * Se false, o autosave não dispara (ex: registro novo ainda não salvo).
   * Normalmente: id !== null.
   */
  isEditing: boolean;
  /** Delay do debounce em ms. Padrão: 3000 */
  debounceMs?: number;
}

/**
 * Hook de autosave com debounce.
 *
 * Comportamento:
 * - Só ativa quando config.autosave_enabled === true E isEditing === true
 * - Dispara 3 s após a última mudança em `data`
 * - Erros são silenciosos (console.warn) — não interrompem o usuário
 * - Expõe cancelTimer() para que ações manuais cancelem o timer pendente
 *   antes de executar o próprio save, evitando race conditions
 *
 * Regra crítica:
 * - onSave NUNCA deve alterar estado_editorial (Planos) nem published_at
 *   (FAQ/Textos) — o autosave salva apenas os campos do formulário,
 *   preservando o estado de publicação atual do registro.
 */
export function useAutosave<T>({
  data,
  onSave,
  isEditing,
  debounceMs = 3000,
}: UseAutosaveOptions<T>) {
  const { config } = useConfiguracoes();
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  // Ref para onSave garante que o closure do timer usa sempre a versão mais recente
  const onSaveRef = useRef(onSave);
  onSaveRef.current = onSave;

  const cancelTimer = () => {
    if (timerRef.current) {
      clearTimeout(timerRef.current);
      timerRef.current = null;
    }
  };

  useEffect(() => {
    // Não autosalva se: feature desligada, ou registro novo (não tem id)
    if (!config?.autosave_enabled || !isEditing) return;

    cancelTimer();

    timerRef.current = setTimeout(async () => {
      try {
        await onSaveRef.current(data);
      } catch (err) {
        // Autosave silencioso — falha não interrompe o usuário
        console.warn('[autosave] Falha silenciosa ao salvar rascunho:', err);
      }
    }, debounceMs);

    // Cleanup: cancela o timer se o componente desmontar ou data mudar antes de disparar
    return cancelTimer;
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [data, config?.autosave_enabled, isEditing, debounceMs]);
  // onSave intencionalmente omitido: controlado via ref (onSaveRef.current)

  return { cancelTimer };
}
