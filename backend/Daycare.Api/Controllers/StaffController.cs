
using Daycare.Api.Data;
using Daycare.Api.Identity;
using Daycare.Api.Models;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace Daycare.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
public class StaffController : ControllerBase
{
    private readonly DaycareDbContext _context;
    private readonly UserManager<ApplicationUser> _userManager;

    public StaffController(
        DaycareDbContext context,
        UserManager<ApplicationUser> userManager)
    {
        _context = context;
        _userManager = userManager;
    }

    [HttpGet]
    public async Task<ActionResult<IEnumerable<Staff>>> GetStaffs()
    {
        return await _context.Staff.ToListAsync();
    }

    [HttpGet("{id}")]
    public async Task<ActionResult<Staff>> GetStaff(int id)
    {
        var staff = await _context.Staff.FindAsync(id);

        if (staff == null)
            return NotFound();

        return staff;
    }

    [HttpPost]
    public async Task<ActionResult<Staff>> PostStaff(Staff staff)
    {
        _context.Staff.Add(staff);
        await _context.SaveChangesAsync();

        return CreatedAtAction(
            nameof(GetStaff),
            new { id = staff.Id },
            staff);
    }

    [HttpPut("{id}")]
    public async Task<IActionResult> PutStaff(int id, Staff updatedStaff)
    {
        if (id != updatedStaff.Id)
            return BadRequest("The ID in the URL does not match the staff ID.");

        var staff = await _context.Staff.FindAsync(id);

        if (staff == null)
            return NotFound("Staff member not found.");

        if (string.IsNullOrWhiteSpace(updatedStaff.Email))
            return BadRequest("Email is required.");

        var newEmail = updatedStaff.Email.Trim();

        // Synchronize the linked login account, if one exists.
        if (!string.IsNullOrWhiteSpace(staff.ApplicationUserId))
        {
            var user = await _userManager.FindByIdAsync(
                staff.ApplicationUserId);

            if (user == null)
                return Conflict("The linked staff login account was not found.");

            var emailOwner = await _userManager.FindByEmailAsync(newEmail);

            if (emailOwner != null && emailOwner.Id != user.Id)
                return Conflict("This email is already used by another account.");

            var usernameOwner = await _userManager.FindByNameAsync(newEmail);

            if (usernameOwner != null && usernameOwner.Id != user.Id)
                return Conflict("This username is already used by another account.");

            var emailResult = await _userManager.SetEmailAsync(user, newEmail);

            if (!emailResult.Succeeded)
                return BadRequest(emailResult.Errors);

            var usernameResult = await _userManager.SetUserNameAsync(
                user, newEmail);

            if (!usernameResult.Succeeded)
                return BadRequest(usernameResult.Errors);
        }

        // Update the profile fields.
        staff.FirstName = updatedStaff.FirstName;
        staff.LastName = updatedStaff.LastName;
        staff.Email = newEmail;

        await _context.SaveChangesAsync();

        return NoContent();
    }

    [HttpDelete("{id}")]
    public async Task<IActionResult> DeleteStaff(int id)
    {
        var staff = await _context.Staff.FindAsync(id);

        if (staff == null)
            return NotFound();

        _context.Staff.Remove(staff);
        await _context.SaveChangesAsync();

        return NoContent();
    }
}
