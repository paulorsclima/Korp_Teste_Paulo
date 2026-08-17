# 📝 Detalhamento T\u00e9cnico

## Arquitetura do Sistema

### Microsservi\u00e7os

```
┌─────────────────┐         ┌─────────────────┐
│   Frontend      │         │   Frontend      │
│   Angular 17    │         │   Angular 17    │
└────────┬────────┘         └────────┬────────┘
         │                          │
         │ HTTP                     │ HTTP
         │                          │
┌────────▼────────┐         ┌───────▼────────┐
│ Stock Service   │◄────────│ Invoicing      │
│ Port: 5001      │         │ Service        │
│                 │         │ Port: 5002     │
└────────┬────────┘         └───────┬────────┘
         │                          │
         └──────────┬───────────────┘
                    │
           ┌────────▼────────┐
           │  SQL Server     │
           │  (Azure)        │
           └─────────────────┘
```

Ciclos de vida do Angular utilizados
OnInit
Utilizado nos principais componentes para carregar os dados durante a inicialização:
```
typescript
export class ProductListComponent implements OnInit {
  ngOnInit(): void {
    this.loadProducts();
  }

  loadProducts(): void {
    this.apiService.getProducts().subscribe({
      next: (data) => this.products = data,
      error: () => this.handleError()
    });
  }
}
```
Por que utilizar OnInit?

Garante que o componente esteja inicializado antes de realizar chamadas HTTP.

Permite carregar os dados assim que o componente é renderizado.

É o ciclo de vida adequado para a inicialização dos dados.

Uso de RxJS
Observables do HttpClient
O Angular utiliza RxJS nativamente no HttpClient:

typescript
// Service
getProducts(): Observable<Product[]> {
  return this.http.get<Product[]>(`${this.stockApiUrl}/products`);
}

// Component - Subscription
this.apiService.getProducts().subscribe({
  next: (data) => this.products = data,
  error: (err) => this.handleError(err)
});

Benefícios do RxJS
Programação assíncrona: gerencia operações assíncronas de forma eficiente.

Tratamento de erros: permite centralizar o tratamento no callback error.

Cancelamento: possibilita cancelar subscriptions quando o componente é destruído.

Operadores: permite utilizar operadores como map, filter e retry.
```
Bibliotecas utilizadas
Frontend
Biblioteca	Versão	Finalidade
@angular/core	17.x	Framework principal.
@angular/material	17.x	Componentes de interface baseados no Material Design.
@angular/cdk	17.x	Infraestrutura para componentes do Angular Material.
rxjs	7.8.x	Programação reativa.
zone.js	0.14.x	Detecção de alterações.
Backend
Biblioteca	Versão	Finalidade
Microsoft.AspNetCore.OpenApi	8.0.0	Documentação OpenAPI/Swagger.
Microsoft.EntityFrameworkCore.SqlServer	8.0.0	ORM para SQL Server.
Swashbuckle.AspNetCore	6.5.0	Interface do Swagger.
Polly	8.2.0	Resiliência e tratamento de falhas.
Polly.Extensions.Http	3.0.0	Extensões HTTP para o Polly.
Gerenciamento de dependências
C# (.NET)
No .NET, o gerenciamento de dependências é feito por meio do NuGet.
```
Arquivo .csproj:

xml
<Project Sdk="Microsoft.NET.Sdk.Web">
  <ItemGroup>
    <PackageReference Include="Polly" Version="8.2.0" />
    <PackageReference Include="Microsoft.EntityFrameworkCore.SqlServer" Version="8.0.0" />
  </ItemGroup>
</Project>
Comandos:

bash
dotnet restore                 # Restaura os pacotes
dotnet add package Polly       # Adiciona um pacote
dotnet remove package Polly   # Remove um pacote
Angular/TypeScript
No frontend, o gerenciamento de dependências é feito por meio do npm.

Arquivo package.json:
```
json
{
  "dependencies": {
    "@angular/material": "^17.0.0",
    "rxjs": "~7.8.0"
  }
}
```
Comandos:

bash
npm install                         # Instala as dependências
npm install @angular/material       # Adiciona um pacote
npm uninstall @angular/material     # Remove um pacote
Tratamento de erros e exceções
Backend — Try-Catch
csharp
app.MapPost("/api/invoices/{id}/close", async (
    int id,
    InvoicingDbContext db,
    IStockService stockService) =>
{
    var invoice = await db.Invoices
        .Include(i => i.Items)
        .FirstOrDefaultAsync(i => i.Id == id);

    if (invoice is null)
    {
        return Results.NotFound();
    }

    try
    {
        foreach (var item in invoice.Items)
        {
            await stockService.UpdateBalanceAsync(
                item.ProductId,
                item.Quantity);
        }

        invoice.Status = "Fechada";
        await db.SaveChangesAsync();

        return Results.Ok(invoice);
    }
    catch (Exception ex)
    {
        return Results.Problem(
            $"Failed to close invoice: {ex.Message}");
    }
});
Backend — Validações
csharp
// Validação da existência do produto
if (product is null)
{
    return Results.NotFound("Product not found");
}

// Validação da regra de negócio
if (product.Balance < quantity)
{
    return Results.BadRequest("Insufficient balance");
}

