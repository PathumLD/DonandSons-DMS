namespace DMS_Backend.Models.DTOs.StoresIssueNotes;

public class ComputeStoresIssueNoteResponseDto
{
    public Guid ProductionPlanId { get; set; }
    public Guid ProductionSectionId { get; set; }
    public string ProductionSectionName { get; set; } = string.Empty;
    public List<ComputedIngredientDto> Ingredients { get; set; } = new();
}

public class ComputedIngredientDto
{
    public Guid IngredientId { get; set; }
    public string IngredientCode { get; set; } = string.Empty;
    public string IngredientName { get; set; } = string.Empty;
    public string Unit { get; set; } = string.Empty;
    public decimal ProductionQty { get; set; }
    public decimal ExtraPercentage { get; set; }
    public decimal ExtraQty { get; set; }
    public decimal TotalQty { get; set; }
    public List<string> UsedInProducts { get; set; } = new();
}
