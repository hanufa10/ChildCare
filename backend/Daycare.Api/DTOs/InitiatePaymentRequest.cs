
using System.ComponentModel.DataAnnotations;
using Daycare.Api.Models;

namespace Daycare.Api.DTOs;

public class InitiatePaymentRequest
{
    [Required]
    public int InvoiceId { get; set; }

    [Required]
    public PaymentMethod Method { get; set; }
}
