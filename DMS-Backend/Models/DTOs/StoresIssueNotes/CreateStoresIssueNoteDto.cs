namespace DMS_Backend.Models.DTOs.StoresIssueNotes;

public class CreateStoresIssueNoteDto
{
    public Guid ProductionPlanId { get; set; }
    public Guid ProductionSectionId { get; set; }
    public DateTime IssueDate { get; set; }
    public List<CreateStoresIssueNoteItemDto> Items { get; set; } = new();
}

public class CreateStoresIssueNoteItemDto
{
    public Guid IngredientId { get; set; }
    public decimal ProductionQty { get; set; }
    public decimal ExtraQty { get; set; }
    public decimal TotalQty { get; set; }
    public string? Notes { get; set; }
}
