
using System;

namespace Daycare.Api.Models
{
    public class AnnouncementRecipient
    {
        public int Id { get; set; }

        public int AnnouncementId { get; set; }

        public Announcement? Announcement { get; set; }

        public string RecipientUserId { get; set; } = string.Empty;

        public bool IsRead { get; set; } = false;

        public DateTime? ReadAt { get; set; }
    }
}
