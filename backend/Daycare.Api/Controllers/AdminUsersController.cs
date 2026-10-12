
using Daycare.Api.DTOs;
using Daycare.Api.Identity;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;

namespace Daycare.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize(Roles = AppRoles.Admin)]
public class AdminUsersController : ControllerBase
{
    private readonly UserManager<ApplicationUser> _userManager;

    public AdminUsersController(
        UserManager<ApplicationUser> userManager)
    {
        _userManager = userManager;
    }

    [HttpPost]
    public async Task<IActionResult> CreateUser(
        CreateUserRequest request)
    {
        if (request.Role != AppRoles.Admin &&
            request.Role != AppRoles.Staff)
        {
            return BadRequest(new
            {
                message = "Admins can create only Admin or Staff accounts here."
            });
        }

        var existing = await _userManager.FindByEmailAsync(request.Email);

        if (existing != null)
            return Conflict(new { message = "Email is already registered." });

        var user = new ApplicationUser
        {
            UserName = request.Email.Trim(),
            Email = request.Email.Trim(),
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

        var roleResult = await _userManager.AddToRoleAsync(
            user, request.Role);

        if (!roleResult.Succeeded)
        {
            await _userManager.DeleteAsync(user);

            return StatusCode(500, new
            {
                message = "Could not assign the requested role."
            });
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
