using Microsoft.EntityFrameworkCore;
using InvoicingService.Data;
using InvoicingService.Models;
using Polly;
using Polly.Extensions.Http;

var builder = WebApplication.CreateBuilder(args);

builder.Services.AddCors(options =>
{
    options.AddPolicy("FrontendPolicy", policy =>
    {
        policy.WithOrigins("http://localhost:4200")
              .AllowAnyHeader()
              .AllowAnyMethod();
    });
});

builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();

builder.Services.AddDbContext<InvoicingDbContext>(options =>
    options.UseSqlServer(
        builder.Configuration.GetConnectionString("DefaultConnection")
    )
);

// HTTP client for Stock Service with Polly resilience
builder.Services.AddHttpClient<IStockService, StockService>(client =>
{
    client.BaseAddress = new Uri("http://localhost:5001");
})
.AddPolicyHandler(GetRetryPolicy());

var app = builder.Build();

app.UseSwagger();
app.UseSwaggerUI();

app.UseCors("FrontendPolicy");

app.UseHttpsRedirection();

// GET all invoices
app.MapGet("/api/invoices", async (InvoicingDbContext db) =>
    await db.Invoices
        .Include(i => i.Items)
        .OrderByDescending(i => i.CreatedAt)
        .ToListAsync())
    .WithName("GetInvoices")
    .WithOpenApi();

// GET invoice by ID
app.MapGet("/api/invoices/{id}", async (int id, InvoicingDbContext db) =>
    await db.Invoices
        .Include(i => i.Items)
        .FirstOrDefaultAsync(i => i.Id == id))
    .WithName("GetInvoice")
    .WithOpenApi();

// CREATE invoice
app.MapPost("/api/invoices", async (
    Invoice invoice,
    InvoicingDbContext db
) =>
{
    var lastInvoice = await db.Invoices
        .OrderByDescending(i => i.SequentialNumber)
        .FirstOrDefaultAsync();

    invoice.SequentialNumber = lastInvoice is not null
        ? lastInvoice.SequentialNumber + 1
        : 1;

    invoice.Status = "Aberta";
    invoice.CreatedAt = DateTime.UtcNow;
    invoice.Items ??= new List<InvoiceItem>();

    db.Invoices.Add(invoice);
    await db.SaveChangesAsync();

    return Results.Created($"/api/invoices/{invoice.Id}", invoice);
})
.WithName("CreateInvoice")
.WithOpenApi();

// ADD item to invoice
app.MapPost("/api/invoices/{id}/items", async (
    int id,
    InvoiceItem item,
    InvoicingDbContext db,
    IStockService stockService
) =>
{
    var invoice = await db.Invoices
        .Include(i => i.Items)
        .FirstOrDefaultAsync(i => i.Id == id);

    if (invoice is null)
        return Results.NotFound("Invoice not found");

    if (invoice.Status != "Aberta")
        return Results.BadRequest("Cannot add items to closed invoice");

    if (item.Quantity <= 0)
        return Results.BadRequest("Quantity must be greater than zero");

    try
    {
        var product = await stockService.GetProductAsync(item.ProductId);

        if (product is null)
            return Results.NotFound("Product not found");

        if (product.Balance < item.Quantity)
            return Results.BadRequest("Insufficient product balance");

        item.Id = 0;
        item.InvoiceId = invoice.Id;
        item.Invoice = invoice;

        invoice.Items.Add(item);

        await db.SaveChangesAsync();

        return Results.Ok(invoice);
    }
    catch (Exception ex)
    {
        return Results.Problem(
            $"Stock service unavailable: {ex.Message}"
        );
    }
})
.WithName("AddInvoiceItem")
.WithOpenApi();

// CLOSE invoice (print) - updates stock balance
app.MapPost("/api/invoices/{id}/close", async (
    int id,
    InvoicingDbContext db,
    IStockService stockService
) =>
{
    var invoice = await db.Invoices
        .Include(i => i.Items)
        .FirstOrDefaultAsync(i => i.Id == id);

    if (invoice is null)
        return Results.NotFound("Invoice not found");

    if (invoice.Status != "Aberta")
        return Results.BadRequest("Invoice already closed");

    if (invoice.Items.Count == 0)
        return Results.BadRequest("Invoice must contain at least one item");

    try
    {
        foreach (var item in invoice.Items)
        {
            await stockService.UpdateBalanceAsync(
                item.ProductId,
                item.Quantity
            );
        }

        invoice.Status = "Fechada";
        invoice.ClosedAt = DateTime.UtcNow;

        await db.SaveChangesAsync();

        return Results.Ok(invoice);
    }
    catch (Exception ex)
    {
        return Results.Problem(
            $"Failed to close invoice: {ex.Message}"
        );
    }
})
.WithName("CloseInvoice")
.WithOpenApi();

app.Run();

static IAsyncPolicy<HttpResponseMessage> GetRetryPolicy()
{
    return HttpPolicyExtensions
        .HandleTransientHttpError()
        .WaitAndRetryAsync(
            3,
            retryAttempt => TimeSpan.FromSeconds(Math.Pow(2, retryAttempt))
        );
}

public interface IStockService
{
    Task<dynamic?> GetProductAsync(int productId);
    Task UpdateBalanceAsync(int productId, int quantity);
}

public class StockService(HttpClient client) : IStockService
{
    public async Task<dynamic?> GetProductAsync(int productId)
    {
        var response = await client.GetAsync($"/api/products/{productId}");
        response.EnsureSuccessStatusCode();

        return await response.Content.ReadFromJsonAsync<dynamic>();
    }

    public async Task UpdateBalanceAsync(int productId, int quantity)
    {
        var response = await client.PutAsync(
            $"/api/products/{productId}/balance?quantity={quantity}",
            null
        );

        response.EnsureSuccessStatusCode();
    }
}