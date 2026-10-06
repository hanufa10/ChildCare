using Daycare.Api.Data;
using Daycare.Api.Models;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace Daycare.Api.Controllers;
[ApiController]
[Route("api/[controller]")]
public class StaffController : ControllerBase
{
    private readonly DaycareDbContext _context;
    public StaffController(DaycareDbContext context)
    {
        _context = context;
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
        {
            return NotFound();
        }

        return staff;
    }

    [HttpPost]
    public async Task<ActionResult<Staff>> PostStaff(Staff staff)
    {
        _context.Staff.Add(staff);
        await _context.SaveChangesAsync();

        return CreatedAtAction(nameof(GetStaff), new { id = staff.Id }, staff);
    }

    [HttpPut("{id}")]
    public async Task<IActionResult> PutStaff(int id, Staff staff)
    {
        if (id != staff.Id)
        {
            return BadRequest();
        }

        _context.Entry(staff).State = EntityState.Modified;

        try
        {
            await _context.SaveChangesAsync();
        }
        catch (DbUpdateConcurrencyException)
        {
            if (!StaffExists(id))
            {
                return NotFound();
            }
            else
            {
                throw;
            }
        }

        return NoContent();
    }

    [HttpDelete("{id}")]
    public async Task<IActionResult> DeleteStaff(int id)
    {
        var staff = await _context.Staff.FindAsync(id);
        if (staff == null)
        {
            return NotFound();
        }

        _context.Staff.Remove(staff);
        await _context.SaveChangesAsync();

        return NoContent();
    }

    private bool StaffExists(int id)
    {
        return _context.Staff.Any(e => e.Id == id);
    }
}