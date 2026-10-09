using Daycare.Api.Data;
using Daycare.Api.DTOs;
using Daycare.Api.Models;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace Daycare.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
public class RegistrationController : ControllerBase
{
    private readonly DaycareDbContext _context;

    public RegistrationController(DaycareDbContext context)
    {
        _context = context;
    }

    [HttpPost]
    public async Task<IActionResult> RegisterChild([FromBody] RegisterChildRequest request)
    {
        // Check if the parent already exists
        Parent? parent = null;
        if (request.ExistingParentId.HasValue)
        {
            parent = await _context.Parents.FindAsync(request.ExistingParentId.Value);
            if (parent == null)
            {
                return NotFound($"Parent with ID {request.ExistingParentId.Value} not found.");
            }
        }
        else
        {
            // Create a new parent
            parent = new Parent
            {
                FirstName = request.ParentFirstName,
                LastName = request.ParentLastName,
                PhoneNumber = request.ParentPhoneNumber,
                Email = request.ParentEmail
            };
            _context.Parents.Add(parent);
            await _context.SaveChangesAsync();
        }

        // Create a new child and associate it with the parent
        var child = new Child
        {
            FirstName = request.ChildFirstName,
            LastName = request.ChildLastName,
            DateOfBirth = request.ChildDateOfBirth,
            Gender = request.Gender,
            Allergies = request.Allergies,
            HealthCondition = request.HealthConditions
        };

        _context.Children.Add(child);
        await _context.SaveChangesAsync();

        var parentChild = new ParentChild
        {
            ChildId = child.Id,
            ParentId = parent.Id,
            Relation = request.Relation
        };
        _context.ParentChildren.Add(parentChild);
        await _context.SaveChangesAsync();

        return Ok(new { message = "Child registered successfully.", ChildId = child.Id, ParentId = parent.Id, relation = parentChild.Relation });
    }
}