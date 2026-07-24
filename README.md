# 💰 Financeiro Web

Um sistema de controle financeiro pessoal desenvolvido com foco em organização, praticidade e uma experiência moderna de uso.

O projeto foi construído do zero utilizando tecnologias atuais do ecossistema JavaScript, permitindo o gerenciamento de contas, categorias e lançamentos financeiros, além de oferecer dashboards com gráficos e uma integração com Inteligência Artificial para leitura de comprovantes.

---

## 🚀 Tecnologias

### Front-end
- React
- Vite
- React Router
- Recharts
- Axios

### Back-end
- Node.js
- Express
- MongoDB
- Mongoose
- Supabase Authentication

### Inteligência Artificial
- Google Gemini API (OCR e interpretação de comprovantes)

---

## ✨ Funcionalidades

- 🔐 Autenticação segura com Supabase
- 📊 Dashboard com indicadores financeiros
- 💳 Gerenciamento de contas
- 📂 Cadastro de categorias
- 💸 Controle de receitas e despesas
- 📅 Filtros por período, conta e categoria
- 📈 Gráficos e resumo financeiro em tempo real
- ✏️ Edição e exclusão de lançamentos
- 📷 Leitura automática de comprovantes utilizando IA
- 📱 Interface preparada para futura otimização mobile

---

## 🤖 Lançamento Inteligente

Uma das principais funcionalidades do projeto é a integração com a **Google Gemini API**.

O usuário pode fotografar um comprovante de pagamento ou recebimento e o sistema:

- identifica as informações da imagem;
- extrai valor, data e descrição;
- sugere uma categoria;
- preenche automaticamente o formulário.

> Nenhum lançamento é salvo automaticamente. O usuário revisa as informações antes da confirmação.

---

## 📂 Estrutura do Projeto

```text
financeiro-web/
├── client/     # Aplicação React
└── server/     # API Node.js
```

---

## ⚙️ Configuração

### 1. Clone o repositório

```bash
git clone https://github.com/seu-usuario/financeiro-web.git

cd financeiro-web
```

---

### 2. Configure o MongoDB

Crie um banco gratuito no **MongoDB Atlas** e copie sua Connection String para:

```env
MONGO_URI=
```

---

### 3. Configure o Supabase

Crie um projeto gratuito no Supabase.

No painel da API obtenha:

- Project URL
- Anon Key
- Service Role Key

Configure as variáveis de ambiente:

**Server**

```env
SUPABASE_URL=
SUPABASE_SERVICE_ROLE_KEY=
```

**Client**

```env
VITE_SUPABASE_URL=
VITE_SUPABASE_ANON_KEY=
```

---

### 4. Configure a IA (Opcional)

Caso queira utilizar o lançamento por comprovante:

Crie uma chave gratuita no Google AI Studio.

```env
GEMINI_API_KEY=
```

---

## ▶️ Executando o projeto

### Back-end

```bash
cd server

pnpm install

pnpm dev
```

Servidor:

```
http://localhost:4000
```

---

### Front-end

```bash
cd client

pnpm install

pnpm dev
```

Aplicação:

```
http://localhost:5173
```

---

## 📝 Como utilizar

1. Crie uma conta.
2. Cadastre suas contas bancárias ou carteiras.
3. Cadastre categorias de receitas e despesas.
4. Registre seus lançamentos.
5. Acompanhe seus resultados pelo Dashboard.

---

## 🛣️ Roadmap

- ✅ Estrutura inicial
- ✅ Autenticação com Supabase
- ✅ CRUD de Contas
- ✅ CRUD de Categorias
- ✅ CRUD de Lançamentos
- ✅ Dashboard Financeiro
- ✅ Integração com Google Gemini
- ⏳ Melhorias de UI/UX
- ⏳ Responsividade Mobile
- ⏳ Relatórios avançados

---

## 👨‍💻 Autor

Desenvolvido por **Ricardo Canuto**.

Desenvolvedor Full Stack JavaScript focado na criação de aplicações modernas utilizando React, Node.js e MongoDB.

---

⭐ Se este projeto foi útil para você, deixe uma estrela no repositório.