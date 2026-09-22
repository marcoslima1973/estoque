# Controle de Estoque

Aplicativo web em português para produtos, entradas, saídas, reservas, contagem física e histórico, com importação e exportação Excel.

## Privacidade

Este repositório contém apenas o código. A planilha original, os saldos, os custos reais e o banco de produção não estão incluídos. Importe sua própria planilha após configurar a aplicação. Não adicione arquivos de dados ou credenciais ao repositório.

## Tecnologias

React, TypeScript, Vinext, Cloudflare Workers e D1. A autenticação online usa a integração do Sites com o ChatGPT. O acesso ao banco é validado no servidor e separado por usuário.

## Executar localmente

Requisitos: Node.js 24 e pnpm 11.19.0.

```sh
pnpm install --frozen-lockfile
pnpm build
node --import ./scripts/sites-env.mjs ./node_modules/wrangler/bin/wrangler.js d1 execute DB --local --config dist/server/wrangler.json --persist-to .wrangler/state --file drizzle/0000_bumpy_power_pack.sql
pnpm dev
```

O perfil portátil simula o login apenas no ambiente local. A configuração de execução assume o perfil portátil quando nenhum perfil local estiver salvo.

## Hospedagem

A aplicação requer servidor, banco D1 e autenticação do Sites. GitHub Pages sozinho não executa o aplicativo. A cópia no GitHub não altera a hospedagem existente nem sincroniza seu banco. Para outra instalação Sites, crie um projeto próprio e associe o identificador em `.openai/hosting.json`. Para outra plataforma, adapte o banco e a autenticação.

## Excel

A importação usa a lista de estoque com SKU, título, armazém e saldos. A exportação usa a aba `Sheet1` e as quatro colunas do modelo `Update_warehouse_SKU01.xlsx`, preservando a precisão dos custos e distinguindo zero de campos vazios.

Consulte [COMO_USAR.md](COMO_USAR.md) para as operações e as limitações da versão.
