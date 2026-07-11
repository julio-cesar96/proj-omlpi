import React from "react";

/**
 * PainelMonitoramento — Componente funcional
 *
 * Renderiza um estado elegante de "Em breve" para a aba de Monitoramento.
 * Confirmado em docs/API_CONTRACTS.md que não existe endpoint de dados para esta aba.
 */
export function PainelMonitoramento() {
  return (
    <div className="bg-card border border-border rounded-2xl p-8 lg:p-12 text-center max-w-2xl mx-auto space-y-6">
      <div className="w-16 h-16 bg-primary/10 text-primary rounded-full flex items-center justify-center mx-auto text-3xl">
        📊
      </div>
      
      <div className="space-y-2">
        <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-muted text-muted-foreground">
          Aba em desenvolvimento
        </div>
        <h3 className="text-2xl font-bold text-foreground">
          Painel de Monitoramento
        </h3>
        <p className="text-muted-foreground text-sm leading-relaxed">
          Esta funcionalidade requer a consolidação de novos dados nacionais
          no backend. No momento, o backend da API não disponibiliza dados
          agregados para monitoramento.
        </p>
      </div>

      <div className="pt-4 border-t border-border/60 text-xs text-muted-foreground">
        Esta é uma limitação de infraestrutura de dados documentada, sem previsão de novos endpoints no escopo atual.
      </div>
    </div>
  );
}
