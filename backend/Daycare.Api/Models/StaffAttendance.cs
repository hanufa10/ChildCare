
namespace Daycare.Api.Models;

public class StaffAttendance
{
    public int Id { get; set; }

    public int StaffId { get; set; }
    public Staff? Staff { get; set; }

    public DateOnly AttendanceDate { get; set; }

    public string Status { get; set; } = "Present";

    public TimeOnly? CheckInTime { get; set; }
    public TimeOnly? CheckOutTime { get; set; }

    public string? Notes { get; set; }
}