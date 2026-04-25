namespace DMS_Backend.Models.DTOs.Products;

public class CreateProductDto
{
    public string Code { get; set; } = string.Empty;
    public string Name { get; set; } = string.Empty;
    public string? Description { get; set; }
    
    public Guid CategoryId { get; set; }
    public Guid UnitOfMeasureId { get; set; }
    
    public decimal UnitPrice { get; set; }
    public string? ProductType { get; set; }
    public string? ProductionSection { get; set; }
    
    public bool HasFullSize { get; set; } = true;
    public bool HasMiniSize { get; set; } = false;
    
    public bool AllowDecimal { get; set; } = false;
    public int DecimalPlaces { get; set; } = 0;
    public int RoundingValue { get; set; } = 1;
    
    public bool IsPlainRollItem { get; set; } = false;
    public bool RequireOpenStock { get; set; } = true;
    
    public bool EnableLabelPrint { get; set; } = true;
    public bool AllowFutureLabelPrint { get; set; } = false;
    
    public int SortOrder { get; set; } = 0;
    public List<int>? DefaultDeliveryTurns { get; set; }
    public List<int>? AvailableInTurns { get; set; }
    
    public bool IsActive { get; set; } = true;
}
