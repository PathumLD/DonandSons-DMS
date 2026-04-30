namespace DMS_Backend.Models.DTOs.DailyProductions;

public sealed class DailyProductionListDto
{
    public Guid Id { get; set; }
    public string ProductionNo { get; set; } = string.Empty;
    public DateTime ProductionDate { get; set; }
    public Guid ProductId { get; set; }
    public string ProductName { get; set; } = string.Empty;
    public decimal PlannedQty { get; set; }
    public decimal ProducedQty { get; set; }
    public Guid ShiftId { get; set; }
    public string ShiftName { get; set; } = string.Empty;
    public string Status { get; set; } = string.Empty;
    public DateTime UpdatedAt { get; set; }
    public string? CreatedByName { get; set; }
    public string? ApprovedByName { get; set; }
}
