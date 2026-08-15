# ⚡ Quick Start - Comece Agora!

## 📋 Checklist R\u00e1pido

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

**Op\u00e7\u00e3o A - Azure SQL (Recomendado)**
- Use seu banco existente no Azure
- Crie um database chamado `KorpTeste`

**Op\u00e7\u00e3o B - Local (Mais r\u00e1pido)**
- Use LocalDB (j\u00e1 vem com Visual Studio)
- N\u00e3o precisa configurar nada!

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

Agora voc\u00ea pode:

1. **Cadastrar produtos** em http://localhost:4200/products
2. **Criar notas fiscais** em http://localhost:4200/invoices
3. **Imprimir notas** e ver o estoque atualizar

## 🎯 Pr\u00f3ximos Passos

1. Teste todo o fluxo
2. Adicione mais funcionalidades (opcional)
3. Grave o v\u00eddeo de apresenta\u00e7\u00e3o
4. Envie para rh@korp.com.br

## 📞 D\u00favidas?

- Veja o `README.md` para detalhes
- Consulte o `DETAHAMENTO_TECNICO.md` para explica\u00e7\u00f5es t\u00e9cnicas
- Teste as APIs em:
  - Stock: http://localhost:5001/swagger
  - Invoice: http://localhost:5002/swagger

Boa sorte! 🚀
