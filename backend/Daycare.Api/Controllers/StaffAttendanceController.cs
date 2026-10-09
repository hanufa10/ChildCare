
using Daycare.Api.Data;
using Daycare.Api.Models;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace Daycare.Api.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class StaffAttendanceController : ControllerBase
    {
        private readonly DaycareDbContext _context;

        public StaffAttendanceController(DaycareDbContext context)
        {
            _context = context;
        }

        // GET: api/StaffAttendance
        [HttpGet]
        public async Task<ActionResult<IEnumerable<StaffAttendance>>> GetAll()
        {
            return await _context.StaffAttendances
                .Include(a => a.Staff)
                .OrderByDescending(a => a.AttendanceDate)
                .ToListAsync();
        }

        // GET: api/StaffAttendance/5
        [HttpGet("{id}", Name = "GetStaffAttendanceById")]
        public async Task<ActionResult<StaffAttendance>> GetById(int id)
        {
            var attendance = await _context.StaffAttendances
                .Include(a => a.Staff)
                .FirstOrDefaultAsync(a => a.Id == id);

            if (attendance == null)
                return NotFound();

            return attendance;
        }

        // GET: api/StaffAttendance/staff/2
        [HttpGet("staff/{staffId}")]
        public async Task<ActionResult<IEnumerable<StaffAttendance>>> GetByStaff(
            int staffId)
        {
            var records = await _context.StaffAttendances
                .Where(a => a.StaffId == staffId)
                .OrderByDescending(a => a.AttendanceDate)
                .ToListAsync();

            return records;
        }

        // POST: api/StaffAttendance
        [HttpPost]
        public async Task<ActionResult<StaffAttendance>> Create(
            StaffAttendance attendance)
        {
            var staffExists = await _context.Staff
                .AnyAsync(s => s.Id == attendance.StaffId);

            if (!staffExists)
                return BadRequest("The specified staff member does not exist.");

            var duplicate = await _context.StaffAttendances.AnyAsync(a =>
                a.StaffId == attendance.StaffId &&
                a.AttendanceDate == attendance.AttendanceDate);

            if (duplicate)
                return Conflict(
                    "Attendance has already been recorded for this staff member on this date.");

            attendance.Staff = null;

            _context.StaffAttendances.Add(attendance);
            await _context.SaveChangesAsync();

            return CreatedAtRoute(
                "GetStaffAttendanceById",
                new { id = attendance.Id },
                attendance);
        }

        // PUT: api/StaffAttendance/5
        [HttpPut("{id}")]
        public async Task<IActionResult> Update(
            int id, StaffAttendance attendance)
        {
            if (id != attendance.Id)
                return BadRequest(
                    "The ID in the URL does not match the attendance ID.");

            var existing = await _context.StaffAttendances
                .FirstOrDefaultAsync(a => a.Id == id);

            if (existing == null)
                return NotFound();

            var staffExists = await _context.Staff
                .AnyAsync(s => s.Id == attendance.StaffId);

            if (!staffExists)
                return BadRequest("The specified staff member does not exist.");

            var duplicate = await _context.StaffAttendances.AnyAsync(a =>
                a.Id != id &&
                a.StaffId == attendance.StaffId &&
                a.AttendanceDate == attendance.AttendanceDate);

            if (duplicate)
                return Conflict(
                    "Attendance has already been recorded for this staff member on this date.");

            existing.StaffId = attendance.StaffId;
            existing.AttendanceDate = attendance.AttendanceDate;
            existing.Status = attendance.Status;
            existing.CheckInTime = attendance.CheckInTime;
            existing.CheckOutTime = attendance.CheckOutTime;
            existing.Notes = attendance.Notes;

            await _context.SaveChangesAsync();

            return NoContent();
        }

        // DELETE: api/StaffAttendance/5
        [HttpDelete("{id}")]
        public async Task<IActionResult> Delete(int id)
        {
            var attendance = await _context.StaffAttendances
                .FindAsync(id);

            if (attendance == null)
                return NotFound();

            _context.StaffAttendances.Remove(attendance);
            await _context.SaveChangesAsync();

            return NoContent();
        }
    }
}