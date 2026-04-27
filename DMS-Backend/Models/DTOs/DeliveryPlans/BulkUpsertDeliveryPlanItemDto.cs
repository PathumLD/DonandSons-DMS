namespace DMS_Backend.Models.DTOs.DeliveryPlans;

public sealed class BulkUpsertDeliveryPlanItemDto
{
    public Guid? Id { get; set; }
    public required Guid ProductId { get; set; }
    public required Guid OutletId { get; set; }
    public decimal FullQuantity { get; set; } = 0;
    public decimal MiniQuantity { get; set; } = 0;
    public string? Notes { get; set; }
}
