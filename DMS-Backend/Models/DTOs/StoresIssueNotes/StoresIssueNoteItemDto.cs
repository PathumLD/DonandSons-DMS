namespace DMS_Backend.Models.DTOs.StoresIssueNotes;

public class StoresIssueNoteItemDto
{
    public Guid Id { get; set; }
    public Guid StoresIssueNoteId { get; set; }
    public Guid IngredientId { get; set; }
    public string IngredientCode { get; set; } = string.Empty;
    public string IngredientName { get; set; } = string.Empty;
    public string Unit { get; set; } = string.Empty;
    public decimal ProductionQty { get; set; }
    public decimal ExtraQty { get; set; }
    public decimal TotalQty { get; set; }
    public string? Notes { get; set; }
}
