using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace DMS_Backend.Models.Entities;

/// <summary>
/// Tracks production cancellations with approval workflow.
/// </summary>
[Table("production_cancels")]
public class ProductionCancel : BaseEntity
{
    /// <summary>
    /// Unique cancellation number (auto-generated: PCC#######).
    /// </summary>
    [Required]
    [MaxLength(50)]
    [Column("cancel_no")]
    public string CancelNo { get; set; } = string.Empty;

    /// <summary>
    /// Date of cancellation.
    /// </summary>
    [Required]
    [Column("cancel_date")]
    public DateTime CancelDate { get; set; }

    /// <summary>
    /// Reference to original production number.
    /// </summary>
    [Required]
    [MaxLength(50)]
    [Column("production_no")]
    public string ProductionNo { get; set; } = string.Empty;

    /// <summary>
    /// Product being cancelled.
    /// </summary>
    [Required]
    [Column("product_id")]
    public Guid ProductId { get; set; }

    /// <summary>
    /// Quantity being cancelled.
    /// </summary>
    [Required]
    [Column("cancelled_qty", TypeName = "decimal(18,4)")]
    public decimal CancelledQty { get; set; }

    /// <summary>
    /// Reason for cancellation.
    /// </summary>
    [Required]
    [MaxLength(500)]
    [Column("reason")]
    public string Reason { get; set; } = string.Empty;

    /// <summary>
    /// Current status of cancellation.
    /// </summary>
    [Required]
    [Column("status")]
    public ProductionCancelStatus Status { get; set; } = ProductionCancelStatus.Pending;

    /// <summary>
    /// User who approved this cancellation.
    /// </summary>
    [Column("approved_by_id")]
    public Guid? ApprovedById { get; set; }

    /// <summary>
    /// Date and time when cancellation was approved.
    /// </summary>
    [Column("approved_date")]
    public DateTime? ApprovedDate { get; set; }

    // Navigation properties
    public Product Product { get; set; } = null!;
    public User? ApprovedBy { get; set; }
}

/// <summary>
/// Status values for production cancellation documents.
/// </summary>
public enum ProductionCancelStatus
{
    Pending,
    Approved,
    Rejected
}
