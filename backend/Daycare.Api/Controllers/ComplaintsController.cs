using Daycare.Api.Data;
using Daycare.Api.Models;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace Daycare.Api.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class ComplaintsController : ControllerBase
    {
        private readonly DaycareDbContext _context;

        public ComplaintsController(DaycareDbContext context)
        {
            _context = context;
        }

        // GET: api/Complaints
        [HttpGet]
        public async Task<ActionResult<IEnumerable<Complaint>>> GetComplaints()
        {
            return await _context.Complaints
                .OrderByDescending(c => c.CreatedAt)
                .ToListAsync();
        }

        // GET: api/Complaints/5
        [HttpGet("{id}")]
        public async Task<ActionResult<Complaint>> GetComplaint(int id)
        {
            var complaint = await _context.Complaints.FindAsync(id);

            if (complaint == null)
            {
                return NotFound();
            }

            return complaint;
        }

        // POST: api/Complaints
        [HttpPost]
        public async Task<ActionResult<Complaint>> PostComplaint(Complaint complaint)
        {
            complaint.Id = 0;
            complaint.CreatedAt = DateTime.UtcNow;
            complaint.Status = "Pending";

            _context.Complaints.Add(complaint);
            await _context.SaveChangesAsync();

            return CreatedAtAction(
                nameof(GetComplaint),
                new { id = complaint.Id },
                complaint);
        }

        // PUT: api/Complaints/5
        [HttpPut("{id}")]
        public async Task<IActionResult> PutComplaint(int id, Complaint complaint)
        {
            if (id != complaint.Id)
            {
                return BadRequest();
            }

            var existingComplaint = await _context.Complaints.FindAsync(id);

            if (existingComplaint == null)
            {
                return NotFound();
            }

            existingComplaint.Subject = complaint.Subject;
            existingComplaint.Description = complaint.Description;
            existingComplaint.Status = complaint.Status;
            existingComplaint.AdminResponse = complaint.AdminResponse;
            existingComplaint.UpdatedAt = DateTime.UtcNow;

            await _context.SaveChangesAsync();

            return NoContent();
        }

        // DELETE: api/Complaints/5
        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteComplaint(int id)
        {
            var complaint = await _context.Complaints.FindAsync(id);

            if (complaint == null)
            {
                return NotFound();
            }

            _context.Complaints.Remove(complaint);
            await _context.SaveChangesAsync();

            return NoContent();
        }
    }
}