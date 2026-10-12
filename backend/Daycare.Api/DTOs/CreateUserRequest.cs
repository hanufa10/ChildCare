
using System.ComponentModel.DataAnnotations;

namespace Daycare.Api.DTOs;

public class CreateUserRequest
{
    [Required, StringLength(100)]
    public string FirstName { get; set; } = string.Empty;

    [Required, StringLength(100)]
    public string LastName { get; set; } = string.Empty;

    [Required, EmailAddress]
    public string Email { get; set; } = string.Empty;

    [Phone]
    public string? PhoneNumber { get; set; }

    [Required, MinLength(8)]
    public string Password { get; set; } = string.Empty;
    
public string? Gender { get; set; }
public string? Position { get; set; }
public DateOnly? HireDate { get; set; }

    [Required]
    public string Role { get; set; } = string.Empty;
}
