namespace DMS_Backend.Models.DTOs.Products;

public class ProductListItemDto
{
    public Guid Id { get; set; }
    public string Code { get; set; } = string.Empty;
    public string Name { get; set; } = string.Empty;
    public string CategoryName { get; set; } = string.Empty;
    public string UnitOfMeasure { get; set; } = string.Empty;
    public decimal UnitPrice { get; set; }
    public string? ProductionSection { get; set; }
    public bool IsActive { get; set; }
    public bool EnableLabelPrint { get; set; }
    public bool AllowFutureLabelPrint { get; set; }
}
