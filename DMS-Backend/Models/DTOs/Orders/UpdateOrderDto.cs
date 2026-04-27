namespace DMS_Backend.Models.DTOs.Orders;

public sealed class UpdateOrderDto
{
    public required DateTime OrderDate { get; set; }
    public Guid? DeliveryPlanId { get; set; }
    public bool UseFreezerStock { get; set; } = false;
    public string? Notes { get; set; }
}
