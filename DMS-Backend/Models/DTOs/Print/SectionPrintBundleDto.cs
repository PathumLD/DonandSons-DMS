namespace DMS_Backend.Models.DTOs.Print;

public class SectionPrintBundleDto
{
    public Guid ProductionPlanId { get; set; }
    public DateTime ProductionDate { get; set; }
    public Guid ProductionSectionId { get; set; }
    public string ProductionSectionName { get; set; } = string.Empty;
    public List<SectionBundleProductDto> Products { get; set; } = new();
    public decimal TotalQuantity { get; set; }
    public DateTime PrintedAt { get; set; } = DateTime.UtcNow;
}

public class SectionBundleProductDto
{
    public Guid ProductId { get; set; }
    public string ProductCode { get; set; } = string.Empty;
    public string ProductName { get; set; } = string.Empty;
    public decimal ProduceQty { get; set; }
    public bool HasRecipe { get; set; }
    public List<SectionBundleIngredientDto> Ingredients { get; set; } = new();
}

public class SectionBundleIngredientDto
{
    public Guid IngredientId { get; set; }
    public string IngredientCode { get; set; } = string.Empty;
    public string IngredientName { get; set; } = string.Empty;
    public decimal Quantity { get; set; }
    public string Unit { get; set; } = string.Empty;
}
