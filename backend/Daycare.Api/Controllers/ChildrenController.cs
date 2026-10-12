using Daycare.Api.Data;
using Daycare.Api.Models;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace Daycare.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize]
public class ChildrenController : ControllerBase
{
    private readonly DaycareDbContext _context;

    public ChildrenController(DaycareDbContext context)
    {
        _context = context;
    }

    [HttpGet]
    public async Task<ActionResult<IEnumerable<Child>>> GetChildren()
    {
        return await _context.Children.ToListAsync();
    }

    [HttpGet("{id}")]
    public async Task<ActionResult<Child>> GetChild(int id)
    {
        var child = await _context.Children.FindAsync(id);

        if (child == null)
        {
            return NotFound();
        }

        return child;
    }

    [HttpPost]
    public async Task<ActionResult<Child>> CreateChild(Child child)
    {
        _context.Children.Add(child);
        await _context.SaveChangesAsync();

        return CreatedAtAction(nameof(GetChild), new { id = child.Id }, child);
    }

    
[HttpPut("{id}")]
public async Task<IActionResult> UpdateChild(int id, Child child)
{
    if (id != child.Id)
    {
        return BadRequest("Child ID does not match.");
    }

    var existingChild = await _context.Children.FindAsync(id);

    if (existingChild == null)
    {
        return NotFound();
    }

    var isAdminOrStaff =
        User.IsInRole("Admin") || User.IsInRole("Staff");

    if (!isAdminOrStaff)
    {
        if (!User.IsInRole("Parent"))
        {
            return Forbid();
        }

        var userId = User.FindFirst(
            System.Security.Claims.ClaimTypes.NameIdentifier)?.Value;

        if (string.IsNullOrEmpty(userId))
        {
            return Forbid();
        }

        var parent = await _context.Parents
            .FirstOrDefaultAsync(p => p.ApplicationUserId == userId);

        if (parent == null)
        {
            return Forbid();
        }

        var isLinked = await _context.ParentChildren
            .AnyAsync(pc =>
                pc.ParentId == parent.Id &&
                pc.ChildId == id);

        if (!isLinked)
        {
            return Forbid();
        }
    }

    existingChild.FirstName = child.FirstName;
    existingChild.LastName = child.LastName;
    existingChild.DateOfBirth = child.DateOfBirth;
    existingChild.Gender = child.Gender;
    existingChild.Allergies = child.Allergies;
    existingChild.HealthCondition = child.HealthCondition;

    await _context.SaveChangesAsync();

    return NoContent();
}


    [HttpDelete("{id}")]
    public async Task<IActionResult> DeleteChild(int id)
    {
        var child = await _context.Children.FindAsync(id);

        if (child == null)
        {
            return NotFound();
        }

        _context.Children.Remove(child);
        await _context.SaveChangesAsync();

        return NoContent();
    }

    private bool ChildExists(int id)
    {
        return _context.Children.Any(e => e.Id == id);
    }
}