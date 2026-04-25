namespace DMS_Backend.Models.DTOs.Products;

public class UpdateProductDto
{
    public string Code { get; set; } = string.Empty;
    public string Name { get; set; } = string.Empty;
    public string? Description { get; set; }
    
    public Guid CategoryId { get; set; }
    public Guid UnitOfMeasureId { get; set; }
    
    public decimal UnitPrice { get; set; }
    public string? ProductType { get; set; }
    public string? ProductionSection { get; set; }
    
    public bool HasFullSize { get; set; }
    public bool HasMiniSize { get; set; }
    
    public bool AllowDecimal { get; set; }
    public int DecimalPlaces { get; set; }
    public int RoundingValue { get; set; }
    
    public bool IsPlainRollItem { get; set; }
    public bool RequireOpenStock { get; set; }
    
    public bool EnableLabelPrint { get; set; }
    public bool AllowFutureLabelPrint { get; set; }
    
    public int SortOrder { get; set; }
    public List<int>? DefaultDeliveryTurns { get; set; }
    public List<int>? AvailableInTurns { get; set; }
    
    public bool IsActive { get; set; }
}
