namespace InvoicingService.Models;

public class Invoice
{
    public int Id { get; set; }
    public int SequentialNumber { get; set; }
    public string Status { get; set; } = "Aberta"; // Aberta or Fechada
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    public DateTime? ClosedAt { get; set; }
    
    // Navigation property
    public List<InvoiceItem> Items { get; set; } = new();
}

public class InvoiceItem
{
    public int Id { get; set; }
    public int InvoiceId { get; set; }
    public int ProductId { get; set; }
    public int Quantity { get; set; }
    
    // Navigation property
    public Invoice? Invoice { get; set; }
}
