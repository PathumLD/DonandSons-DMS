namespace DMS_Backend.Models.DTOs.OutletEmployees;

public sealed class OutletEmployeeDetailDto
{
    public Guid Id { get; set; }
    public Guid OutletId { get; set; }
    public string OutletName { get; set; } = string.Empty;
    public string OutletCode { get; set; } = string.Empty;
    public Guid UserId { get; set; }
    public string UserName { get; set; } = string.Empty;
    public string UserEmail { get; set; } = string.Empty;
    public string? Designation { get; set; }
    public bool IsManager { get; set; }
    public DateTime JoinedDate { get; set; }
    public DateTime? LeftDate { get; set; }
    public bool IsActive { get; set; }
    public DateTime CreatedAt { get; set; }
    public DateTime? UpdatedAt { get; set; }
}
