using Daycare.Api.Enums;
using Microsoft.AspNetCore.Mvc.ModelBinding.Validation;
namespace Daycare.Api.Models;
public class ParentChild
{
    public int ParentId { get; set; }

    [ValidateNever]
    public Parent Parent { get; set; } = null!;
    public int ChildId { get; set; }

    [ValidateNever]
    public Child Child { get; set; } = null!;
    public Relation Relation { get; set; }
}