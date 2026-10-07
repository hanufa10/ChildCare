using Daycare.Api.Enums;
namespace Daycare.Api.DTOs;
public class RegisterChildRequest
{
    public string ChildFirstName { get; set; } = string.Empty;
    public string ChildLastName { get; set; } = string.Empty;
    public DateOnly ChildDateOfBirth { get; set; }
    public string Gender { get; set; } = string.Empty;

    public int? ExistingParentId {get; set;}

    public string ParentFirstName { get; set; } = string.Empty;
    public string ParentLastName { get; set; } = string.Empty;
    public string ParentPhoneNumber {get; set;} = string.Empty;
    public string ParentEmail { get; set;} = string.Empty;

    public Relation Relation { get; set;}
}