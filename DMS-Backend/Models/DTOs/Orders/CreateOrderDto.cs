namespace DMS_Backend.Models.DTOs.Orders;

public sealed class CreateOrderDto
{
    public required string OrderNo { get; set; }
    public required DateTime OrderDate { get; set; }
    public Guid? DeliveryPlanId { get; set; }
    public bool UseFreezerStock { get; set; } = false;
    public string? Notes { get; set; }
}
