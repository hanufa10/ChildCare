using System;
using System.Collections.Generic;
namespace Daycare.Api.Models
{
    public class Announcement
    {
        public int Id{get; set;}
        public string Title {get; set;} = string.Empty;
        public string Message {get; set;} = string.Empty;
        public string Audience {get; set;} = "Everyone";
        public DateTime CreatedAt {get; set;} = DateTime.UtcNow;
        public DateTime? UpdatedAt {get;set;}
        public bool IsPublished {get;set;} = true;
        public ICollection<AnnouncementRecipient> Recipients {get;set;} = new List<AnnouncementRecipient>();
    }
}