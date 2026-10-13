
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
        // Admins see all announcements.
        // Other users see published announcements assigned to them.
        [HttpGet]
        public async Task<IActionResult> GetAnnouncements()
        {
            var query = _context.Announcements
                .AsNoTracking()
                .AsQueryable();

            if (!User.IsInRole("Admin"))
            {
                var userId = User.FindFirstValue(
                    ClaimTypes.NameIdentifier);

                query = query.Where(a =>
                    a.IsPublished &&
                    a.Recipients.Any(r =>
                        r.RecipientUserId == userId));
            }

            var announcements = await query
                .OrderByDescending(a => a.CreatedAt)
                .Select(a => new
                {
                    id = a.Id,
                    title = a.Title,
                    message = a.Message,
                    audience = a.Audience,
                    createdAt = a.CreatedAt,
                    isPublished = a.IsPublished,

                    // Only administrators receive the full recipient ID list.
                    recipientUserIds = User.IsInRole("Admin")
        ? a.Recipients
            .Select(r => r.RecipientUserId)
            .ToList()
        : new List<string>()
                })
                .ToListAsync();

            return Ok(announcements);
        }

        // GET: api/Announcements/available-parents
        // Returns parent accounts for the admin's multi-select list.
        [HttpGet("available-parents")]
        [Authorize(Roles = "Admin")]
        public async Task<IActionResult> GetAvailableParents()
        {
            var parents = await _userManager
                .GetUsersInRoleAsync("Parent");

            var result = parents
                .Select(parent => new
                {
                    id = parent.Id,
                    firstName = parent.FirstName,
                    lastName = parent.LastName,
                    fullName = (
                        $"{parent.FirstName} {parent.LastName}"
                    ).Trim(),
                    phoneNumber = parent.PhoneNumber
                })
                .OrderBy(parent => parent.fullName)
                .ToList();

            return Ok(result);
        }
    
        // GET: api/Announcements/5
        [HttpGet("{id:int}")]
        public async Task<ActionResult<Announcement>>
            GetAnnouncement(int id)
        {
            var userId = User.FindFirstValue(
                ClaimTypes.NameIdentifier);

            var announcement = await _context.Announcements
                .Where(a =>
                    a.Id == id &&
                    a.IsPublished &&
                    a.Recipients.Any(r =>
                        r.RecipientUserId == userId))
                .FirstOrDefaultAsync();

            if (announcement == null)
                return NotFound();

            return Ok(announcement);
        }
    
        // PUT: api/Announcements/5
        // Admins can update announcements.
        [HttpPut("{id:int}")]
        [Authorize(Roles = "Admin")]
        public async Task<IActionResult> UpdateAnnouncement(
            int id,
            [FromBody] UpdateAnnouncementRequest request)
        {
            if (string.IsNullOrWhiteSpace(request.Title) ||
                string.IsNullOrWhiteSpace(request.Message))
            {
                return BadRequest(
                    "Title and message are required.");
            }

            var announcement = await _context.Announcements
                .Include(a => a.Recipients)
                .FirstOrDefaultAsync(a => a.Id == id);

            if (announcement == null)
                return NotFound("Announcement not found.");

            var audience = request.Audience.Trim();
            List<ApplicationUser> recipients;

            switch (audience)
            {
                case "Everyone":
                    recipients = await _userManager.Users.ToListAsync();
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
                    var requestedIds = (request.RecipientUserIds
                            ?? new List<string>())
                        .Where(id => !string.IsNullOrWhiteSpace(id))
                        .Select(id => id.Trim())
                        .Distinct()
                        .ToList();

                    if (requestedIds.Count == 0)
                    {
                        return BadRequest(
                            "Select at least one parent.");
                    }

                    var allParents = await _userManager
                        .GetUsersInRoleAsync("Parent");

                    var parentLookup = allParents.ToDictionary(
                        parent => parent.Id);

                    if (requestedIds.Any(
                        userId => !parentLookup.ContainsKey(userId)))
                    {
                        return BadRequest(
                            "One or more selected IDs are not valid parent accounts.");
                    }

                    recipients = requestedIds
                        .Select(userId => parentLookup[userId])
                        .ToList();

                    break;
                }

                default:
                    return BadRequest(
                        "Invalid announcement audience.");
            }

            // Update announcement details.
            announcement.Title = request.Title.Trim();
            announcement.Message = request.Message.Trim();
            announcement.Audience = audience;
            announcement.IsPublished = request.IsPublished;
            announcement.UpdatedAt = DateTime.UtcNow;

            // Replace the existing recipient assignments.
            _context.AnnouncementRecipients.RemoveRange(
                announcement.Recipients.ToList());

            announcement.Recipients.Clear();

            foreach (var recipient in recipients)
            {
                announcement.Recipients.Add(
                    new AnnouncementRecipient
                    {
                        RecipientUserId = recipient.Id,
                        IsRead = false,
                        ReadAt = null
                    });
            }

            await _context.SaveChangesAsync();

            return NoContent();
        }

        // POST: api/Announcements
        // Admins can create announcements.
        [HttpPost]
        [Authorize(Roles = "Admin")]
        public async Task<ActionResult<Announcement>>
            CreateAnnouncement(
                [FromBody] CreateAnnouncementRequest request)
        {
            if (string.IsNullOrWhiteSpace(request.Title) ||
                string.IsNullOrWhiteSpace(request.Message))
            {
                return BadRequest(
                    "Title and message are required.");
            }

            var creatorId = User.FindFirstValue(
                ClaimTypes.NameIdentifier);

            if (creatorId == null)
                return Unauthorized();

            var audience = request.Audience.Trim();

            List<ApplicationUser> recipients;

            switch (audience)
            {
                case "Everyone":
                    recipients = await _userManager.Users
                        .ToListAsync();
                    break;

                case "Staff":
                    recipients = (await _userManager
                        .GetUsersInRoleAsync("Staff"))
                        .ToList();
                    break;

                case "Parents":
                    recipients = (await _userManager
                        .GetUsersInRoleAsync("Parent"))
                        .ToList();
                    break;

                case "SelectedParents":
                    {
                        var requestedIds =
                            (request.RecipientUserIds ?? new List<string>())
                            .Where(id =>
                                !string.IsNullOrWhiteSpace(id))
                            .Select(id => id.Trim())
                            .Distinct()
                            .ToList();

                        if (requestedIds.Count == 0)
                        {
                            return BadRequest(
                                "Select at least one parent.");
                        }

                        var allParents = await _userManager
                            .GetUsersInRoleAsync("Parent");

                        var parentLookup = allParents.ToDictionary(
                            parent => parent.Id);

                        var invalidIds = requestedIds
                            .Where(id => !parentLookup.ContainsKey(id))
                            .ToList();

                        if (invalidIds.Count > 0)
                        {
                            return BadRequest(
                                "One or more selected IDs are not valid parent accounts.");
                        }

                        recipients = requestedIds
                            .Select(id => parentLookup[id])
                            .ToList();

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

            return Ok(new
            {
                id = announcement.Id,
                title = announcement.Title,
                message = announcement.Message,
                audience = announcement.Audience,
                createdAt = announcement.CreatedAt,
                isPublished = announcement.IsPublished
            });
        }

        // PUT: api/Announcements/5/read
        [HttpPut("{id:int}/read")]
        public async Task<IActionResult> MarkAsRead(int id)
        {
            var userId = User.FindFirstValue(
                ClaimTypes.NameIdentifier);

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
        [HttpPut("{id:int}/publish")]
        [Authorize(Roles = "Admin")]
        public async Task<IActionResult> PublishAnnouncement(int id)
        {
            var announcement = await _context.Announcements
                .FindAsync(id);

            if (announcement == null)
                return NotFound();

            announcement.IsPublished = true;
            announcement.UpdatedAt = DateTime.UtcNow;

            await _context.SaveChangesAsync();

            return NoContent();
        }

        // DELETE: api/Announcements/5
        [HttpDelete("{id:int}")]
        [Authorize(Roles = "Admin")]
        public async Task<IActionResult> DeleteAnnouncement(int id)
        {
            var announcement = await _context.Announcements
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
    
    public class UpdateAnnouncementRequest
    {
        public string Title { get; set; } = string.Empty;
        public string Message { get; set; } = string.Empty;
        public string Audience { get; set; } = "Everyone";
        public bool IsPublished { get; set; } = true;
        public List<string> RecipientUserIds { get; set; } = new();
    }

}
