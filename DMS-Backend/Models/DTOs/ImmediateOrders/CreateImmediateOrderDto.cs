namespace DMS_Backend.Models.DTOs.ImmediateOrders;

public sealed class CreateImmediateOrderDto
{
    public required DateTime OrderDate { get; set; }
    public required Guid DeliveryTurnId { get; set; }
    public required Guid OutletId { get; set; }
    public required Guid ProductId { get; set; }
    public decimal FullQuantity { get; set; } = 0;
    public decimal MiniQuantity { get; set; } = 0;
    public required string RequestedBy { get; set; }
    public required string Reason { get; set; }
}
