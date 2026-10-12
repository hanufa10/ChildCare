
using Daycare.Api.Data;
using Daycare.Api.DTOs;
using Daycare.Api.Identity;
using Daycare.Api.Models;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

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
    public async Task<IActionResult> CreateUser(
        CreateUserRequest request)
    {
        // Only allow the three supported account roles.
        if (request.Role != AppRoles.Admin &&
            request.Role != AppRoles.Staff &&
            request.Role != AppRoles.Parent)
        {
            return BadRequest(new
            {
                message = "Admins can create only Admin, Staff, or Parent accounts."
            });
        }

        // Staff accounts require additional employee information.
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

        if (string.IsNullOrWhiteSpace(request.Email) ||
            string.IsNullOrWhiteSpace(request.FirstName) ||
            string.IsNullOrWhiteSpace(request.LastName) ||
            string.IsNullOrWhiteSpace(request.Password))
        {
            return BadRequest(new
            {
                message = "First name, last name, email, and password are required."
            });
        }

        var email = request.Email.Trim();

        var existing = await _userManager.FindByEmailAsync(email);

        if (existing != null)
        {
            return Conflict(new
            {
                message = "Email is already registered."
            });
        }

        await using var transaction =
            await _context.Database.BeginTransactionAsync();

        try
        {
            // 1. Create the login account.
            var user = new ApplicationUser
            {
                UserName = email,
                Email = email,
                FirstName = request.FirstName.Trim(),
                LastName = request.LastName.Trim(),
                PhoneNumber = request.PhoneNumber
            };

            var result = await _userManager.CreateAsync(
                user, request.Password);

            if (!result.Succeeded)
            {
                await transaction.RollbackAsync();

                return BadRequest(new
                {
                    errors = result.Errors.Select(
                        e => e.Description)
                });
            }

            // 2. Assign the selected role.
            var roleResult = await _userManager.AddToRoleAsync(
                user, request.Role);

            if (!roleResult.Succeeded)
            {
                await transaction.RollbackAsync();

                return StatusCode(500, new
                {
                    message = "Could not assign the requested role."
                });
            }

            // 3. Create the corresponding profile when needed.
            if (request.Role == AppRoles.Parent)
            {
                var parent = new Parent
                {
                    ApplicationUserId = user.Id,
                    FirstName = user.FirstName,
                    LastName = user.LastName,
                    Email = user.Email ?? email,
                    PhoneNumber = user.PhoneNumber ?? string.Empty
                };

                _context.Parents.Add(parent);
                await _context.SaveChangesAsync();
            }
            else if (request.Role == AppRoles.Staff)
            {
                var staff = new Staff
                {
                    ApplicationUserId = user.Id,
                    FirstName = user.FirstName,
                    LastName = user.LastName,
                    Email = user.Email ?? email,
                    PhoneNumber = user.PhoneNumber ?? string.Empty,
                    Gender = request.Gender!.Trim(),
                    Position = request.Position!.Trim(),
                    HireDate = request.HireDate!.Value
                };

                _context.Staff.Add(staff);
                await _context.SaveChangesAsync();
            }

            // Admin accounts do not require a Parent or Staff profile.
            await transaction.CommitAsync();

            return StatusCode(StatusCodes.Status201Created, new
            {
                user.Id,
                user.FirstName,
                user.LastName,
                user.Email,
                Role = request.Role
            });
        }
        catch (Exception)
        {
            await transaction.RollbackAsync();

            return StatusCode(500, new
            {
                message = "Could not create the account and its profile. Please check the server logs and try again."
            });
        }
    }
}
