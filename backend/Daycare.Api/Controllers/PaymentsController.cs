
using System.Security.Claims;
using Daycare.Api.Data;
using Daycare.Api.Identity;
using Daycare.Api.Models;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace Daycare.Api.Controllers;

[Route("api/[controller]")]
[ApiController]
[Authorize]
public class PaymentsController : ControllerBase
{
    private readonly DaycareDbContext _context;
    private readonly UserManager<ApplicationUser> _userManager;

    public PaymentsController(
        DaycareDbContext context,
        UserManager<ApplicationUser> userManager)
    {
        _context = context;
        _userManager = userManager;
    }

    private string? CurrentUserId =>
        User.FindFirstValue(ClaimTypes.NameIdentifier)
        ?? User.FindFirstValue("sub");

    // GET: api/Payments
    // Admin can view every payment.
    [HttpGet]
    [Authorize(Roles = "Admin")]
    public async Task<IActionResult> GetAllPayments()
    {
        var payments = await _context.Payments
            .AsNoTracking()
            .Include(p => p.Invoice)
                .ThenInclude(i => i.Child)
            .Include(p => p.Invoice)
                .ThenInclude(i => i.Parent)
            .OrderByDescending(p => p.CreatedAt)
            .Select(p => new
            {
                p.Id,
                p.InvoiceId,
                ChildName = p.Invoice.Child.FirstName
                    + " " + p.Invoice.Child.LastName,
                ParentName = p.Invoice.Parent.FirstName
                    + " " + p.Invoice.Parent.LastName,
                p.Amount,
                Method = p.Method.ToString(),
                Status = p.Status.ToString(),
                p.TransactionReference,
                p.FailureReason,
                p.CreatedAt,
                p.CompletedAt
            })
            .ToListAsync();

        return Ok(payments);
    }

    // GET: api/Payments/mine
    // Parent can view only payments for their own invoices.
    [HttpGet("mine")]
    [Authorize(Roles = "Parent")]
    public async Task<IActionResult> GetMyPayments()
    {
        var userId = CurrentUserId;

        if (string.IsNullOrWhiteSpace(userId))
            return Unauthorized();

        var parent = await _context.Parents
            .FirstOrDefaultAsync(p => p.ApplicationUserId == userId);

        if (parent == null)
            return NotFound("Parent profile not found.");

        var payments = await _context.Payments
            .AsNoTracking()
            .Where(p => p.Invoice.ParentId == parent.Id)
            .OrderByDescending(p => p.CreatedAt)
            .Select(p => new
            {
                p.Id,
                p.InvoiceId,
                ChildName = p.Invoice.Child.FirstName
                    + " " + p.Invoice.Child.LastName,
                InvoiceDescription = p.Invoice.Description,
                p.Amount,
                Method = p.Method.ToString(),
                Status = p.Status.ToString(),
                p.TransactionReference,
                p.FailureReason,
                p.CreatedAt,
                p.CompletedAt
            })
            .ToListAsync();

        return Ok(payments);
    }

    // POST: api/Payments/initiate
    [HttpPost("initiate")]
    [Authorize(Roles = "Parent")]
    public async Task<IActionResult> InitiatePayment(
        [FromBody] InitiatePaymentRequest request)
    {
        if (!Enum.IsDefined(typeof(PaymentMethod), request.Method))
            return BadRequest("Invalid payment method.");

        var userId = CurrentUserId;

        if (string.IsNullOrWhiteSpace(userId))
            return Unauthorized();

        var parent = await _context.Parents
            .FirstOrDefaultAsync(p => p.ApplicationUserId == userId);

        if (parent == null)
            return NotFound("Parent profile not found.");

        var invoice = await _context.Invoices
            .FirstOrDefaultAsync(i =>
                i.Id == request.InvoiceId &&
                i.ParentId == parent.Id);

        if (invoice == null)
            return NotFound(
                "Invoice not found or you do not have permission to pay it.");

        if (invoice.Status != InvoiceStatus.Unpaid)
            return BadRequest(
                "Only unpaid invoices can be paid.");

        // Do not start another payment while a previous attempt
        // for this invoice is still pending.
        var pendingExists = await _context.Payments
            .AnyAsync(p =>
                p.InvoiceId == invoice.Id &&
                p.Status == PaymentStatus.Pending);

        if (pendingExists)
            return BadRequest(
                "A payment for this invoice is already pending.");

        var payment = new Payment
        {
            InvoiceId = invoice.Id,
            Amount = invoice.Amount,
            Method = request.Method,
            Status = PaymentStatus.Pending,
            CreatedAt = DateTimeOffset.UtcNow
        };

        _context.Payments.Add(payment);
        await _context.SaveChangesAsync();

        // MOCK GATEWAY:
        // This is a simulation, not a real payment provider.
        // In a real integration, the provider would confirm
        // the payment outcome on the server.
        var succeeded = Random.Shared.Next(100) < 85;

        payment.Status = succeeded
            ? PaymentStatus.Succeeded
            : PaymentStatus.Failed;

        payment.TransactionReference =
            $"MOCK-{Guid.NewGuid():N}";

        payment.CompletedAt = DateTimeOffset.UtcNow;

        if (succeeded)
        {
            invoice.Status = InvoiceStatus.Paid;
        }
        else
        {
            payment.FailureReason =
                "Mock payment declined. You can try again.";
        }

        await _context.SaveChangesAsync();

        return Ok(new
        {
            Message = succeeded
                ? "Mock payment successful."
                : "Mock payment failed. You can try again.",
            payment.Id,
            payment.InvoiceId,
            payment.Amount,
            Method = payment.Method.ToString(),
            Status = payment.Status.ToString(),
            payment.TransactionReference,
            payment.FailureReason,
            payment.CompletedAt,
            InvoiceStatus = invoice.Status.ToString()
        });
    }
}

public class InitiatePaymentRequest
{
    public int InvoiceId { get; set; }

    public PaymentMethod Method { get; set; }
}
