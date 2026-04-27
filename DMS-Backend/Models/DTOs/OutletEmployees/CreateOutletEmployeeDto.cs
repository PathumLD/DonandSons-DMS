namespace DMS_Backend.Models.DTOs.OutletEmployees;

public sealed class CreateOutletEmployeeDto
{
    public required Guid OutletId { get; set; }
    public required Guid UserId { get; set; }
    public string? Designation { get; set; }
    public bool IsManager { get; set; } = false;
    public required DateTime JoinedDate { get; set; }
    public DateTime? LeftDate { get; set; }
    public bool IsActive { get; set; } = true;
}
