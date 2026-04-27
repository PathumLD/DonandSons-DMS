using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace DMS_Backend.Models.Entities;

/// <summary>
/// Represents an immediate/ad-hoc order tied to a specific date, turn, and outlet.
/// Used for urgent orders that need quick approval and processing.
/// </summary>
[Table("immediate_orders")]
public class ImmediateOrder : BaseEntity
{
    /// <summary>
    /// Auto-generated unique order number (e.g., "IMM-2024-001").
    /// </summary>
    [Required]
    [MaxLength(50)]
    [Column("order_no")]
    public string OrderNo { get; set; } = string.Empty;

    /// <summary>
    /// The date this immediate order is for.
    /// </summary>
    [Required]
    [Column("order_date")]
    public DateTime OrderDate { get; set; }

    /// <summary>
    /// The delivery turn this order is for.
    /// </summary>
    [Required]
    [Column("delivery_turn_id")]
    public Guid DeliveryTurnId { get; set; }

    /// <summary>
    /// The outlet requesting this order.
    /// </summary>
    [Required]
    [Column("outlet_id")]
    public Guid OutletId { get; set; }

    /// <summary>
    /// The product being ordered.
    /// </summary>
    [Required]
    [Column("product_id")]
    public Guid ProductId { get; set; }

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
    /// Name or identifier of the person requesting this order.
    /// </summary>
    [Required]
    [MaxLength(200)]
    [Column("requested_by")]
    public string RequestedBy { get; set; } = string.Empty;

    /// <summary>
    /// Reason for this immediate order.
    /// </summary>
    [Required]
    [Column("reason")]
    public string Reason { get; set; } = string.Empty;

    /// <summary>
    /// Current status of the immediate order.
    /// </summary>
    [Required]
    [MaxLength(20)]
    [Column("status")]
    public string Status { get; set; } = "Pending";

    /// <summary>
    /// User ID who approved this order (if approved).
    /// </summary>
    [Column("approved_by")]
    public Guid? ApprovedBy { get; set; }

    /// <summary>
    /// Timestamp when the order was approved.
    /// </summary>
    [Column("approved_at")]
    public DateTime? ApprovedAt { get; set; }

    /// <summary>
    /// Rejection reason (if rejected).
    /// </summary>
    [Column("rejection_reason")]
    public string? RejectionReason { get; set; }

    // Navigation properties
    public DeliveryTurn? DeliveryTurn { get; set; }
    public Outlet? Outlet { get; set; }
    public Product? Product { get; set; }
    public User? ApprovedByUser { get; set; }
}
