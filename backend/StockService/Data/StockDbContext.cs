using Microsoft.EntityFrameworkCore;
using StockService.Models;

namespace StockService.Data;

public class StockDbContext(DbContextOptions<StockDbContext> options) : DbContext(options)
{
    public DbSet<Product> Products => Set<Product>();
}