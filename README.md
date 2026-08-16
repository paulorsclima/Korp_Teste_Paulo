# Sistema de Emisssão de Notas Fiscais - Korp

## Visão Geral
Sistema de emissão de notas fiscais desenvolvido com arquitetura de microsserviços utilizando Angular no frontend e C# (.NET 8) no backend.

[![.NET](https://img.shields.io/badge/.NET-8.0-512BD4?logo=dotnet)](https://dotnet.microsoft.com)
[![Angular](https://img.shields.io/badge/Angular-17-DD0031?logo=angular)](https://angular.io)
[![SQL Server](https://img.shields.io/badge/SQL%20Server-Azure-CC2927?logo=microsoft-sql-server)](https://azure.microsoft.com)

## 🏗️ Arquitetura

### Microsservi\u00e7os
- **Serviço de Estoque** (porta 5001): Controle de produtos e saldos
- **Serviço de Faturamento** (porta 5002): Gest\u00e3o de notas fiscais

### Frontend
- **Angular 17+** com Angular Material

### Banco de Dados
- **SQL Server** (Azure)

## ✨ Funcionalidades

### Cadastro de Produtos
- Código
- Descrição (nome do produto)
- Saldo (quantidade disponivel em estoque)

### Cadastro de Notas Fiscais
- Numeração sequencial automatica
- Status: Aberta ou Fechada
- Inclusão de multiplos produtos com respectivas quantidades

### Impressão de Notas Fiscais
- Botão de impressão visual e intuitivo
- Indicador de processamento
- Atualização de status para Fechada após impressão
- Atualização automatica do saldo dos produtos

## 🛠️ Requisitos Técnicos

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

### Pre-requisitos
- .NET 8 SDK
- Node.js 18+
- SQL Server (Azure ou local)

### Configuração do Banco de Dados

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
# Serviço de Estoque
cd backend/StockService
dotnet restore
dotnet ef database update
dotnet run --urls="http://localhost:5001"

# Serviço de Faturamento (outro terminal)
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

O sistema implementa tratamento de falhas utilizando **Polly** para retry e circuit breaker nos microsserviços:

```csharp
static IAsyncPolicy<HttpResponseMessage> GetRetryPolicy()
{
    return HttpPolicyExtensions
        .HandleTransientHttpError()
        .WaitAndRetryAsync(3, retryAttempt => TimeSpan.FromSeconds(Math.Pow(2, retryAttempt)));
}
```

## 📝 Detalhamento Tecnico

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

### Gerenciamento de Dependencias (C#)
- **NuGet**: Package manager
- **csproj**: Arquivo de projeto com dependencias

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

## 📄 Licença

Projeto desenvolvido para processo seletivo - Korp
