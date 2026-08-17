# ⚡ Quick Start - Comece Agora!

## 📋 Checklist Rapido

### 1. Instalar Ferramentas (10 min)

```bash
# .NET 8 SDK
https://dotnet.microsoft.com/download

# Node.js 18+
https://nodejs.org

# Angular CLI (no terminal)
npm install -g @angular/cli@17
```

### 2. Configurar Banco (5 min)

**Operação A - Azure SQL (Recomendado)**
- Use seu banco existente no Azure
- Crie um database chamado `KorpTeste`

**Operação B - Local (Mais rápido)**
Utilize o LocalDB, que já vem incluído no Visual Studio.
- Não precisa configurar nada!

### 3. Atualizar Connection String (2 min)

Edite `backend/StockService/appsettings.json`:

```json
"DefaultConnection": "Server=tcp:SEU_SERVIDOR.database.windows.net,1433;Database=KorpTeste;User ID=SEU_USUARIO;Password=SUA_SENHA;"
```

> **Dica:** Para desenvolvimento local, pode usar a config padr\u00e3o do `appsettings.Development.json`

### 4. Rodar Backend (5 min)

**Terminal 1:**
```bash
cd backend/StockService
dotnet restore
dotnet ef database update
dotnet run --urls="http://localhost:5001"
```

**Terminal 2:**
```bash
cd backend/InvoicingService
dotnet restore
dotnet ef database update
dotnet run --urls="http://localhost:5002"
```

### 5. Rodar Frontend (5 min)

**Terminal 3:**
```bash
cd frontend
npm install
ng serve
```

Acesse: **http://localhost:4200**

## ✅ Pronto!

Agora você pode:

1. **Cadastrar produtos** em http://localhost:4200/products
2. **Criar notas fiscais** em http://localhost:4200/invoices
3. **Imprimir notas** e ver o estoque atualizar


## Duvidas?

- Veja o `README.md` para detalhes
- Consulte o `DETAHAMENTO_TECNICO.md` para explicações tecnicas
- Teste as APIs em:
  - Stock: http://localhost:5001/swagger
  - Invoice: http://localhost:5002/swagger
