# Designa Fácil — Projeto Integrador

Versão acadêmica independente de uma aplicação de organização de designações. Preserva a interface React, regras de distribuição, permissões por módulo, participantes, indisponibilidades e escalas. Todos os cadastros e exemplos foram criados para demonstração.

## Executar

Instale Node.js 24 LTS com npm. Em um terminal, dentro desta pasta:

```sh
npm ci
npm run build
npm start
```

Abra **http://127.0.0.1:3000**. O banco SQLite é criado automaticamente em `.data/demo.sqlite`. Não é necessário cadastrar cartão, configurar variáveis ou conectar serviços externos.

Para desenvolver, use `npm run dev` e abra **http://127.0.0.1:5173**. Reinicie esse comando após alterar a API; a interface atualiza automaticamente.

## Contas fictícias

| E-mail | Perfil | Senha de demonstração |
|---|---|---|
| admin@example.invalid | Administrador | DemoAcademica!2026 |
| editor@example.invalid | Coordenador com edição de escalas | DemoAcademica!2026 |
| aluno@example.invalid | Leitura | DemoAcademica!2026 |

Essas contas e essa senha pertencem exclusivamente ao exemplo local. Os nomes são numerados, os e-mails usam domínio reservado e os telefones estão vazios. Não cadastre pessoas reais nesta demonstração. O servidor aceita apenas conexões locais e não foi preparado para hospedagem pública.

## Roteiro para avaliação

1. Entre como administrador e confira os 12 participantes fictícios e as quatro semanas de novembro de 2026.
2. Abra Participantes, cadastre um participante fictício e consulte o registro.
3. Abra Folgas e consulte a indisponibilidade fictícia. Nas designações, observe as regras de disponibilidade, qualificação e conflitos.
4. Consulte a programação, as escalas mecânicas, os privilégios e a folha de reunião.
5. Saia e entre com o perfil de leitura para comparar o acesso.
6. Reinicie o servidor para confirmar que o cadastro permanece no banco local.

## Verificar

```sh
npm run typecheck
npm test
npm run audit:publication
npm audit
```

Execute a compilação antes dos testes. Os testes de integração criam um banco temporário próprio e verificam login, sessões, permissões, proteção de contatos, gravação, reinício e bloqueio de integrações externas. Veja `docs/VALIDACAO.md`.

## Organização

- `app/`: interface, regras de negócio e API adaptadas.
- `server/`: servidor HTTP local, armazenamento SQLite e dados fictícios.
- `db/schema.sql`: estrutura do banco, sem dados.
- `tests/`: testes de integração com servidor e banco reais locais.
- `scripts/`: compilação, desenvolvimento e verificação antes de publicação.
- `docs/`: arquitetura, adaptações e resultados de validação.

## Adaptações e limites

A edição original usa vinext, Cloudflare Workers/D1 e autenticação integrada à hospedagem. Esta edição usa Vite, servidor Node.js e SQLite, com um adaptador para as consultas existentes. O login acadêmico usa scrypt com sal aleatório, sessões de oito horas e cookies HttpOnly/SameSite. Cabeçalhos externos não autenticam usuários.

Históricos reais, recuperação de acesso, convites, sincronização com sites externos e geração mensal automática de campo foram retirados ou desativados. O exemplo inclui uma escala fictícia de campo que pode ser consultada/editada. O compartilhamento pelo WhatsApp está desativado; os atalhos herdados apontam para um endereço inválido. Catálogos e imagens originais foram substituídos por exemplos. A instalação como aplicativo móvel e o service worker não fazem parte desta edição.

Datas e algumas regras de calendário permanecem limitadas a 2026. A existência de funções na interface herdada não significa que todos os módulos foram testados integralmente. Este material demonstra o desenvolvimento e não substitui o sistema utilizado em produção.

## Distribuição

Este repositório foi preparado localmente, com histórico independente e sem vínculo remoto com o sistema original. A publicação no GitHub depende da aprovação explícita do responsável, após leitura do relatório privado de auditoria. `private: true` impede publicação acidental no npm; não controla a visibilidade no GitHub.

Não foi atribuída uma licença de código aberto automaticamente. A disponibilização para consulta acadêmica não concede, por si só, licença geral de reutilização dos componentes próprios. Dependências mantêm suas licenças originais.
