# 🚀 Guia de Setup R\u00e1pido

## Pr\u00e9-requisitos

1. **.NET 8 SDK** - https://dotnet.microsoft.com/download
2. **Node.js 18+** - https://nodejs.org
3. **Angular CLI** - `npm install -g @angular/cli@17`
4. **SQL Server** - Azure SQL ou SQL Server Local

## Passo 1 - Configurar Banco de Dados

### Op\u00e7\u00e3o A: Azure SQL (Recomendado)

1. Acesse https://portal.azure.com
2. Crie um SQL Database chamado `KorpTeste`
3. Anote as credenciais:
   - Server: `seu-servidor.database.windows.net`
   - Database: `KorpTeste`
   - Username: `seu-usuario`
   - Password: `sua-senha`

### Op\u00e7\u00e3o B: SQL Server Local (Desenvolvimento)

J\u00e1 configurado para usar LocalDB. Pule para o Passo 2.

## Passo 2 - Atualizar Connection Strings

### Backend - Stock Service

Edite `backend/StockService/appsettings.json`:

```json
"ConnectionStrings": {
  "DefaultConnection": "Server=tcp:SEU_SERVIDOR.database.windows.net,1433;Database=KorpTeste;User ID=SEU_USUARIO@SEU_SERVIDOR;Password=SUA_SENHA;Encrypt=True;TrustServerCertificate=False;"
}
```

### Backend - Invoicing Service

Edite `backend/InvoicingService/appsettings.json` com a mesma connection string.

## Passo 3 - Rodar Backend

### Terminal 1 - Stock Service

```bash
cd backend/StockService
dotnet restore
dotnet ef database update
dotnet run --urls="http://localhost:5001"
```

Acesse: http://localhost:5001/swagger

### Terminal 2 - Invoicing Service

```bash
cd backend/InvoicingService
dotnet restore
dotnet ef database update
dotnet run --urls="http://localhost:5002"
```

Acesse: http://localhost:5002/swagger

## Passo 4 - Rodar Frontend

### Terminal 3 - Frontend

```bash
cd frontend
npm install
ng serve
```

Acesse: http://localhost:4200

## ✅ Testando

1. **Cadastro de Produtos:**
   - Acesse http://localhost:4200
   - Cadastre produtos com c\u00f3digo, descri\u00e7\u00e3o e saldo

2. **Notas Fiscais:**
   - Clique em "Notas Fiscais"
   - Clique em "Nova Nota Fiscal"
   - Clique em "Imprimir" para fechar a nota

3. **Verifica\u00e7\u00e3o:**
   - Volte em "Produtos"
   - Verifique se o saldo foi atualizado

## 🐛 Problemas Comuns

### Erro: "The target framework 'net8.0' is not installed"
- Instale .NET 8 SDK

### Erro: "npm ERR! code ENOENT"
- Certifique-se de estar no diret\u00f3rio `frontend`
- Execute `npm install`

### Erro: "Cannot connect to database"
- Verifique a connection string
- Confira se o SQL Server est\u00e1 acess\u00edvel

### Erro: "Port 5001 already in use"
- Outro processo est\u00e1 usando a porta
- Mude a porta em `Program.cs` ou feche o processo

## 📞 Suporte

Em caso de d\u00favidas, consulte o README.md ou abra uma issue.
