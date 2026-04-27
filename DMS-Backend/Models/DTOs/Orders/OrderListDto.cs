namespace DMS_Backend.Models.DTOs.Orders;

public sealed class OrderListDto
{
    public Guid Id { get; set; }
    public string OrderNo { get; set; } = string.Empty;
    public DateTime OrderDate { get; set; }
    public Guid? DeliveryPlanId { get; set; }
    public string? DeliveryPlanNo { get; set; }
    public string Status { get; set; } = string.Empty;
    public bool UseFreezerStock { get; set; }
    public int TotalItems { get; set; }
    public DateTime UpdatedAt { get; set; }
}
