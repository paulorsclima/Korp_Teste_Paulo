# Sistema de Emiss\u00e3o de Notas Fiscais - Korp

## Vis\u00e3o Geral
Sistema de emiss\u00e3o de notas fiscais desenvolvido com arquitetura de microsservi\u00e7os utilizando Angular no frontend e C# (.NET 8) no backend.

[![.NET](https://img.shields.io/badge/.NET-8.0-512BD4?logo=dotnet)](https://dotnet.microsoft.com)
[![Angular](https://img.shields.io/badge/Angular-17-DD0031?logo=angular)](https://angular.io)
[![SQL Server](https://img.shields.io/badge/SQL%20Server-Azure-CC2927?logo=microsoft-sql-server)](https://azure.microsoft.com)

## 🏗️ Arquitetura

### Microsservi\u00e7os
- **Servi\u00e7o de Estoque** (porta 5001): Controle de produtos e saldos
- **Servi\u00e7o de Faturamento** (porta 5002): Gest\u00e3o de notas fiscais

### Frontend
- **Angular 17+** com Angular Material

### Banco de Dados
- **SQL Server** (Azure)

## ✨ Funcionalidades

### Cadastro de Produtos
- C\u00f3digo
- Descri\u00e7\u00e3o (nome do produto)
- Saldo (quantidade dispon\u00edvel em estoque)

### Cadastro de Notas Fiscais
- Numera\u00e7\u00e3o sequencial autom\u00e1tica
- Status: Aberta ou Fechada
- Inclus\u00e3o de m\u00faltiplos produtos com respectivas quantidades

### Impress\u00e3o de Notas Fiscais
- Bot\u00e3o de impress\u00e3o vis\u00edvel e intuitivo
- Indicador de processamento
- Atualiza\u00e7\u00e3o de status para Fechada ap\u00f3s impress\u00e3o
- Atualiza\u00e7\u00e3o autom\u00e1tica do saldo dos produtos

## 🛠️ Requisitos T\u00e9cnicos

### Backend
- .NET 8
- Entity Framework Core
- SQL Server
- Polly (para tratamento de falhas e retry)

### Frontend
- Angular 17+
- Angular Material
- RxJS

## 🚀 Como Executar

### Pr\u00e9-requisitos
- .NET 8 SDK
- Node.js 18+
- SQL Server (Azure ou local)

### Configura\u00e7\u00e3o do Banco de Dados

1. Crie um banco de dados no Azure SQL chamado `KorpTeste`
2. Atualize as connection strings nos arquivos:
   - `backend/StockService/appsettings.json`
   - `backend/InvoicingService/appsettings.json`

```json
"ConnectionStrings": {
  "DefaultConnection": "Server=tcp:SEU_SERVIDOR.database.windows.net,1433;Database=KorpTeste;User ID=SEU_USUARIO@SEU_SERVIDOR;Password=SUA_SENHA;Encrypt=True;TrustServerCertificate=False;"
}
```

### Backend

```bash
# Servi\u00e7o de Estoque
cd backend/StockService
dotnet restore
dotnet ef database update
dotnet run --urls="http://localhost:5001"

# Servi\u00e7o de Faturamento (outro terminal)
cd backend/InvoicingService
dotnet restore
dotnet ef database update
dotnet run --urls="http://localhost:5002"
```

### Frontend

```bash
cd frontend
npm install
ng serve
```

Acesse: http://localhost:4200

## 📦 Tratamento de Falhas

O sistema implementa tratamento de falhas utilizando **Polly** para retry e circuit breaker nos microsservi\u00e7os:

```csharp
static IAsyncPolicy<HttpResponseMessage> GetRetryPolicy()
{
    return HttpPolicyExtensions
        .HandleTransientHttpError()
        .WaitAndRetryAsync(3, retryAttempt => TimeSpan.FromSeconds(Math.Pow(2, retryAttempt)));
}
```

## 📝 Detalhamento T\u00e9cnico

### Ciclos de Vida do Angular
- **OnInit**: Utilizado em `ProductListComponent` e `InvoiceListComponent` para carregar dados ao inicializar

### RxJS
- Observables do `HttpClient` para chamadas HTTP
- Subscriptions com tratamento de erro

### Bibliotecas

#### Frontend
- **@angular/material**: Componentes visuais (toolbar, cards, tables, forms, buttons, dialogs, snackbars, icons)
- **@angular/cdk**: Infraestrutura de componentes
- **rxjs**: Programa\u00e7\u00e3o reativa

#### Backend
- **Entity Framework Core**: ORM para acesso ao banco de dados
- **Polly**: Tratamento de falhas e resilience
- **Swashbuckle**: Swagger/OpenAPI

### Gerenciamento de Depend\u00eancias (C#)
- **NuGet**: Package manager
- **csproj**: Arquivo de projeto com depend\u00eancias

### LINQ
Utilizado extensivamente para consultas:
```csharp
await db.Products.OrderBy(p => p.Description).ToListAsync()
await db.Products.AnyAsync(p => p.Code == product.Code)
await db.Invoices.Include(i => i.Items).FirstOrDefaultAsync(i => i.Id == id)
```

## 👨‍💻 Autor

**Paulo Ricardo S C Lima**
- GitHub: [@paulorsclima](https://github.com/paulorsclima)
- LinkedIn: [linkedin.com/in/paulo-ricardo-cardoso-a134131a6](http://www.linkedin.com/in/paulo-ricardo-cardoso-a134131a6)
- Email: paulo.rsclima@gmail.com

## 📄 Licen\u00e7a

Projeto desenvolvido para processo seletivo - Korp