// Validação da unicidade do código do produto
if (await db.Products.AnyAsync(p => p.Code == product.Code))
{
    return Results.BadRequest("Product code already exists");
}
Backend — Polly e resiliência
csharp
static IAsyncPolicy<HttpResponseMessage> GetRetryPolicy()
{
    return HttpPolicyExtensions
        .HandleTransientHttpError()
        .WaitAndRetryAsync(
            3,
            retryAttempt => TimeSpan.FromSeconds(
                Math.Pow(2, retryAttempt)));
}
Essa política:

Detecta erros HTTP transitórios, como respostas 5xx e 408.

Realiza até três novas tentativas de requisição.

Utiliza backoff exponencial, com intervalos de aproximadamente 2, 4 e 8 segundos.

Frontend — Tratamento de erros
typescript
this.apiService.getProducts().subscribe({
  next: (data) => {
    this.products = data;
    this.loading = false;
  },
  error: () => {
    this.snackBar.open(
      'Erro ao carregar produtos',
      'Fechar',
      { duration: 3000 }
    );
    this.loading = false;
  }
});
Uso de LINQ
Consultas com LINQ
csharp
// Ordenação
await db.Products
    .OrderBy(p => p.Description)
    .ToListAsync();

// Filtro com Any
await db.Products
    .AnyAsync(p => p.Code == product.Code);

// Busca por ID
await db.Products.FindAsync(id);

// Ordenação descendente
await db.Invoices
    .OrderByDescending(i => i.CreatedAt)
    .ToListAsync();

// Include para carregamento antecipado
await db.Invoices
    .Include(i => i.Items)
    .FirstOrDefaultAsync(i => i.Id == id);

// Projeção com Select
var products = await db.Products
    .Where(p => p.Balance > 0)
    .Select(p => new
    {
        p.Code,
        p.Description
    })
    .ToListAsync();
Benefícios do LINQ
Segurança de tipos: os erros de tipo podem ser identificados durante a compilação.

IntelliSense: oferece autocompletar e sugestões no ambiente de desenvolvimento.

Composição: permite encadear várias operações em uma única consulta.

Desempenho: o Entity Framework Core traduz as consultas LINQ para SQL e pode executá-las de forma eficiente no banco de dados.

Componentes visuais — Angular Material
Utilizados
Componente	Utilização
MatToolbar	Barra de navegação superior.
MatCard	Cards para agrupamento de conteúdo.
MatTable	Tabelas para listagem de dados.
MatFormField + MatInput	Campos de formulário.
MatButtonModule	Botões de ação.
MatIconModule	Ícones da interface.
MatSnackBar	Notificações rápidas em formato toast.
MatProgressSpinner	Indicador de carregamento.
MatChip	Exibição de status e etiquetas.
Exemplo de uso
typescript
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';

@Component({
  standalone: true,
  imports: [MatCardModule, MatButtonModule],
  template: `
    <mat-card>
      <mat-card-header>
        <mat-card-title>Título</mat-card-title>
      </mat-card-header>

      <mat-card-content>
        <button mat-raised-button color="primary">
          Ação
        </button>
      </mat-card-content>
    </mat-card>
  `
})
export class MyComponent {}
Tratamento de falhas entre microsserviços
Cenário implementado
O sistema trata falhas quando o InvoicingService tenta se comunicar com o StockService:

csharp
// InvoicingService chama o StockService
try
{
    var product = await stockService
        .GetProductAsync(item.ProductId);

    if (product is null)
    {
        return Results.NotFound("Product not found");
    }

    invoice.Items.Add(item);
    await db.SaveChangesAsync();

    return Results.Ok(invoice);
}
catch (Exception ex)
{
    return Results.Problem(
        $"Stock service unavailable: {ex.Message}");
}
Feedback ao usuário
O frontend trata o erro e exibe uma mensagem clara:

typescript
error: () => {
  this.snackBar.open(
    'Erro ao processar a operação: serviço indisponível',
    'Fechar'
  );
}
Segurança
Validações implementadas
Validação de entrada: os campos recebidos são validados antes do processamento.

Validação das regras de negócio: são verificadas situações como saldo insuficiente e status inválido.

Tratamento de erros: são retornadas mensagens genéricas para evitar a exposição de detalhes internos da aplicação.

Melhorias futuras
Implementação de autenticação e autorização com JWT.

Implementação de controle de limite de requisições (rate limiting).

Validação de dados utilizando FluentValidation.

Implementação de logging estruturado com Serilog.

Performance
Otimizações implementadas
Eager Loading: utilização de Include() para carregar dados relacionados e evitar consultas desnecessárias.

Índices: criação de índices únicos para o código do produto e a numeração sequencial das notas.

Async/Await: execução assíncrona das operações de entrada e saída de dados (I/O).

Conclusão
O sistema demonstra:

✅ Arquitetura baseada em microsserviços.

✅ Comunicação resiliente entre os serviços.

✅ Uso adequado dos ciclos de vida do Angular.

✅ Utilização do RxJS para programação reativa.

✅ Uso de LINQ para consultas eficientes.

✅ Tratamento consistente de erros e exceções.

✅ Componentes visuais modernos desenvolvidos com Angular Material.
