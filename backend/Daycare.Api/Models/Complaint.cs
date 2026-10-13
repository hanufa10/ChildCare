
namespace Daycare.Api.Models
{
    public class Complaint
    {
        public int Id { get; set; }

        public string Subject { get; set; } = string.Empty;
        public string Description { get; set; } = string.Empty;
        public string SubmittedByUserId { get; set; } = string.Empty;
        public string Status { get; set; } = "Pending";
        public string? AdminResponse { get; set; }
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
        public DateTime? UpdatedAt { get; set; }
    }
}
