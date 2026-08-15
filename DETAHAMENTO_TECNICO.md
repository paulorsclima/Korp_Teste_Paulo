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

## Ciclos de Vida do Angular Utilizados

### OnInit

Utilizado em ambos os componentes principais para carregar dados ao inicializar:

```typescript
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

**Por que OnInit?**
- Garante que o componente esteja totalmente inicializado antes de fazer chamadas HTTP
- Permite carregar dados assim que o componente \u00e9 renderizado
- \u00c9 o lifecycle hook mais adequado para inicializa\u00e7\u00e3o de dados

## Uso de RxJS

### Observables do HttpClient

O Angular utiliza RxJS nativamente no `HttpClient`:

```typescript
// Service
getProducts(): Observable<Product[]> {
  return this.http.get<Product[]>(`${this.stockApiUrl}/products`);
}

// Component - Subscription
this.apiService.getProducts().subscribe({
  next: (data) => this.products = data,
  error: (err) => this.handleError(err)
});
```

### Benef\u00edcios do RxJS

1. **Programa\u00e7\u00e3o Ass\u00edncrona**: Lida com opera\u00e7\u00f5es ass\u00edncronas de forma elegante
2. **Tratamento de Erros**: Centralizado no callback `error`
3. **Cancelamento**: Pode cancelar subscriptions quando o componente \u00e9 destru\u00eddo
4. **Operadores**: Pode usar operadores como `map`, `filter`, `retry`, etc.

## Bibliotecas Utilizadas

### Frontend

| Biblioteca | Vers\u00e3o | Finalidade |
|------------|--------|------------|
| @angular/core | 17.x | Framework principal |
| @angular/material | 17.x | Componentes UI (Material Design) |
| @angular/cdk | 17.x | Component Dev Kit (infraestrutura) |
| rxjs | 7.8.x | Programa\u00e7\u00e3o reativa |
| zone.js | 0.14.x | Change detection |

### Backend

| Biblioteca | Vers\u00e3o | Finalidade |
|------------|--------|------------|
| Microsoft.AspNetCore.OpenApi | 8.0.0 | Documenta\u00e7\u00e3o OpenAPI/Swagger |
| Microsoft.EntityFrameworkCore.SqlServer | 8.0.0 | ORM para SQL Server |
| Swashbuckle.AspNetCore | 6.5.0 | Swagger UI |
| Polly | 8.2.0 | Resilience e tratamento de falhas |
| Polly.Extensions.Http | 3.0.0 | Extens\u00f5es HTTP para Polly |

## Gerenciamento de Depend\u00eancias

### C# (.NET)

No .NET, o gerenciamento \u00e9 feito via **NuGet**:

**Arquivo .csproj:**
```xml
<Project Sdk="Microsoft.NET.Sdk.Web">
  <ItemGroup>
    <PackageReference Include="Polly" Version="8.2.0" />
    <PackageReference Include="Microsoft.EntityFrameworkCore.SqlServer" Version="8.0.0" />
  </ItemGroup>
</Project>
```

**Comandos:**
```bash
dotnet restore  # Restaura pacotes
dotnet add package Polly  # Adiciona pacote
dotnet remove package Polly  # Remove pacote
```

### Angular/TypeScript

No frontend, usamos **npm**:

**Arquivo package.json:**
```json
{
  "dependencies": {
    "@angular/material": "^17.0.0",
    "rxjs": "~7.8.0"
  }
}
```

**Comandos:**
```bash
npm install  # Instala depend\u00eancias
npm install @angular/material  # Adiciona pacote
npm uninstall @angular/material  # Remove pacote
```

## Tratamento de Erros e Exce\u00e7\u00f5es

### Backend - Try-Catch

```csharp
app.MapPost("/api/invoices/{id}/close", async (int id, InvoicingDbContext db, IStockService stockService) => 
{
    var invoice = await db.Invoices.Include(i => i.Items).FirstOrDefaultAsync(i => i.Id == id);
    if (invoice is null)
        return Results.NotFound();
    
    try
    {
        foreach (var item in invoice.Items)
        {
            await stockService.UpdateBalanceAsync(item.ProductId, item.Quantity);
        }
        
        invoice.Status = "Fechada";
        await db.SaveChangesAsync();
        
        return Results.Ok(invoice);
    }
    catch (Exception ex)
    {
        return Results.Problem($"Failed to close invoice: {ex.Message}");
    }
});
```

### Backend - Valida\u00e7\u00f5es

```csharp
// Valida\u00e7\u00e3o de exist\u00eancia
if (product is null)
    return Results.NotFound("Product not found");

// Valida\u00e7\u00e3o de regra de neg\u00f3cio
if (product.Balance < quantity)
    return Results.BadRequest("Insufficient balance");

// Valida\u00e7\u00e3o de unicidade
if (await db.Products.AnyAsync(p => p.Code == product.Code))
    return Results.BadRequest("Product code already exists");
