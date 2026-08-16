using Microsoft.EntityFrameworkCore;
using Polly;
using Polly.Extensions.Http;
using StockService.Data;
using StockService.Models;

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

builder.Services.AddDbContext<StockDbContext>(options =>
    options.UseSqlServer(
        builder.Configuration.GetConnectionString("DefaultConnection")
    )
);

var app = builder.Build();

app.UseSwagger();
app.UseSwaggerUI();

app.UseCors("FrontendPolicy");

app.UseHttpsRedirection();

// GET all products
app.MapGet("/api/products", async (StockDbContext db) =>
    await db.Products.OrderBy(p => p.Description).ToListAsync())
    .WithName("GetProducts")
    .WithOpenApi();

// GET product by ID
app.MapGet("/api/products/{id}", async (int id, StockDbContext db) =>
    await db.Products.FindAsync(id))
    .WithName("GetProduct")
    .WithOpenApi();

// CREATE product
app.MapPost("/api/products", async (Product product, StockDbContext db) =>
{
    if (await db.Products.AnyAsync(p => p.Code == product.Code))
        return Results.BadRequest("Product code already exists");

    db.Products.Add(product);
    await db.SaveChangesAsync();

    return Results.Created($"/api/products/{product.Id}", product);
})
.WithName("CreateProduct")
.WithOpenApi();

// UPDATE product
app.MapPut("/api/products/{id}", async (
    int id,
    Product updatedProduct,
    StockDbContext db
) =>
{
    var product = await db.Products.FindAsync(id);

    if (product is null)
        return Results.NotFound();

    product.Description = updatedProduct.Description;
    product.Balance = updatedProduct.Balance;
    product.UpdatedAt = DateTime.UtcNow;

    await db.SaveChangesAsync();

    return Results.Ok(product);
})
.WithName("UpdateProduct")
.WithOpenApi();

// UPDATE product balance (called by invoicing service)
app.MapPut("/api/products/{id}/balance", async (
    int id,
    int quantity,
    StockDbContext db
) =>
{
    var product = await db.Products.FindAsync(id);

    if (product is null)
        return Results.NotFound("Product not found");

    if (product.Balance < quantity)
        return Results.BadRequest("Insufficient balance");

    product.Balance -= quantity;
    product.UpdatedAt = DateTime.UtcNow;

    await db.SaveChangesAsync();

    return Results.Ok(product);
})
.WithName("UpdateProductBalance")
.WithOpenApi();

app.Run();

// Polly retry policy for resilience
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

public class StockApiService(HttpClient client) : IStockService
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