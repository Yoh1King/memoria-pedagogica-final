# Memória Pedagógica

Aplicação web responsiva desenvolvida para apoiar profissionais da educação no registro, organização e recuperação de observações realizadas ao longo das aulas.

O Memória Pedagógica funciona como uma ferramenta de apoio ao acompanhamento pedagógico. Seu objetivo não é realizar diagnósticos ou substituir a análise do profissional, mas facilitar o acesso às informações registradas ao longo do tempo, permitindo que elas sejam utilizadas posteriormente no acompanhamento e planejamento

> Projeto acadêmico desenvolvido na disciplina de **Tópicos Integradores**, do curso de **Análise e Desenvolvimento de Sistemas — UNAMA**.

## Problema 

Durante uma aula ou atividade, diversas informações importantes podem ser observadas pelo profissional responsável pelo acompanhamento dos alunos. Porém, essas informações muitas vezes acabam distribuídas entre cadernos, planilhas e anotações pessoais, dificultando sua organização e recuperação posterior.

O problema identificado não é necessariamente a falta de informação, mas a dificuldade de:

- organizar as observações realizadas;
- recuperar informações posteriormente;
- consultar o histórico de um aluno ou turma;
- identificar informações recorrentes ao longo do tempo;
- utilizar os registros como apoio para novas atividades e acompanhamentos.

A partir desse problema surgiu o Memória Pedagógica.

## Aplicação publicada

A versão atual do Memória Pedagógica está disponível em:

[**Acessar Memória Pedagógica**](https://memoria-pedagogica-app.lovable.app)

## Integrantes

| Nome | Matrícula |
|---|---|
| Eduarda Yohana Reis Farias | 04181866 |
| Hugo Gabriel Alencar Da Silva | 04186328 |
| Lucas Arthur Silva Farias | 04187948 |
| Safira Sales Silva Barreto | 04177290 |

## Como funciona

O fluxo principal da aplicação é:

**Observar → Registrar → Organizar → Recuperar → Utilizar**

Após uma aula ou atividade, o responavel por uma atividade registra observações relacionadas à turma, aos alunos e ao conteúdo trabalhado. Esses registros ficam organizados para consulta posterior e podem auxiliar no acompanhamento e no planejamento das próximas atividades.

## Funcionalidades

- Cadastro e autenticação de usuários
- Cadastro de turmas e alunos
- Importação de alunos por arquivos CSV e XLSX
- Registro de observações individuais, em grupo ou para toda a turma
- Histórico por turma e aluno
- Filtros para consulta dos registros
- Panorama das observações por meio de gráficos
- Exportação dos registros em PDF
- Recuperação de senha e alteração de e-mail
- Exclusão de conta e dos dados associados

## Tecnologias

| Tecnologia | Uso |
|---|---|
| React + TypeScript | Desenvolvimento da aplicação |
| Vite | Ambiente de desenvolvimento e build |
| TanStack | Estrutura e gerenciamento de rotas |
| Tailwind CSS + Radix UI | Interface e componentes |
| Recharts | Visualização dos dados |
| SheetJS (XLSX) | Importação de planilhas |
| Lovable Cloud | Banco de dados, autenticação e serviços de backend |

O desenvolvimento do MVP e da versão atual contou com apoio da plataforma **Lovable**.

## Como executar

### Pré-requisitos

- Node.js instalado
- npm ou outro gerenciador de pacotes compatível
- Configuração das variáveis de ambiente necessárias ao backend

### Instalação

Clone o repositório:

```bash
git clone https://github.com/Yoh1King/memoria-pedagogica-final.git
cd memoria-pedagogica-final
```

Instale as dependências:

```bash
npm install
```

Execute o projeto:

```bash
npm run dev
```

Para gerar a versão de produção:

```bash
npm run build
```

> As variáveis e credenciais privadas utilizadas pela aplicação não devem ser adicionadas ao repositório.

## Organização do projeto

```text
memoria-pedagogica-final/
├── public/        Arquivos públicos
├── src/           Código principal da aplicação
├── supabase/      Configurações e funções relacionadas ao backend
├── exemplos/      Arquivos CSV/XLSX para testes
├── package.json   Dependências e scripts
└── vite.config.ts Configuração do Vite
```

## Arquivos para teste

A pasta `/exemplos` contém arquivos CSV e XLSX com dados fictícios que podem ser utilizados para testar a importação de alunos.

## Histórico de desenvolvimento

O desenvolvimento do Memória Pedagógica ocorreu em duas etapas.

A primeira correspondeu à construção e estabilização do MVP. Seu histórico de commits e versões foi preservado no repositório:

[**memoria-pedagogica-MVP**](https://github.com/Yoh1King/memoria-pedagogica-MVP)

Após essa etapa, o projeto foi remixado para continuidade do desenvolvimento, originando este repositório. Nesta segunda etapa foram implementadas e refinadas funcionalidades da versão final, incluindo autenticação, persistência dos dados, segurança, exportação de registros e ajustes de interface.

Os dois repositórios foram mantidos para preservar de forma transparente o histórico das duas etapas do desenvolvimento.

## Status

**Versão final em fase de testes e validação.**
