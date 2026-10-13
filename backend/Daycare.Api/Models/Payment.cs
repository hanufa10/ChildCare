
using System.ComponentModel.DataAnnotations;

namespace Daycare.Api.Models;

public enum PaymentStatus
{
    Pending,
    Succeeded,
    Failed
}

public enum PaymentMethod
{
    MockMobileMoney,
    MockCard
}

public class Payment
{
    public int Id { get; set; }

    [Required]
    public int InvoiceId { get; set; }

    public decimal Amount { get; set; }

    public PaymentMethod Method { get; set; }

    public PaymentStatus Status { get; set; } =
        PaymentStatus.Pending;

    [MaxLength(100)]
    public string? TransactionReference { get; set; }

    [MaxLength(500)]
    public string? FailureReason { get; set; }

    public DateTimeOffset CreatedAt { get; set; } =
        DateTimeOffset.UtcNow;

    public DateTimeOffset? CompletedAt { get; set; }

    public Invoice Invoice { get; set; } = null!;
}
