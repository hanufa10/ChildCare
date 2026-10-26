
using Microsoft.AspNetCore.Identity;

namespace Daycare.Api.Identity;

public class ApplicationUser : IdentityUser
{
    public string FirstName { get; set; } = string.Empty;

    public string LastName { get; set; } = string.Empty;
    public bool MustChangePassword { get; set; } = false;
}