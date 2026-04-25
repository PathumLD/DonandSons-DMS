using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace DMS_Backend.Models.Entities;

public class Product : BaseEntity
{
    [Required]
    [MaxLength(20)]
    public string Code { get; set; } = string.Empty;

    [Required]
    [MaxLength(200)]
    public string Name { get; set; } = string.Empty;

    [MaxLength(500)]
    public string? Description { get; set; }

    // Category relationship
    [Required]
    public Guid CategoryId { get; set; }
    public Category? Category { get; set; }

    // Unit of Measure relationship
    [Required]
    public Guid UnitOfMeasureId { get; set; }
    public UnitOfMeasure? UnitOfMeasure { get; set; }

    // Pricing
    [Column(TypeName = "decimal(18,2)")]
    public decimal UnitPrice { get; set; }

    // Product type and section
    [MaxLength(50)]
    public string? ProductType { get; set; } // e.g., "Bread", "Bun", "Pastry"

    [MaxLength(100)]
    public string? ProductionSection { get; set; } // e.g., "Bakery 1", "Plain Roll Section", "Pastry Section"

    // Variant flags
    public bool HasFullSize { get; set; } = true;
    public bool HasMiniSize { get; set; } = false;

    // Decimal handling
    public bool AllowDecimal { get; set; } = false;
    public int DecimalPlaces { get; set; } = 0;

    // Rounding
    public int RoundingValue { get; set; } = 1; // e.g., 5 for bakery, 1 for others

    // Production flags
    public bool IsPlainRollItem { get; set; } = false;
    public bool RequireOpenStock { get; set; } = true;

    // Label printing
    public bool EnableLabelPrint { get; set; } = true;
    public bool AllowFutureLabelPrint { get; set; } = false;

    // Display order
    public int SortOrder { get; set; } = 0;

    // Delivery turns (stored as JSON array of turn IDs)
    [Column(TypeName = "jsonb")]
    public List<int>? DefaultDeliveryTurns { get; set; }

    [Column(TypeName = "jsonb")]
    public List<int>? AvailableInTurns { get; set; }
}
