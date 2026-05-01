namespace DMS_Backend.Models.DTOs.ProductionCancels;

public sealed class ProductionCancelListDto
{
    public Guid Id { get; set; }
    public string CancelNo { get; set; } = string.Empty;
    public DateTime CancelDate { get; set; }
    public string ProductionNo { get; set; } = string.Empty;
    public Guid ProductId { get; set; }
    public string ProductName { get; set; } = string.Empty;
    public decimal CancelledQty { get; set; }
    public string Reason { get; set; } = string.Empty;
    public string Status { get; set; } = string.Empty;
    public DateTime UpdatedAt { get; set; }
    public string? CreatedByName { get; set; }
    public string? ApprovedByName { get; set; }
}
