
using System.Security.Claims;
using Daycare.Api.Data;
using Daycare.Api.Models;
using Daycare.Api.Identity;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace Daycare.Api.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    [Authorize]
    public class AnnouncementsController : ControllerBase
    {
        private readonly DaycareDbContext _context;
        private readonly UserManager<ApplicationUser> _userManager;

        public AnnouncementsController(
            DaycareDbContext context,
            UserManager<ApplicationUser> userManager)
        {
            _context = context;
            _userManager = userManager;
        }

        // GET: api/Announcements
        [HttpGet]
        public async Task<ActionResult<IEnumerable<Announcement>>>
            GetAnnouncements()
        {
            var userId =
                User.FindFirstValue(ClaimTypes.NameIdentifier);

            if (userId == null)
                return Unauthorized();

            var announcements = await _context.Announcements
                .Where(a => a.IsPublished &&
                    a.Recipients.Any(r =>
                        r.RecipientUserId == userId))
                .OrderByDescending(a => a.CreatedAt)
                .ToListAsync();

            return Ok(announcements);
        }

        // GET: api/Announcements/5
        [HttpGet("{id}")]
        public async Task<ActionResult<Announcement>>
            GetAnnouncement(int id)
        {
            var userId =
                User.FindFirstValue(ClaimTypes.NameIdentifier);

            var announcement = await _context.Announcements
                .Where(a => a.Id == id && a.IsPublished &&
                    a.Recipients.Any(r =>
                        r.RecipientUserId == userId))
                .FirstOrDefaultAsync();

            if (announcement == null)
                return NotFound();

            return Ok(announcement);
        }

        // POST: api/Announcements
        // Admins can create announcements.
        [HttpPost]
        [Authorize(Roles = "Admin")]
        public async Task<ActionResult<Announcement>>
            CreateAnnouncement(CreateAnnouncementRequest request)
        {
            if (string.IsNullOrWhiteSpace(request.Title) ||
                string.IsNullOrWhiteSpace(request.Message))
            {
                return BadRequest(
                    "Title and message are required.");
            }

            var creatorId =
                User.FindFirstValue(ClaimTypes.NameIdentifier);

            if (creatorId == null)
                return Unauthorized();

            var audience = request.Audience.Trim();

            List<ApplicationUser> recipients;

            switch (audience)
            {
                case "Everyone":
                    recipients =
                        await _userManager.Users.ToListAsync();
                    break;

                case "Staff":
                    recipients = (await _userManager
                        .GetUsersInRoleAsync("Staff")).ToList();
                    break;

                case "Parents":
                    recipients = (await _userManager
                        .GetUsersInRoleAsync("Parent")).ToList();
                    break;

                case "SelectedParents":
                {
                    var requestedIds = request.RecipientUserIds
                        .Where(id => !string.IsNullOrWhiteSpace(id))
                        .Distinct()
                        .ToList();

                    if (requestedIds.Count == 0)
                        return BadRequest(
                            "Select at least one parent.");

                    var allParents = await _userManager
                        .GetUsersInRoleAsync("Parent");

                    recipients = allParents
                        .Where(p => requestedIds.Contains(p.Id))
                        .ToList();

                    if (recipients.Count != requestedIds.Count)
                        return BadRequest(
                            "One or more selected IDs are not parent accounts.");

                    break;
                }

                default:
                    return BadRequest(
                        "Audience must be Everyone, Staff, Parents, or SelectedParents.");
            }

            var announcement = new Announcement
            {
                Title = request.Title.Trim(),
                Message = request.Message.Trim(),
                Audience = audience,
                CreatedAt = DateTime.UtcNow,
                IsPublished = request.IsPublished
            };

            foreach (var recipient in recipients)
            {
                announcement.Recipients.Add(
                    new AnnouncementRecipient
                    {
                        RecipientUserId = recipient.Id,
                        IsRead = false
                    });
            }

            _context.Announcements.Add(announcement);
            await _context.SaveChangesAsync();

            return Ok(announcement);
        }

        // PUT: api/Announcements/5/read
        [HttpPut("{id}/read")]
        public async Task<IActionResult> MarkAsRead(int id)
        {
            var userId =
                User.FindFirstValue(ClaimTypes.NameIdentifier);

            var recipient = await _context.AnnouncementRecipients
                .FirstOrDefaultAsync(r =>
                    r.AnnouncementId == id &&
                    r.RecipientUserId == userId);

            if (recipient == null)
                return NotFound();

            recipient.IsRead = true;
            recipient.ReadAt = DateTime.UtcNow;

            await _context.SaveChangesAsync();

            return NoContent();
        }

        // PUT: api/Announcements/5/publish
        [HttpPut("{id}/publish")]
        [Authorize(Roles = "Admin")]
        public async Task<IActionResult> PublishAnnouncement(int id)
        {
            var announcement =
                await _context.Announcements.FindAsync(id);

            if (announcement == null)
                return NotFound();

            announcement.IsPublished = true;
            announcement.UpdatedAt = DateTime.UtcNow;

            await _context.SaveChangesAsync();

            return NoContent();
        }

        // DELETE: api/Announcements/5
        [HttpDelete("{id}")]
        [Authorize(Roles = "Admin")]
        public async Task<IActionResult> DeleteAnnouncement(int id)
        {
            var announcement =
                await _context.Announcements
                    .Include(a => a.Recipients)
                    .FirstOrDefaultAsync(a => a.Id == id);

            if (announcement == null)
                return NotFound();

            _context.Announcements.Remove(announcement);
            await _context.SaveChangesAsync();

            return NoContent();
        }
    }

    public class CreateAnnouncementRequest
    {
        public string Title { get; set; } = string.Empty;
        public string Message { get; set; } = string.Empty;
        public string Audience { get; set; } = "Everyone";
        public bool IsPublished { get; set; } = true;
        public List<string> RecipientUserIds { get; set; } = new();
    }
}
