using Daycare.Api.Data;
using Daycare.Api.Models;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Daycare.Api.Features.Children.Queries;
using Daycare.Api.Features.Children.Commands;
using MediatR;
namespace Daycare.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize]
public class ChildrenController : ControllerBase
{
    
        private readonly DaycareDbContext _context;
        private readonly ISender _sender;

        public ChildrenController(
            DaycareDbContext context,
            ISender sender)
        {
            _context = context;
            _sender = sender;
        }

    [HttpGet]
    public async Task<ActionResult<IEnumerable<Child>>> GetChildren()
    {
        var children = await _sender.Send(new GetChildrenQuery());
        return Ok(children);
    }

        
    [HttpGet("{id}")]
    public async Task<ActionResult<Child>> GetChild(int id)
    {
        var child = await _sender.Send(new GetChildByIdQuery(id));

        if (child == null)
        {
            return NotFound();
        }

        return child;
    }


    
[HttpPost]
public async Task<ActionResult<Child>> CreateChild(Child child)
{
    var createdChild = await _sender.Send(
        new CreateChildCommand(child));

    return CreatedAtAction(
        nameof(GetChild),
        new { id = createdChild.Id },
        createdChild);
}


    

[HttpPut("{id}")]
public async Task<IActionResult> UpdateChild(int id, Child child)
{
    var userId = User.FindFirst(
        System.Security.Claims.ClaimTypes.NameIdentifier)?.Value;

    var command = new UpdateChildCommand(
        id,
        child,
        User.IsInRole("Admin") || User.IsInRole("Staff"),
        User.IsInRole("Parent"),
        userId);

    var result = await _sender.Send(command);

    if (result.Error != null)
    {
        return BadRequest(result.Error);
    }

    if (result.NotFound)
    {
        return NotFound();
    }

    if (result.Forbidden)
    {
        return Forbid();
    }

    return NoContent();
}


    
[HttpDelete("{id}")]
public async Task<IActionResult> DeleteChild(int id)
{
    var result = await _sender.Send(new DeleteChildCommand(id));

    if (result.NotFound)
    {
        return NotFound();
    }

    return NoContent();
}

    private bool ChildExists(int id)
    {
        return _context.Children.Any(e => e.Id == id);
    }
}