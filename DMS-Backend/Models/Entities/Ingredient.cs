using System.ComponentModel.DataAnnotations.Schema;

namespace DMS_Backend.Models.Entities;

[Table("ingredients")]
public class Ingredient : BaseEntity
{
    public string Code { get; set; } = string.Empty;
    public string Name { get; set; } = string.Empty;
    public string? Description { get; set; }

    public Guid CategoryId { get; set; }
    public Category Category { get; set; } = null!;

    public Guid UnitOfMeasureId { get; set; }
    public UnitOfMeasure UnitOfMeasure { get; set; } = null!;

    // Type: "Raw" or "Semi-Finished"
    public string IngredientType { get; set; } = "Raw";

    // Semi-finished specific flag
    public bool IsSemiFinishedItem { get; set; }

    // Extra percentage flags for production calculation
    public bool ExtraPercentageApplicable { get; set; }
    public decimal ExtraPercentage { get; set; }

    // Decimal handling
    public bool AllowDecimal { get; set; }
    public int DecimalPlaces { get; set; } = 2;

    // Pricing
    public decimal UnitPrice { get; set; }

    // Display order
    public int SortOrder { get; set; }
}
