
using Daycare.Api.Data;
using Daycare.Api.DTOs;
using Daycare.Api.Enums;
using Daycare.Api.Identity;
using Daycare.Api.Models;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace Daycare.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
public class RegistrationController : ControllerBase
{
    private readonly DaycareDbContext _context;
    private readonly UserManager<ApplicationUser> _userManager;

    public RegistrationController(
        DaycareDbContext context,
        UserManager<ApplicationUser> userManager)
    {
        _context = context;
        _userManager = userManager;
    }

    [HttpPost]
    public async Task<IActionResult> RegisterChild(
        [FromBody] RegisterChildRequest request)
    {
        // Validate child information.
        if (string.IsNullOrWhiteSpace(request.ChildFirstName) ||
            string.IsNullOrWhiteSpace(request.ChildLastName))
        {
            return BadRequest(new
            {
                message = "Child first name and last name are required."
            });
        }

        if (request.ChildDateOfBirth == default ||
            request.ChildDateOfBirth > DateOnly.FromDateTime(DateTime.UtcNow))
        {
            return BadRequest(new
            {
                message = "Please provide a valid date of birth."
            });
        }

        if (!Enum.IsDefined(typeof(Relation), request.Relation))
        {
            return BadRequest(new
            {
                message = "Please select a valid relationship."
            });
        }

        Parent? parent;

        // Reuse an existing parent profile when selected.
        if (request.ExistingParentId.HasValue)
        {
            parent = await _context.Parents.FindAsync(
                request.ExistingParentId.Value);

            if (parent == null)
            {
                return NotFound(new
                {
                    message = "The selected parent was not found."
                });
            }
        }
        else
        {
            // Validate new parent information.
            if (string.IsNullOrWhiteSpace(request.ParentFirstName) ||
                string.IsNullOrWhiteSpace(request.ParentLastName) ||
                string.IsNullOrWhiteSpace(request.ParentEmail) ||
                string.IsNullOrWhiteSpace(request.ParentPassword))
            {
                return BadRequest(new
                {
                    message = "Parent name, email, and password are required."
                });
            }

            if (request.ParentPassword.Length < 8)
            {
                return BadRequest(new
                {
                    message = "The parent password must be at least 8 characters."
                });
            }

            var email = request.ParentEmail.Trim();

            var existingUser =
                await _userManager.FindByEmailAsync(email);

            if (existingUser != null)
            {
                return Conflict(new
                {
                    message = "This email already has a login account. Select the existing parent if appropriate."
                });
            }

            // Start a transaction so the new account, profile,
            // child, and relationship can be saved together.
            await using var transaction =
                await _context.Database.BeginTransactionAsync();

            try
            {
                // 1. Create the parent's Identity login account.
                var user = new ApplicationUser
                {
                    UserName = email,
                    Email = email,
                    FirstName = request.ParentFirstName.Trim(),
                    LastName = request.ParentLastName.Trim(),
                    PhoneNumber = request.ParentPhoneNumber?.Trim(),
                    MustChangePassword = true
                };

                var createResult = await _userManager.CreateAsync(
                    user, request.ParentPassword);

                if (!createResult.Succeeded)
                {
                    await transaction.RollbackAsync();

                    return BadRequest(new
                    {
                        message = "Could not create the parent account.",
                        errors = createResult.Errors.Select(
                            error => error.Description)
                    });
                }

                // 2. Assign the Parent role.
                var roleResult = await _userManager.AddToRoleAsync(
                    user, AppRoles.Parent);

                if (!roleResult.Succeeded)
                {
                    await transaction.RollbackAsync();

                    return BadRequest(new
                    {
                        message = "Could not assign the Parent role.",
                        errors = roleResult.Errors.Select(
                            error => error.Description)
                    });
                }

                // 3. Create the parent profile linked to the login.
                parent = new Parent
                {
                    ApplicationUserId = user.Id,
                    FirstName = user.FirstName,
                    LastName = user.LastName,
                    Email = email,
                    PhoneNumber = user.PhoneNumber ?? string.Empty
                };

                _context.Parents.Add(parent);
                await _context.SaveChangesAsync();

                // 4. Create the child.
                var child = new Child
                {
                    FirstName = request.ChildFirstName.Trim(),
                    LastName = request.ChildLastName.Trim(),
                    DateOfBirth = request.ChildDateOfBirth,
                    Gender = request.Gender?.Trim() ?? string.Empty,
                    Allergies = request.Allergies?.Trim() ?? string.Empty,
                    HealthCondition =
                        request.HealthConditions?.Trim() ?? string.Empty
                };

                _context.Children.Add(child);
                await _context.SaveChangesAsync();

                // 5. Link the child to the parent.
                var parentChild = new ParentChild
                {
                    ParentId = parent.Id,
                    ChildId = child.Id,
                    Relation = request.Relation
                };

                _context.ParentChildren.Add(parentChild);
                await _context.SaveChangesAsync();

                await transaction.CommitAsync();

                return StatusCode(
                    StatusCodes.Status201Created,
                    new
                    {
                        message = "Parent account and child registered successfully.",
                        childId = child.Id,
                        parentId = parent.Id,
                        parentEmail = user.Email,
                        relation = parentChild.Relation
                    });
            }
            catch (Exception)
            {
                await transaction.RollbackAsync();

                return StatusCode(
                    StatusCodes.Status500InternalServerError,
                    new
                    {
                        message = "Registration failed. Check the server logs for details."
                    });
            }
        }

        // Existing parent: create only the child and relationship.
        var existingChild = new Child
        {
            FirstName = request.ChildFirstName.Trim(),
            LastName = request.ChildLastName.Trim(),
            DateOfBirth = request.ChildDateOfBirth,
            Gender = request.Gender?.Trim() ?? string.Empty,
            Allergies = request.Allergies?.Trim() ?? string.Empty,
            HealthCondition =
                request.HealthConditions?.Trim() ?? string.Empty
        };

        await using var existingTransaction =
            await _context.Database.BeginTransactionAsync();

        try
        {
            _context.Children.Add(existingChild);
            await _context.SaveChangesAsync();

            var parentChild = new ParentChild
            {
                ParentId = parent.Id,
                ChildId = existingChild.Id,
                Relation = request.Relation
            };

            _context.ParentChildren.Add(parentChild);
            await _context.SaveChangesAsync();

            await existingTransaction.CommitAsync();

            return StatusCode(
                StatusCodes.Status201Created,
                new
                {
                    message = "Child registered successfully.",
                    childId = existingChild.Id,
                    parentId = parent.Id,
                    relation = parentChild.Relation
                });
        }
        catch (Exception)
        {
            await existingTransaction.RollbackAsync();

            return StatusCode(
                StatusCodes.Status500InternalServerError,
                new
                {
                    message = "Child registration failed. Check the server logs for details."
                });
        }
    }
}
