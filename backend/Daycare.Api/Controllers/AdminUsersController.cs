
using Daycare.Api.DTOs;
using Daycare.Api.Identity;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;
using Daycare.Api.Data;
using Daycare.Api.Models;

namespace Daycare.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize(Roles = AppRoles.Admin)]
public class AdminUsersController : ControllerBase
{
    private readonly UserManager<ApplicationUser> _userManager;
    private readonly DaycareDbContext _context;

    public AdminUsersController(
    UserManager<ApplicationUser> userManager,
    DaycareDbContext context)
{
    _userManager = userManager;
    _context = context;
}

    
[HttpPost]
public async Task<IActionResult> CreateUser(CreateUserRequest request)
{
    if (request.Role != AppRoles.Admin &&
        request.Role != AppRoles.Staff)
    {
        return BadRequest(new
        {
            message = "Admins can create only Admin or Staff accounts here."
        });
    }

    if (request.Role == AppRoles.Staff &&
        (string.IsNullOrWhiteSpace(request.Gender) ||
         string.IsNullOrWhiteSpace(request.Position) ||
         request.HireDate == null))
    {
        return BadRequest(new
        {
            message = "Gender, position, and hire date are required for Staff accounts."
        });
    }

    var email = request.Email.Trim();
    var existing = await _userManager.FindByEmailAsync(email);

    if (existing != null)
    {
        return Conflict(new { message = "Email is already registered." });
    }

    var user = new ApplicationUser
    {
        UserName = email,
        Email = email,
        FirstName = request.FirstName.Trim(),
        LastName = request.LastName.Trim(),
        PhoneNumber = request.PhoneNumber
    };

    var result = await _userManager.CreateAsync(user, request.Password);

    if (!result.Succeeded)
    {
        return BadRequest(new
        {
            errors = result.Errors.Select(e => e.Description)
        });
    }

    var roleResult = await _userManager.AddToRoleAsync(user, request.Role);

    if (!roleResult.Succeeded)
    {
        await _userManager.DeleteAsync(user);

        return StatusCode(500, new
        {
            message = "Could not assign the requested role."
        });
    }

    if (request.Role == AppRoles.Staff)
    {
        var staff = new Staff
        {
            ApplicationUserId = user.Id,
            FirstName = user.FirstName,
            LastName = user.LastName,
            Email = user.Email ?? email,
            PhoneNumber = user.PhoneNumber ?? "",
            Gender = request.Gender!.Trim(),
            Position = request.Position!.Trim(),
            HireDate = request.HireDate!.Value
        };

        _context.Staff.Add(staff);

        try
        {
            await _context.SaveChangesAsync();
        }
        catch (Exception)
        {
            await _userManager.DeleteAsync(user);

            return StatusCode(500, new
            {
                message = "Could not save the staff profile. Please check the database configuration and try again."
            });
        }
    }

    return StatusCode(StatusCodes.Status201Created, new
    {
        user.Id,
        user.FirstName,
        user.LastName,
        user.Email,
        Role = request.Role
    });
}

}
