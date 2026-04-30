namespace DMS_Backend.Models.DTOs.StockAdjustments;

public sealed class StockAdjustmentDetailDto
{
    public Guid Id { get; set; }
    public string AdjustmentNo { get; set; } = string.Empty;
    public DateTime AdjustmentDate { get; set; }
    public Guid ProductId { get; set; }
    public string ProductName { get; set; } = string.Empty;
    public string AdjustmentType { get; set; } = string.Empty;
    public decimal Quantity { get; set; }
    public string Reason { get; set; } = string.Empty;
    public string Status { get; set; } = string.Empty;
    public string? Notes { get; set; }
    public Guid? ApprovedById { get; set; }
    public string? ApprovedByName { get; set; }
    public DateTime? ApprovedDate { get; set; }
    public DateTime CreatedAt { get; set; }
    public DateTime UpdatedAt { get; set; }
    public string? CreatedByName { get; set; }
}
