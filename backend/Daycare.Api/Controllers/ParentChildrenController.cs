using Daycare.Api.Data;
using Daycare.Api.Models;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Microsoft.AspNetCore.Authorization;
using System.Security.Claims;

namespace Daycare.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
public class ParentChildrenController : ControllerBase
{
    private readonly DaycareDbContext _context;

    public ParentChildrenController(DaycareDbContext context)
    {
        _context = context;
    }
    [HttpGet]
    public async Task<ActionResult<IEnumerable<ParentChild>>> GetParentChildren()
    {
        return await _context.ParentChildren
            .Include(pc => pc.Parent)
            .Include(pc => pc.Child)
            .ToListAsync();
    }

    [HttpPost]
    public async Task<ActionResult<ParentChild>> CreateParentChild(ParentChild parentChild)
    {
        var parentExists = await _context.Parents.AnyAsync(p => p.Id == parentChild.ParentId);
        var childExists = await _context.Children.AnyAsync(c => c.Id == parentChild.ChildId);

        if (!parentExists )
        {
            return BadRequest("Parent/Guardian does not exist.");
        }
        if (!childExists)
        {
            return BadRequest("Child does not exist.");
        }
        _context.ParentChildren.Add(parentChild);
        await _context.SaveChangesAsync();
        return Ok(parentChild);
    }
    [HttpGet("parent/{parentId}")]
    public async Task<ActionResult<IEnumerable<ParentChild>>> GetChildrenForParent(int parentId)
    {
        return await _context.ParentChildren
            .Include(pc => pc.Parent)
            .Include(pc => pc.Child)
            .Where(pc => pc.ParentId == parentId)
            .ToListAsync();
    }
    [HttpGet("child/{childId}")]
    public async Task<ActionResult<IEnumerable<ParentChild>>> GetParentsForChild(int childId)
    {
        return await _context.ParentChildren
            .Include(pc => pc.Parent)
            .Include(pc => pc.Child)
            .Where(pc => pc.ChildId == childId)
            .ToListAsync();
    }
    [HttpDelete("parent/{parentId}/child/{childId}")]
    public async Task<IActionResult> DeleteParentChild(int parentId, int childId)
    {
        var parentChild = await _context.ParentChildren
            .Include(pc => pc.Parent)
            .Include(pc => pc.Child)
            .Where(pc => pc.ParentId == parentId && pc.ChildId == childId)
            .FirstOrDefaultAsync();

        if (parentChild == null)
        {
            return NotFound();
        }

        _context.ParentChildren.Remove(parentChild);
        await _context.SaveChangesAsync();

        return NoContent();
    }
[Authorize(Roles = "Parent")]
[HttpGet("my-children")]
public async Task<ActionResult<IEnumerable<ParentChild>>> GetMyChildren()
{
    var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);

    if (string.IsNullOrEmpty(userId))
        return Unauthorized();

    var parent = await _context.Parents
        .FirstOrDefaultAsync(p => p.ApplicationUserId == userId);

    if (parent == null)
        return NotFound("Parent profile not found for this account.");

    var children = await _context.ParentChildren
        .Include(pc => pc.Child)
        .Where(pc => pc.ParentId == parent.Id)
        .ToListAsync();

    return Ok(children);
}
}
