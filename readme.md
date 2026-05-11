# Minhas Listas

Este projeto é uma aplicação web construída com React e TypeScript, utilizando Vite para o ambiente de desenvolvimento e Tailwind CSS para estilização. Ele oferece funcionalidades para gerenciar diferentes tipos de listas, como lista de mercado, inventário de casa e tarefas domésticas, com persistência de dados via Supabase.

## Funcionalidades

- **Lista do Mercado**: Gerencie itens a serem comprados, incluindo nome, preço e quantidade. Acompanhe o valor total planejado e o valor já gasto, com um sistema de orçamento mensal.
- **Inventário de Casa**: Mantenha um registro dos itens que você já possui em casa, com quantidade e data de validade. Alertas visuais para itens vencendo em breve ou já vencidos.
- **Tarefas de Casa**: Crie e gerencie tarefas domésticas, marcando-as como concluídas e acompanhando o progresso.
- **Seleção de Mês**: Visualize e gerencie as listas para meses específicos, permitindo um controle histórico e planejamento futuro.
- **Persistência de Dados**: Todos os dados são armazenados no Supabase, garantindo que suas listas sejam salvas e acessíveis.

## Tecnologias Utilizadas

- **React**: Biblioteca JavaScript para construção de interfaces de usuário.
- **TypeScript**: Superset do JavaScript que adiciona tipagem estática.
- **Vite**: Ferramenta de build rápida para projetos web modernos.
- **Tailwind CSS**: Framework CSS utilitário para estilização rápida e responsiva.
- **Supabase**: Plataforma de código aberto que oferece um backend como serviço (BaaS) com banco de dados PostgreSQL, autenticação, armazenamento e APIs em tempo real.
- **Lucide React**: Biblioteca de ícones para React.

## Estrutura do Projeto

```
. 
├── public/
├── src/
│   ├── assets/
│   ├── components/
│   │   ├── HomeList.tsx
│   │   ├── InventoryList.tsx
│   │   ├── MarketList.tsx
│   │   └── MonthSelector.tsx
│   ├── hooks/
│   │   ├── useHomeItems.ts
│   │   ├── useInventoryItems.ts
│   │   ├── useMarketItems.ts
│   │   └── useMonthlyBudget.ts
│   ├── lib/
│   │   └── supabase.ts
│   ├── types/
│   │   └── index.ts
│   ├── App.tsx
│   ├── index.css
│   └── main.tsx
├── .eslintrc.cjs
├── index.html
├── package.json
├── package-lock.json
├── postcss.config.js
├── tailwind.config.js
├── tsconfig.json
├── tsconfig.node.json
├── vite-env.d.ts
├── vite.config.ts
└── README.md
```

- `src/components`: Contém os componentes React para cada tipo de lista e o seletor de mês.
- `src/hooks`: Contém os hooks personalizados para manipulação de dados com o Supabase para cada lista e o orçamento mensal.
- `src/lib/supabase.ts`: Configuração do cliente Supabase.
- `src/types/index.ts`: Definições de tipos TypeScript para os dados.
- `App.tsx`: Componente principal da aplicação que gerencia as abas e o seletor de mês.
- `index.css`: Estilos globais, incluindo a importação do Tailwind CSS.
- `main.tsx`: Ponto de entrada da aplicação React.

## Configuração e Execução

Para configurar e executar o projeto localmente, siga os passos abaixo:

### Pré-requisitos

- Node.js (versão 18 ou superior)
- npm ou Yarn
- Uma conta Supabase e um projeto configurado.

### Passos

1. **Clone o repositório (se aplicável):**
   ```bash
   git clone <URL_DO_SEU_REPOSITORIO>
   cd minhas-listas
   ```

2. **Instale as dependências:**
   ```bash
   npm install
   # ou
   yarn install
   ```

3. **Configure o Supabase:**
   - Crie um novo projeto no [Supabase](https://supabase.com/).
   - Obtenha sua `URL` e `Anon Key` nas configurações do projeto (Settings -> API).
   - Crie um arquivo `.env` na raiz do projeto com as seguintes variáveis de ambiente:
     ```
     VITE_SUPABASE_URL=SUA_URL_DO_SUPABASE
     VITE_SUPABASE_ANON_KEY=SUA_ANON_KEY_DO_SUPABASE
     ```
   - Execute os scripts SQL fornecidos na pasta raiz do projeto para configurar as tabelas no seu banco de dados Supabase. Estes scripts criam as tabelas `market_items`, `inventory_items`, `home_items` e `monthly_budgets`.
     Exemplo de execução (pode variar dependendo da sua ferramenta de banco de dados ou CLI do Supabase):
     ```bash
     # Exemplo usando a CLI do Supabase para aplicar migrações
     # Certifique-se de ter a CLI instalada e configurada
     supabase migration up
     ```
     Ou importe manualmente os arquivos `.sql` para o seu banco de dados Supabase.

4. **Execute a aplicação:**
   ```bash
   npm run dev
   # ou
   yarn dev
   ```

   A aplicação estará disponível em `http://localhost:5173` (ou outra porta disponível).

## Scripts Disponíveis

No diretório do projeto, você pode executar:

- `npm run dev`: Inicia o servidor de desenvolvimento.
- `npm run build`: Compila a aplicação para produção na pasta `dist`.
- `npm run lint`: Executa o linter para verificar problemas de código.
- `npm run preview`: Serve a build de produção localmente.

## Contribuição

Sinta-se à vontade para contribuir com este projeto. Para isso, por favor, siga os seguintes passos:

1. Faça um fork do repositório.
2. Crie uma nova branch (`git checkout -b feature/sua-feature`).
3. Faça suas alterações e commit-as (`git commit -m 'feat: Adiciona nova funcionalidade'`).
4. Envie para a branch original (`git push origin feature/sua-feature`).
5. Abra um Pull Request.


