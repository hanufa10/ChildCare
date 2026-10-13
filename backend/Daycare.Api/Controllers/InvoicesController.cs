
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
public class InvoicesController : ControllerBase
{
    private readonly DaycareDbContext _context;
    private readonly UserManager<ApplicationUser> _userManager;

    public InvoicesController(
        DaycareDbContext context,
        UserManager<ApplicationUser> userManager)
    {
        _context = context;
        _userManager = userManager;
    }

    private string? CurrentUserId =>
        User.FindFirstValue(ClaimTypes.NameIdentifier)
        ?? User.FindFirstValue("sub");

    private async Task<Parent?> GetCurrentParentAsync()
    {
        var userId = CurrentUserId;

        if (string.IsNullOrWhiteSpace(userId))
            return null;

        return await _context.Parents
            .FirstOrDefaultAsync(p => p.ApplicationUserId == userId);
    }

    // GET: api/Invoices
    // Admin: view all invoices.
    [HttpGet]
    [Authorize(Roles = "Admin")]
    public async Task<IActionResult> GetInvoices()
    {
        var invoices = await _context.Invoices
            .AsNoTracking()
            .Include(i => i.Child)
            .Include(i => i.Parent)
            .OrderByDescending(i => i.CreatedAt)
            .Select(i => new
            {
                i.Id,
                i.ChildId,
                ChildName = i.Child.FirstName + " " + i.Child.LastName,
                i.ParentId,
                ParentName = i.Parent.FirstName + " " + i.Parent.LastName,
                i.Description,
                i.Amount,
                i.DueDate,
                Status = i.Status.ToString(),
                i.CreatedAt
            })
            .ToListAsync();

        return Ok(invoices);
    }

    // GET: api/Invoices/mine
    // Parent: view only invoices assigned to their parent profile.
    [HttpGet("mine")]
    [Authorize(Roles = "Parent")]
    public async Task<IActionResult> GetMyInvoices()
    {
        var parent = await GetCurrentParentAsync();

        if (parent == null)
            return NotFound("Parent profile not found.");

        var invoices = await _context.Invoices
            .AsNoTracking()
            .Where(i => i.ParentId == parent.Id)
            .OrderByDescending(i => i.CreatedAt)
            .Select(i => new
            {
                i.Id,
                i.ChildId,
                ChildName = i.Child.FirstName + " " + i.Child.LastName,
                i.Description,
                i.Amount,
                i.DueDate,
                Status = i.Status.ToString(),
                i.CreatedAt
            })
            .ToListAsync();

        return Ok(invoices);
    }

    // POST: api/Invoices
    // Admin: create an invoice for a parent and their child.
    [HttpPost]
    [Authorize(Roles = "Admin")]
    public async Task<IActionResult> CreateInvoice(
        [FromBody] CreateInvoiceRequest request)
    {
        if (request.Amount <= 0)
            return BadRequest("Invoice amount must be greater than zero.");

        var relationshipExists = await _context.ParentChildren
            .AnyAsync(pc =>
                pc.ParentId == request.ParentId &&
                pc.ChildId == request.ChildId);

        if (!relationshipExists)
        {
            return BadRequest(
                "The selected parent is not associated with this child.");
        }

        var invoice = new Invoice
        {
            ParentId = request.ParentId,
            ChildId = request.ChildId,
            Description = request.Description.Trim(),
            Amount = request.Amount,
            DueDate = request.DueDate,
            Status = InvoiceStatus.Unpaid
        };

        _context.Invoices.Add(invoice);
        await _context.SaveChangesAsync();

        return CreatedAtAction(
            nameof(GetInvoices),
            new { id = invoice.Id },
            new
            {
                invoice.Id,
                invoice.ParentId,
                invoice.ChildId,
                invoice.Description,
                invoice.Amount,
                invoice.DueDate,
                Status = invoice.Status.ToString()
            });
    }
}

public class CreateInvoiceRequest
{
    public int ParentId { get; set; }
    public int ChildId { get; set; }
    public string Description { get; set; } = string.Empty;
    public decimal Amount { get; set; }
    public DateTimeOffset DueDate { get; set; }
}
