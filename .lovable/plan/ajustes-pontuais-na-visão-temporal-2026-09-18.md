# Ajustes pontuais na visão temporal

## Alterações
- Remover “Últimos 90 dias” apenas do seletor em **Registros → Visão geral**, mantendo as opções compartilhadas nas demais telas inalteradas.
- Substituir a série semanal do gráfico **Observações ao longo do tempo** por:
  - agrupamento por data real, somente em datas com registros, para 7 e 30 dias;
  - agrupamento por mês real, em ordem cronológica, para todo o período.
- Preservar os cálculos atuais de **Pontos de atenção** e **Observações positivas**, assim como o comportamento do gráfico de barras.
- Ocultar o seletor de aluno somente no perfil individual, sem alterar os filtros da turma ou do histórico geral.

## Detalhes técnicos
- Criar uma opção específica no filtro compartilhado para controlar a exibição do seletor de aluno.
- Manter `PERIOD_OPTIONS` compartilhado e filtrar a opção de 90 dias apenas na Visão geral.
- Ajustar o seletor responsável pela série temporal para gerar rótulos pt-BR por dia ou mês conforme o período.

## Validação
- Conferir 7 dias, 30 dias e todo o período no gráfico com dados reais da demonstração.
- Confirmar ausência de “Últimos 90 dias” somente na Visão geral.
- Confirmar que o perfil mantém apenas Tipo, Conteúdo, Período e Limpar filtros.
- Verificar que histórico geral e página da turma continuam com seus filtros atuais.
