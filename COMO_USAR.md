# Controle de Estoque

Aplicativo privado para consulta de produtos, entradas, saídas, reservas, contagem física, histórico e exportação Excel.

## Primeiro acesso

Entre pela sua conta do ChatGPT. Na tela inicial, use **Importar Excel** para gravar seus produtos e saldos iniciais. Esta cópia do código não contém dados reais de estoque. A importação é segura para repetição: registros existentes no mesmo SKU, armazém e estante são mantidos, sem somar os saldos novamente.

## Operação

- Use **Entrada** e **Saída** na linha do produto. Quantidade e motivo são obrigatórios.
- Clique no nome do produto para consultar os detalhes, reservar unidades, liberar reservas, registrar saída de reserva ou fazer contagem física.
- Use **Movimentações** para consultar o histórico e exportá-lo.
- Use **Exportar Excel** para baixar as quatro colunas do modelo `Update_warehouse_SKU01.xlsx`, na aba `Sheet1`.
- **Importar Excel** recebe o formato original `Lista_de_Estoque`, com título, armazém e saldos. O arquivo de quatro colunas é um arquivo de atualização para exportação e não é a fonte de cadastro inicial.

## Escopo desta versão

O acesso é privado, para o proprietário. Os dados são separados por usuário. Perfis compartilhados de administrador e operador, transferências entre armazéns e estorno vinculado ainda não estão implementados. Quantidades em trânsito do arquivo original são preservadas e exibidas, mas não há fluxo de recebimento em trânsito nesta versão. Correções podem ser registradas como contagem física com justificativa; o histórico é preservado.

O histórico na tela e sua exportação abrangem as últimas 2.000 movimentações. O banco mantém os registros anteriores.

## Desenvolvimento

Requer Node.js 24 e pnpm 11.19.0. Instale com `pnpm install --frozen-lockfile`. Execute `pnpm dev` para desenvolvimento. Para banco local, gere a compilação e aplique a migração em `drizzle/0000_bumpy_power_pack.sql` usando Wrangler com a configuração `dist/server/wrangler.json` e persistência `.wrangler/state`.

O ambiente online precisa da publicação pelo Sites, que provisiona o banco D1 e aplica a migração. A compilação local foi verificada. Para publicar uma nova instalação, registre um projeto Sites próprio. O código no GitHub não migra o banco de dados da instalação existente.
