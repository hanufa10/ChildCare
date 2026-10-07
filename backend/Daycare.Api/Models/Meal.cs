using Daycare.Api.Enums;
namespace Daycare.Api.Models;
public class Meal
{
    public int Id { get; set; }
    public string Name { get; set; } = string.Empty;
    public DateTime Date { get; set; }
    public MealType Type { get; set; }
    public string Description { get; set; } = string.Empty;
}