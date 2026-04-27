namespace DMS_Backend.Models.DTOs.DeliveryPlans;

public sealed class DeliveryPlanDetailDto
{
    public Guid Id { get; set; }
    public string PlanNo { get; set; } = string.Empty;
    public DateTime PlanDate { get; set; }
    public Guid DeliveryTurnId { get; set; }
    public string DeliveryTurnName { get; set; } = string.Empty;
    public Guid DayTypeId { get; set; }
    public string DayTypeName { get; set; } = string.Empty;
    public string Status { get; set; } = string.Empty;
    public bool UseFreezerStock { get; set; }
    public List<Guid>? ExcludedOutlets { get; set; }
    public List<Guid>? ExcludedProducts { get; set; }
    public string? Notes { get; set; }
    public List<DeliveryPlanItemDto> Items { get; set; } = new();
    public bool IsActive { get; set; }
    public DateTime CreatedAt { get; set; }
    public DateTime UpdatedAt { get; set; }
    public Guid? CreatedById { get; set; }
    public Guid? UpdatedById { get; set; }
}

public sealed class DeliveryPlanItemDto
{
    public Guid Id { get; set; }
    public Guid DeliveryPlanId { get; set; }
    public Guid ProductId { get; set; }
    public string ProductName { get; set; } = string.Empty;
    public Guid OutletId { get; set; }
    public string OutletName { get; set; } = string.Empty;
    public decimal FullQuantity { get; set; }
    public decimal MiniQuantity { get; set; }
    public string? Notes { get; set; }
}
