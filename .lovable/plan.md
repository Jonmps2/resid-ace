# Voltar a visualizar a aplicação

A aplicação está no ar e funcionando — o que acontece é que, depois da etapa de backend, **todas as telas passaram a exigir login**. Por isso você só vê a tela "Entrar" em vez do painel.

## O que vou fazer

1. **Entrada imediata ao criar conta**
   Hoje, ao se cadastrar, é preciso confirmar o e-mail antes de conseguir entrar. Vou ativar a confirmação automática, então criar conta já leva direto ao painel — sem esperar e-mail.

2. **Página inicial pública**
   O endereço `/` passa a ser uma apresentação pública do Residência Planner (proposta, principais recursos e botão "Entrar"/"Criar conta"). Assim ninguém mais cai numa tela de login sem contexto.
   O painel autenticado passa a ficar em `/painel`, e o login redireciona para lá.

3. **Cabeçalho ciente da sessão**
   Na página inicial, quem já estiver logado vê "Ir para o painel" em vez de "Entrar".

4. **Correção de um erro de renderização na tela de login**
   A tela `/auth` está gerando um aviso de incompatibilidade entre servidor e navegador; vou ajustar para que ela carregue limpa.

## Detalhes técnicos

- `supabase--configure_auth` com `auto_confirm_email: true` (demais opções inalteradas).
- Nova rota pública `src/routes/index.tsx` (landing, SSR ligado, sem `beforeLoad`), com `head()` próprio: título, descrição, og:title/og:description.
- `src/routes/_authenticated/index.tsx` renomeada para `src/routes/_authenticated/painel.tsx` (rota `/painel`), sem alterar a lógica do dashboard.
- `src/components/layout/nav-items.ts`: item "Visão geral" aponta para `/painel`.
- `src/routes/auth.tsx`: destino padrão pós-login passa a ser `/painel`; `safePath` mantém a validação de caminho same-origin.
- `src/routes/__root.tsx` / `NotFoundComponent`: link "Voltar" ajustado para as rotas existentes.
- Hidratação: a rota `/auth` recebe `ssr: false` (ela depende de estado de sessão do navegador), eliminando o mismatch.

Nenhuma tabela, política de segurança ou dado é alterado.
