using System.ComponentModel.DataAnnotations;

namespace DMS_Backend.Models.Entities;

public class StoresIssueNoteItem
{
    [Key]
    public Guid Id { get; set; }

    [Required]
    public Guid StoresIssueNoteId { get; set; }

    [Required]
    public Guid IngredientId { get; set; }

    public decimal ProductionQty { get; set; }

    public decimal ExtraQty { get; set; }

    public decimal TotalQty { get; set; }

    [StringLength(500)]
    public string? Notes { get; set; }

    [Required]
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

    public DateTime? UpdatedAt { get; set; }

    public virtual StoresIssueNote? StoresIssueNote { get; set; }
    public virtual Ingredient? Ingredient { get; set; }
}
