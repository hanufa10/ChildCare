
using Daycare.Api.Data;
using Daycare.Api.Identity;
using Daycare.Api.Models;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace Daycare.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
public class ParentController : ControllerBase
{
    private readonly DaycareDbContext _context;
    private readonly UserManager<ApplicationUser> _userManager;

    public ParentController(
        DaycareDbContext context,
        UserManager<ApplicationUser> userManager)
    {
        _context = context;
        _userManager = userManager;
    }

    [HttpGet]
    public async Task<ActionResult<IEnumerable<Parent>>> GetParents()
    {
        return await _context.Parents.ToListAsync();
    }

    [HttpGet("{id}")]
    public async Task<ActionResult<Parent>> GetParent(int id)
    {
        var parent = await _context.Parents.FindAsync(id);

        if (parent == null)
            return NotFound();

        return parent;
    }

    [HttpPost]
    public async Task<ActionResult<Parent>> CreateParent(Parent parent)
    {
        _context.Parents.Add(parent);
        await _context.SaveChangesAsync();

        return CreatedAtAction(
            nameof(GetParent),
            new { id = parent.Id },
            parent);
    }

    [HttpPut("{id}")]
    public async Task<IActionResult> UpdateParent(
        int id, Parent updatedParent)
    {
        if (id != updatedParent.Id)
            return BadRequest(
                "The ID in the URL does not match the parent ID.");

        var parent = await _context.Parents.FindAsync(id);

        if (parent == null)
            return NotFound("Parent not found.");

        if (string.IsNullOrWhiteSpace(updatedParent.Email))
            return BadRequest("Email is required.");

        var newEmail = updatedParent.Email.Trim();

        if (!string.IsNullOrWhiteSpace(parent.ApplicationUserId))
        {
            var user = await _userManager.FindByIdAsync(
                parent.ApplicationUserId);

            if (user == null)
                return Conflict(
                    "The linked parent login account was not found.");

            var emailOwner =
                await _userManager.FindByEmailAsync(newEmail);

            if (emailOwner != null && emailOwner.Id != user.Id)
                return Conflict(
                    "This email is already used by another account.");

            var usernameOwner =
                await _userManager.FindByNameAsync(newEmail);

            if (usernameOwner != null && usernameOwner.Id != user.Id)
                return Conflict(
                    "This username is already used by another account.");

            var emailResult =
                await _userManager.SetEmailAsync(user, newEmail);

            if (!emailResult.Succeeded)
                return BadRequest(emailResult.Errors);

            var usernameResult =
                await _userManager.SetUserNameAsync(user, newEmail);

            if (!usernameResult.Succeeded)
                return BadRequest(usernameResult.Errors);
        }

        parent.FirstName = updatedParent.FirstName;
        parent.LastName = updatedParent.LastName;
        parent.PhoneNumber = updatedParent.PhoneNumber;
        parent.Email = newEmail;

        await _context.SaveChangesAsync();

        return NoContent();
    }

    [HttpDelete("{id}")]
    public async Task<IActionResult> DeleteParent(int id)
    {
        var parent = await _context.Parents
            .FirstOrDefaultAsync(p => p.Id == id);

        if (parent == null)
            return NotFound("Parent not found.");

        var userId = parent.ApplicationUserId;
        ApplicationUser? user = null;
        var deleteLogin = false;

        // Check the linked login before changing anything.
        if (!string.IsNullOrWhiteSpace(userId))
        {
            user = await _userManager.FindByIdAsync(userId);

            if (user == null)
                return Conflict(
                    "The linked login account was not found. " +
                    "Deletion was cancelled.");

            // Never delete an administrator account here.
            if (await _userManager.IsInRoleAsync(user, "Admin"))
                return Conflict(
                    "This parent is linked to an Admin account. " +
                    "Deletion was cancelled.");

            // Keep the login if another parent or staff profile uses it.
            var usedByAnotherParent = await _context.Parents
                .AnyAsync(p =>
                    p.Id != id &&
                    p.ApplicationUserId == userId);

            var usedByStaff = await _context.Staff
                .AnyAsync(s => s.ApplicationUserId == userId);

            deleteLogin = !usedByAnotherParent && !usedByStaff;
        }

        // Remove only this parent's relationships, not the children.
        var relationships = await _context.ParentChildren
            .Where(pc => pc.ParentId == id)
            .ToListAsync();

        await using var transaction =
            await _context.Database.BeginTransactionAsync();

        try
        {
            if (deleteLogin && user != null)
            {
                var result = await _userManager.DeleteAsync(user);

                if (!result.Succeeded)
                {
                    await transaction.RollbackAsync();

                    return Conflict(new
                    {
                        message = "The login account could not be deleted. " +
                                  "The parent profile was not deleted.",
                        errors = result.Errors.Select(e => e.Description)
                    });
                }
            }

            _context.ParentChildren.RemoveRange(relationships);
            _context.Parents.Remove(parent);

            await _context.SaveChangesAsync();
            await transaction.CommitAsync();

            return NoContent();
        }
        catch (Exception)
        {
            await transaction.RollbackAsync();

            return Problem(
                statusCode: 500,
                title: "Parent deletion failed",
                detail: "The deletion was rolled back. Please check " +
                        "the server logs for more information.");
        }
    }
}
