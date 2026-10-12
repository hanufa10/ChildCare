
namespace Daycare.Api.Models;

public class Parent
{
    public int Id { get; set; }

    public string FirstName { get; set; } = string.Empty;

    public string LastName { get; set; } = string.Empty;

    public string PhoneNumber { get; set; } = string.Empty;

    public string Email { get; set; } = string.Empty;

    // Links this parent profile to its login account.
    // Nullable to support existing parent records.
    public string? ApplicationUserId { get; set; }

    public ICollection<ParentChild> ParentChildren { get; set; }
        = new List<ParentChild>();
}
