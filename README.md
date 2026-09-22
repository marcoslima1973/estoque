# Controle de Estoque — Supabase

React com banco PostgreSQL e autenticação do Supabase. A versão atual usa src/main.tsx, app/inventory.tsx e lib/supabase.ts. Os arquivos antigos do servidor Sites não participam da compilação estática.

## Usar
Entre com e-mail e senha do aplicativo. Se necessário, crie uma conta e confirme o e-mail. Cada conta acessa somente seus produtos e movimentações. A conta do painel Supabase não é automaticamente uma conta do aplicativo.

Importe Lista_de_Estoque pelo botão Importar Excel. A exportação preserva Sheet1 e as quatro colunas exatas de Update_warehouse_SKU01.xlsx. Importações repetidas preservam os saldos existentes. A tela e a exportação de histórico mostram as últimas 2.000 movimentações; as demais permanecem no banco.

## Banco
Projeto wbuupbmqwjropdvisuce. Tabelas estoque_products e estoque_movements com RLS por usuário. O comando de estoque atualiza saldo e histórico na mesma transação, com bloqueio de linha. Clientes podem consultar seus dados, mas não podem alterar saldos diretamente nem apagar histórico. Chaves administrativas não são usadas no navegador.

A estrutura aplicada está em supabase/estoque-schema.sql. Não execute novamente no projeto configurado. As tabelas anteriores foram removidas a pedido do proprietário; o backup privado fica fora do repositório.

## Desenvolvimento e publicação
Node 24 e pnpm 11.19.0. Execute pnpm install --frozen-lockfile, pnpm dev e pnpm build. A compilação produz docs/, para GitHub Pages na branch main, pasta /docs. Recompile e envie código e docs juntos após alterações.

Os dados da versão antiga do Sites não são migrados automaticamente. A migração requer identificar a conta de destino no Supabase. Não importe saldos antigos se houver movimentações posteriores sem reconciliá-los.

Reservas, entradas, saídas e contagem física estão disponíveis. Perfis de equipe, transferências entre armazéns e estornos vinculados ainda não estão implementados.
