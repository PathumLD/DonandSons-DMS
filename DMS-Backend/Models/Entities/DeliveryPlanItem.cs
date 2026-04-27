using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace DMS_Backend.Models.Entities;

/// <summary>
/// Represents a line item in a delivery plan with quantities per product and outlet.
/// </summary>
[Table("delivery_plan_items")]
public class DeliveryPlanItem : BaseEntity
{
    /// <summary>
    /// The parent delivery plan this item belongs to.
    /// </summary>
    [Required]
    [Column("delivery_plan_id")]
    public Guid DeliveryPlanId { get; set; }

    /// <summary>
    /// The product for this line item.
    /// </summary>
    [Required]
    [Column("product_id")]
    public Guid ProductId { get; set; }

    /// <summary>
    /// The outlet this item is for.
    /// </summary>
    [Required]
    [Column("outlet_id")]
    public Guid OutletId { get; set; }

    /// <summary>
    /// Quantity of full-sized products.
    /// </summary>
    [Column("full_quantity", TypeName = "decimal(18,4)")]
    public decimal FullQuantity { get; set; } = 0;

    /// <summary>
    /// Quantity of mini-sized products.
    /// </summary>
    [Column("mini_quantity", TypeName = "decimal(18,4)")]
    public decimal MiniQuantity { get; set; } = 0;

    /// <summary>
    /// Optional notes for this specific line item.
    /// </summary>
    [Column("notes")]
    public string? Notes { get; set; }

    // Navigation properties
    public DeliveryPlan? DeliveryPlan { get; set; }
    public Product? Product { get; set; }
    public Outlet? Outlet { get; set; }
}
