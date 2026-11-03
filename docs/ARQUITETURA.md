# Arquitetura da edição acadêmica

O navegador apresenta a interface React/TypeScript. As chamadas relativas a `/api/state` usam a sessão local. A API aplica as permissões e regras de negócio e executa consultas parametrizadas no SQLite por meio de um adaptador compatível com a interface D1 utilizada pelo código original.

O servidor escuta em `127.0.0.1`, valida Host e origem das operações de escrita e não utiliza credenciais de nuvem. O banco é persistido em `.data/`, que está fora do versionamento. O arquivo `db/schema.sql` documenta a estrutura; a inicialização automática da API é a fonte executável da estrutura e dos dados fictícios.

| Área | Tratamento acadêmico |
|---|---|
| Interface e regras de designação | Adaptadas do código original |
| Participantes e históricos | Dados originais excluídos; exemplos novos |
| Autenticação | Substituída por contas fictícias e scrypt |
| Cloudflare/Sites | Configurações e dependências removidas |
| Banco de produção | Nunca acessado |
| Sincronização e recuperação de acesso | Bloqueadas |
| Migrações antigas | Excluídas; somente estrutura limpa |
| Imagens e catálogos | Exemplos novos e genéricos |
| Histórico Git | Independente; não importa commits privados |

A edição preserva alguns controles por nomes, convertidos em identificadores visuais fictícios. A evolução recomendada é centralizar todas essas autorizações em permissões. O arquivo principal da interface continua grande, como no projeto de origem; esta preparação priorizou isolamento e privacidade, sem uma reestruturação completa do produto.
