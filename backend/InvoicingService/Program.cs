using System.Net.Http.Json;
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
        policy
            .WithOrigins("http://localhost:4200")
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

app.MapGet("/api/invoices", async (InvoicingDbContext db) =>
{
    var invoices = await db.Invoices
        .AsNoTracking()
        .Include(invoice => invoice.Items)
        .OrderByDescending(invoice => invoice.CreatedAt)
        .Select(invoice => new
        {
            invoice.Id,
            invoice.SequentialNumber,
            invoice.Status,
            invoice.CreatedAt,
            invoice.ClosedAt,
            Items = invoice.Items
                .Select(item => new
                {
                    item.Id,
                    item.InvoiceId,
                    item.ProductId,
                    item.Quantity
                })
                .ToList()
        })
        .ToListAsync();

    return Results.Ok(invoices);
})
.WithName("GetInvoices")
.WithOpenApi();

app.MapGet("/api/invoices/{id}", async (
    int id,
    InvoicingDbContext db
) =>
{
    var invoice = await db.Invoices
        .AsNoTracking()
        .Include(invoice => invoice.Items)
        .Where(invoice => invoice.Id == id)
        .Select(invoice => new
        {
            invoice.Id,
            invoice.SequentialNumber,
            invoice.Status,
            invoice.CreatedAt,
            invoice.ClosedAt,
            Items = invoice.Items
                .Select(item => new
                {
                    item.Id,
                    item.InvoiceId,
                    item.ProductId,
                    item.Quantity
                })
                .ToList()
        })
        .FirstOrDefaultAsync();

    return invoice is null
        ? Results.NotFound("Invoice not found")
        : Results.Ok(invoice);
})
.WithName("GetInvoice")
.WithOpenApi();

app.MapPost("/api/invoices", async (
    Invoice invoice,
    InvoicingDbContext db
) =>
{
    var lastInvoice = await db.Invoices
        .OrderByDescending(invoice => invoice.SequentialNumber)
        .FirstOrDefaultAsync();

    invoice.SequentialNumber = lastInvoice is not null
        ? lastInvoice.SequentialNumber + 1
        : 1;

    invoice.Status = "Aberta";
    invoice.CreatedAt = DateTime.UtcNow;
    invoice.Items ??= new List<InvoiceItem>();

    db.Invoices.Add(invoice);
    await db.SaveChangesAsync();

    return Results.Created(
        $"/api/invoices/{invoice.Id}",
        new
        {
            invoice.Id,
            invoice.SequentialNumber,
            invoice.Status,
            invoice.CreatedAt,
            invoice.ClosedAt,
            Items = invoice.Items
                .Select(item => new
                {
                    item.Id,
                    item.InvoiceId,
                    item.ProductId,
                    item.Quantity
                })
                .ToList()
        }
    );
})
.WithName("CreateInvoice")
.WithOpenApi();

app.MapPost("/api/invoices/{id}/items", async (
    int id,
    InvoiceItem item,
    InvoicingDbContext db,
    IStockService stockService
) =>
{
    var invoice = await db.Invoices
        .Include(invoice => invoice.Items)
        .FirstOrDefaultAsync(invoice => invoice.Id == id);

    if (invoice is null)
    {
        return Results.NotFound("Invoice not found");
    }

    if (invoice.Status != "Aberta")
    {
        return Results.BadRequest("Cannot add items to closed invoice");
    }

    if (item.Quantity <= 0)
    {
        return Results.BadRequest("Quantity must be greater than zero");
    }

    try
    {
        var product = await stockService.GetProductAsync(item.ProductId);

        if (product is null)
        {
            return Results.NotFound("Product not found");
        }

        if (product.Balance < item.Quantity)
        {
            return Results.BadRequest("Insufficient product balance");
        }

        item.Id = 0;
        item.InvoiceId = invoice.Id;

        invoice.Items.Add(item);

        await db.SaveChangesAsync();

        return Results.Ok(new
        {
            invoice.Id,
            invoice.SequentialNumber,
            invoice.Status,
            invoice.CreatedAt,
            invoice.ClosedAt,
            Items = invoice.Items
                .Select(invoiceItem => new
                {
                    invoiceItem.Id,
                    invoiceItem.InvoiceId,
                    invoiceItem.ProductId,
                    invoiceItem.Quantity
                })
                .ToList()
        });
    }
    catch (Exception ex)
    {
        return Results.Problem(
            detail: $"Stock service unavailable: {ex.Message}",
            statusCode: StatusCodes.Status503ServiceUnavailable
        );
    }
})
.WithName("AddInvoiceItem")
.WithOpenApi();

app.MapPost("/api/invoices/{id}/close", async (
    int id,
    InvoicingDbContext db,
    IStockService stockService
) =>
{
    var invoice = await db.Invoices
        .Include(invoice => invoice.Items)
        .FirstOrDefaultAsync(invoice => invoice.Id == id);

    if (invoice is null)
    {
        return Results.NotFound("Invoice not found");
    }

    if (invoice.Status != "Aberta")
    {
        return Results.BadRequest("Invoice already closed");
    }

    if (invoice.Items.Count == 0)
    {
        return Results.BadRequest("Invoice must contain at least one item");
    }

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

        return Results.Ok(new
        {
            invoice.Id,
            invoice.SequentialNumber,
            invoice.Status,
            invoice.CreatedAt,
            invoice.ClosedAt,
            Items = invoice.Items
                .Select(invoiceItem => new
                {
                    invoiceItem.Id,
                    invoiceItem.InvoiceId,
                    invoiceItem.ProductId,
                    invoiceItem.Quantity
                })
                .ToList()
        });
    }
    catch (Exception ex)
    {
        return Results.Problem(
            detail: $"Failed to close invoice: {ex.Message}",
            statusCode: StatusCodes.Status503ServiceUnavailable
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
            retryAttempt => TimeSpan.FromSeconds(
                Math.Pow(2, retryAttempt)
            )
        );
}

public class StockProductResponse
{
    public int Id { get; set; }

    public string Code { get; set; } = string.Empty;

    public string Description { get; set; } = string.Empty;

    public int Balance { get; set; }

    public DateTime CreatedAt { get; set; }

    public DateTime UpdatedAt { get; set; }
}

public interface IStockService
{
    Task<StockProductResponse?> GetProductAsync(int productId);

    Task UpdateBalanceAsync(int productId, int quantity);
}

public class StockService(HttpClient client) : IStockService
{
    public async Task<StockProductResponse?> GetProductAsync(
        int productId
    )
    {
        var response = await client.GetAsync(
            $"/api/products/{productId}"
        );

        response.EnsureSuccessStatusCode();

        return await response.Content
            .ReadFromJsonAsync<StockProductResponse>();
    }

    public async Task UpdateBalanceAsync(
        int productId,
        int quantity
    )
    {
        var response = await client.PutAsync(
            $"/api/products/{productId}/balance?quantity={quantity}",
            null
        );

        response.EnsureSuccessStatusCode();
    }
}