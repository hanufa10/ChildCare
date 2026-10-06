using Daycare.Api.Data;
using Daycare.Api.Models;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace Daycare.Api.Controllers;
[ApiController]
[Route("api/[controller]")]

public class ParentController : ControllerBase
{
    private readonly DaycareDbContext _context;

    public ParentController(DaycareDbContext context)
    {
        _context = context;
    }
    [HttpGet]
    public async Task<ActionResult<IEnumerable<Parent>>> GetParents()
    {
        return await _context.Parents.ToListAsync();
    }

    [HttpGet("{id}")]
    public async Task<ActionResult<Parent>> GetParent(int id)
    {
        var parentFound = await _context.Parents.FindAsync(id);
        if (parentFound == null)
        {
            return NotFound();
        }
        return parentFound;
    }
    [HttpPost]
    public async Task<ActionResult<Parent>> CreateParent(Parent parent)
    {
        _context.Parents.Add(parent);
        await _context.SaveChangesAsync();
        return CreatedAtAction(
            nameof(GetParent),
            new { id = parent.Id},
            parent
        );
    }

    [HttpPut("{id}")]
    public async Task<IActionResult> UpdateParent(int id, Parent parent)
    {
        if(id != parent.Id)
        {
            return BadRequest();
        }

        _context.Entry(parent).State = EntityState.Modified;

        await _context.SaveChangesAsync();
        return NoContent();
    }
    [HttpDelete("{id}")]
    public async Task<IActionResult> DeleteParent(int id)
    {
        var parentFound = await _context.Parents.FindAsync(id);
        if (parentFound == null)
        {
            return NotFound();
        }
        _context.Parents.Remove(parentFound);
        await _context.SaveChangesAsync();

        return NoContent();
    }
}