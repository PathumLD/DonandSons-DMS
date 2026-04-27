namespace DMS_Backend.Models.DTOs.DeliverySummary;

public class DeliverySummaryDto
{
    public DateTime DeliveryDate { get; set; }
    public int TurnId { get; set; }
    public string TurnName { get; set; } = string.Empty;
    public List<DeliveryOutletSummaryDto> Outlets { get; set; } = new();
    public List<DeliveryProductTotalDto> ProductTotals { get; set; } = new();
}

public class DeliveryOutletSummaryDto
{
    public Guid OutletId { get; set; }
    public string OutletCode { get; set; } = string.Empty;
    public string OutletName { get; set; } = string.Empty;
    public List<DeliveryProductSummaryDto> Products { get; set; } = new();
}

public class DeliveryProductSummaryDto
{
    public Guid ProductId { get; set; }
    public string ProductCode { get; set; } = string.Empty;
    public string ProductName { get; set; } = string.Empty;
    public decimal RegularFullQty { get; set; }
    public decimal RegularMiniQty { get; set; }
    public decimal CustomizedFullQty { get; set; }
    public decimal CustomizedMiniQty { get; set; }
    public decimal TotalQty { get; set; }
}

public class DeliveryProductTotalDto
{
    public Guid ProductId { get; set; }
    public string ProductCode { get; set; } = string.Empty;
    public string ProductName { get; set; } = string.Empty;
    public decimal TotalRegularFull { get; set; }
    public decimal TotalRegularMini { get; set; }
    public decimal TotalCustomizedFull { get; set; }
    public decimal TotalCustomizedMini { get; set; }
    public decimal GrandTotal { get; set; }
}
