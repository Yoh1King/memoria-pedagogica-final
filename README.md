# Memória Pedagógica

O **Memória Pedagógica** é uma aplicação web responsiva desenvolvida para apoiar profissionais da educação que realizam o acompanhamento contínuo de turmas ou grupos de alunos, auxiliando no registro, organização e recuperação de observações realizadas ao longo das aulas.

A interface se adapta a diferentes tamanhos de tela, permitindo o acesso tanto por computadores quanto por dispositivos móveis.

A proposta busca reduzir o esforço necessário para lembrar e acompanhar informações observadas no cotidiano das turmas, criando uma memória de apoio à prática docente sem substituir a autonomia ou o planejamento do professor.

## Como funciona

O fluxo da aplicação é simples:

**Observar → Registrar → Organizar → Recuperar**

Após uma aula, o professor pode registrar situações como dificuldades de compreensão, participação, atenção, avanços e outras observações relevantes.

Esses registros ficam organizados por turma, aluno, conteúdo e período, permitindo consultar posteriormente o histórico e visualizar panoramas das observações realizadas.

## Principais funcionalidades

- Cadastro de turmas e alunos;
- Importação de alunos por arquivos CSV e XLSX;
- Registro de observações pós-aula;
- Histórico por turma e aluno;
- Filtros para consulta dos registros;
- Panorama das observações por meio de gráficos;
- Ambiente de demonstração com dados fictícios, destinado à apresentação e aos testes do MVP.

## Público-alvo

O Memória Pedagógica é direcionado a profissionais da educação que realizam acompanhamento contínuo de turmas ou grupos de alunos e precisam organizar observações realizadas ao longo do tempo.

A proposta apresenta maior aderência a contextos em que há contato recorrente com os mesmos alunos e em que o acompanhamento de aspectos como participação, compreensão, atenção, avanços e convivência faz parte da rotina pedagógica.

## Sobre o projeto

O Memória Pedagógica é uma ferramenta de **apoio**. O sistema organiza as informações registradas pelo próprio professor, mas não realiza diagnósticos, não determina intervenções pedagógicas e não substitui a tomada de decisão docente.

O projeto foi inicialmente proposto como uma **Progressive Web App (PWA)**. Durante o desenvolvimento do MVP, foi priorizada a implementação e validação do fluxo principal da solução. A versão atual foi desenvolvida como uma aplicação web responsiva, acessível por computadores e dispositivos móveis através do navegador. Os recursos específicos de PWA permanecem como possibilidade de evolução do projeto.

## Tecnologias utilizadas

- **React** e **TypeScript** — desenvolvimento da aplicação;
- **Vite** — ambiente de desenvolvimento e build;
- **TanStack** — estrutura e gerenciamento de rotas;
- **Tailwind CSS** e **Radix UI** — construção e estilização da interface;
- **Recharts** — visualização dos dados;
- **SheetJS (XLSX)** — suporte à importação de planilhas.

O MVP foi desenvolvido com apoio da plataforma **Lovable**.

## Arquivos para teste

O repositório disponibiliza, na pasta **`/exemplos`**, arquivos de exemplo em **CSV** e **XLSX** com dados fictícios para testar a funcionalidade de importação de alunos.

Site - [ https://lovable.dev/preview/NOEP0Jm96zZA7orIj7kslfH5xbIRWIfQ ]

Projeto acadêmico desenvolvido na disciplina de **Tópicos Integradores**, do curso de **Análise e Desenvolvimento de Sistemas — UNAMA**.

**Status:** MVP funcional em fase de testes e validação.