```

### Backend - Polly (Resilience)

```csharp
static IAsyncPolicy<HttpResponseMessage> GetRetryPolicy()
{
    return HttpPolicyExtensions
        .HandleTransientHttpError()
        .WaitAndRetryAsync(3, retryAttempt => TimeSpan.FromSeconds(Math.Pow(2, retryAttempt)));
}
```

**O que faz:**
- Detecta erros HTTP transit\u00f3rios (5xx, 408, etc.)
- Tenta novamente 3 vezes
- Usa backoff exponencial (2s, 4s, 8s)

### Frontend - Tratamento de Erros

```typescript
this.apiService.getProducts().subscribe({
  next: (data) => {
    this.products = data;
    this.loading = false;
  },
  error: () => {
    this.snackBar.open('Erro ao carregar produtos', 'Fechar', { duration: 3000 });
    this.loading = false;
  }
});
```

## Uso de LINQ

### Consultas com LINQ

```csharp
// Ordena\u00e7\u00e3o
await db.Products.OrderBy(p => p.Description).ToListAsync()

// Filtro com Any
await db.Products.AnyAsync(p => p.Code == product.Code)

// Busca por ID
await db.Products.FindAsync(id)

// Ordena\u00e7\u00e3o descendente
await db.Invoices.OrderByDescending(i => i.CreatedAt).ToListAsync()

// Include para eager loading (JOIN)
await db.Invoices
    .Include(i => i.Items)
    .FirstOrDefaultAsync(i => i.Id == id)

// Proje\u00e7\u00e3o (Select)
var products = await db.Products
    .Where(p => p.Balance > 0)
    .Select(p => new { p.Code, p.Description })
    .ToListAsync();
```

### Benef\u00edcios do LINQ

1. **Type Safety**: Erros s\u00e3o detectados em tempo de compila\u00e7\u00e3o
2. **IntelliSense**: Autocompletar no IDE
3. **Composi\u00e7\u00e3o**: Pode encadear m\u00faltiplas opera\u00e7\u00f5es
4. **Performance**: EF Core traduz para SQL otimizado

## Componentes Visuais (Angular Material)

### Utilizados

| Componente | Uso |
|------------|-----|
| MatToolbar | Barra de navega\u00e7\u00e3o superior |
| MatCard | Cards para agrupar conte\u00fado |
| MatTable | Tabelas para listagem |
| MatFormField + MatInput | Campos de formul\u00e1rio |
| MatButtonModule | Bot\u00f5es |
| MatIconModule | \u00cdcones |
| MatSnackBar | Notifica\u00e7\u00f5es toast |
| MatProgressSpinner | Loading spinner |
| MatChip | Badges de status |

### Exemplo de Uso

```typescript
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';

@Component({
  standalone: true,
  imports: [MatCardModule, MatButtonModule],
  template: `
    <mat-card>
      <mat-card-header>
        <mat-card-title>T\u00edtulo</mat-card-title>
      </mat-card-header>
      <mat-card-content>
        <button mat-raised-button color="primary">A\u00e7\u00e3o</button>
      </mat-card-content>
    </mat-card>
  `
})
export class MyComponent {}
```

## Tratamento de Falhas entre Microsservi\u00e7os

### Cen\u00e1rio Implementado

O sistema implementa tratamento de falhas quando o **Invoicing Service** tenta comunicar com o **Stock Service**:

```csharp
// Invoicing Service chama Stock Service
try
{
    var product = await stockService.GetProductAsync(item.ProductId);
    if (product == null)
        return Results.NotFound("Product not found");
    
    invoice.Items.Add(item);
    await db.SaveChangesAsync();
    
    return Results.Ok(invoice);
}
catch (Exception ex)
{
    return Results.Problem($"Stock service unavailable: {ex.Message}");
}
```

### Feedback ao Usu\u00e1rio

O frontend trata o erro e mostra mensagem clara:

```typescript
error: () => {
  this.snackBar.open('Erro ao processar opera\u00e7\u00e3o - servi\u00e7o indispon\u00edvel', 'Fechar');
}
```

## Seguran\u00e7a

### Valida\u00e7\u00f5es Implementadas

1. **Valida\u00e7\u00e3o de Entrada**: Todos os campos s\u00e3o validados
2. **Valida\u00e7\u00e3o de Regras de Neg\u00f3cio**: Saldo insuficiente, status inv\u00e1lido, etc.
3. **Tratamento de Erros**: Mensagens gen\u00e9ricas para n\u00e3o expor detalhes internos

### Melhorias Futuras

- [ ] Autentica\u00e7\u00e3o e Autoriza\u00e7\u00e3o (JWT)
- [ ] Rate limiting
- [ ] Valida\u00e7\u00e3o de schema (FluentValidation)
- [ ] Logging estruturado (Serilog)

## Performance

### Otimiza\u00e7\u00f5es Implementadas

1. **Eager Loading**: Usa `Include()` para evitar N+1 queries
2. \u00cdndices: \u00cdndices \u00fanicos em c\u00f3digo de produto e n\u00famero sequencial
3. **Async/Await**: Todas as opera\u00e7\u00f5es de I/O s\u00e3o ass\u00edncronas

## Conclus\u00e3o

O sistema demonstra:
- ✅ Arquitetura de microsservi\u00e7os
- ✅ Comunica\u00e7\u00e3o entre servi\u00e7os com resili\u00eancia
- ✅ Uso adequado de Angular lifecycle hooks
- ✅ RxJS para programa\u00e7\u00e3o reativa
- ✅ LINQ para consultas eficientes
- ✅ Tratamento robusto de erros e exce\u00e7\u00f5es
- ✅ Componentes visuais modernos com Angular Material
