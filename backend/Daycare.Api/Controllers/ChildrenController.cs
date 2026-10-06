using Daycare.Api.Data;
using Daycare.Api.Models;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace Daycare.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
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
            return BadRequest();
        }

        _context.Entry(child).State = EntityState.Modified;

        try
        {
            await _context.SaveChangesAsync();
        }
        catch (DbUpdateConcurrencyException)
        {
            if (!ChildExists(id))
            {
                return NotFound();
            }
            else
            {
                throw;
            }
        }

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