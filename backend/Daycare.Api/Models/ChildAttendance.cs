namespace Daycare.Api.Models;
public class ChildAttendance{
    public int Id { get; set; }

    public int ChildId { get; set; }
    public Child? Child { get; set; }

    public DateOnly AttendanceDate { get; set; }

    public string Status { get; set; } = "Present";

    public TimeOnly? ArrivalTime { get; set; }
    public TimeOnly? PickupTime { get; set; }

    public string? Notes { get; set; }
}