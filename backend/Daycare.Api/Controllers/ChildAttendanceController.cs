
using Daycare.Api.Data;
using Daycare.Api.Models;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace Daycare.Api.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class ChildAttendanceController : ControllerBase
    {
        private readonly DaycareDbContext _context;

        public ChildAttendanceController(DaycareDbContext context)
        {
            _context = context;
        }

        // GET: api/ChildAttendance
        [HttpGet]
        public async Task<ActionResult<IEnumerable<ChildAttendance>>> GetAll()
        {
            return await _context.ChildAttendances
                .Include(a => a.Child)
                .ToListAsync();
        }

        // GET: api/ChildAttendance/5
        [HttpGet("{id}", Name = "GetChildAttendanceById")]
        public async Task<ActionResult<ChildAttendance>> GetById(int id)
        {
            var attendance = await _context.ChildAttendances
                .Include(a => a.Child)
                .FirstOrDefaultAsync(a => a.Id == id);

            if (attendance == null)
                return NotFound();

            return attendance;
        }

        // GET: api/ChildAttendance/child/2
        [HttpGet("child/{childId}")]
        public async Task<ActionResult<IEnumerable<ChildAttendance>>> GetByChild(int childId)
        {
            var records = await _context.ChildAttendances
                .Where(a => a.ChildId == childId)
                .OrderByDescending(a => a.AttendanceDate)
                .ToListAsync();

            return records;
        }

        // POST: api/ChildAttendance
        [HttpPost]
        public async Task<ActionResult<ChildAttendance>> Create(
            ChildAttendance attendance)
        {
            var childExists = await _context.Children
                .AnyAsync(c => c.Id == attendance.ChildId);

            if (!childExists)
                return BadRequest("The specified child does not exist.");

            var duplicate = await _context.ChildAttendances.AnyAsync(a =>
                a.ChildId == attendance.ChildId &&
                a.AttendanceDate == attendance.AttendanceDate);

            if (duplicate)
                return Conflict("Attendance has already been recorded for this child on this date.");

            // Use the foreign key; EF Core loads the Child when needed.
            attendance.Child = null;

            _context.ChildAttendances.Add(attendance);
            await _context.SaveChangesAsync();

            return CreatedAtRoute(
                "GetChildAttendanceById",
                new { id = attendance.Id },
                attendance);
        }

        // PUT: api/ChildAttendance/5
        [HttpPut("{id}")]
        public async Task<IActionResult> Update(
            int id, ChildAttendance attendance)
        {
            if (id != attendance.Id)
                return BadRequest("The ID in the URL does not match the attendance ID.");

            var existing = await _context.ChildAttendances
                .FirstOrDefaultAsync(a => a.Id == id);

            if (existing == null)
                return NotFound();

            var childExists = await _context.Children
                .AnyAsync(c => c.Id == attendance.ChildId);

            if (!childExists)
                return BadRequest("The specified child does not exist.");

            var duplicate = await _context.ChildAttendances.AnyAsync(a =>
                a.Id != id &&
                a.ChildId == attendance.ChildId &&
                a.AttendanceDate == attendance.AttendanceDate);

            if (duplicate)
                return Conflict("Attendance has already been recorded for this child on this date.");

            existing.ChildId = attendance.ChildId;
            existing.AttendanceDate = attendance.AttendanceDate;
            existing.Status = attendance.Status;
            existing.ArrivalTime = attendance.ArrivalTime;
            existing.PickupTime = attendance.PickupTime;
            existing.Notes = attendance.Notes;

            await _context.SaveChangesAsync();

            return NoContent();
        }

        // DELETE: api/ChildAttendance/5
        [HttpDelete("{id}")]
        public async Task<IActionResult> Delete(int id)
        {
            var attendance = await _context.ChildAttendances
                .FindAsync(id);

            if (attendance == null)
                return NotFound();

            _context.ChildAttendances.Remove(attendance);
            await _context.SaveChangesAsync();

            return NoContent();
        }
    }
}