
using Daycare.Api.Enums;

namespace Daycare.Api.DTOs;

public class RegisterChildRequest
{
    // Child information
    public string ChildFirstName { get; set; } = string.Empty;
    public string ChildLastName { get; set; } = string.Empty;
    public DateOnly ChildDateOfBirth { get; set; }
    public string Gender { get; set; } = string.Empty;
    public string Allergies { get; set; } = string.Empty;
    public string HealthConditions { get; set; } = string.Empty;

    // Existing parent: supply the parent's ID
    public int? ExistingParentId { get; set; }

    // New parent information
    public string ParentFirstName { get; set; } = string.Empty;
    public string ParentLastName { get; set; } = string.Empty;
    public string ParentPhoneNumber { get; set; } = string.Empty;
    public string ParentEmail { get; set; } = string.Empty;
    public string? ParentPassword { get; set; } = string.Empty;

    // Parent or Guardian
    public Relation Relation { get; set; }
}
