namespace DMS_Backend.Models.DTOs.ShowroomOpenStock;

public sealed class ShowroomOpenStockListDto
{
    public Guid Id { get; set; }
    public Guid OutletId { get; set; }
    public string OutletCode { get; set; } = string.Empty;
    public string OutletName { get; set; } = string.Empty;
    public DateTime StockAsAt { get; set; }
    public DateTime UpdatedAt { get; set; }
}
