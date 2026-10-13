
using System.ComponentModel.DataAnnotations;

namespace Daycare.Api.Models;

public enum InvoiceStatus
{
    Unpaid,
    Paid,
    Cancelled
}

public class Invoice
{
    public int Id { get; set; }

    [Required]
    public int ChildId { get; set; }

    [Required]
    public int ParentId { get; set; }

    [Required]
    [MaxLength(150)]
    public string Description { get; set; } = string.Empty;

    [Range(typeof(decimal), "0.01", "999999999")]
    public decimal Amount { get; set; }

    public DateTimeOffset DueDate { get; set; }

    public InvoiceStatus Status { get; set; } = InvoiceStatus.Unpaid;

    public DateTimeOffset CreatedAt { get; set; } =
        DateTimeOffset.UtcNow;

    public Child Child { get; set; } = null!;

    public Parent Parent { get; set; } = null!;

    public ICollection<Payment> Payments { get; set; } =
        new List<Payment>();
}
