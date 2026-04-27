namespace DMS_Backend.Models.DTOs.RoundingRules;

public class RoundingRuleListDto
{
    public Guid Id { get; set; }
    public string Code { get; set; } = string.Empty;
    public string Name { get; set; } = string.Empty;
    public string? Description { get; set; }
    public string AppliesTo { get; set; } = string.Empty;
    public string RoundingMethod { get; set; } = "Nearest";
    public int DecimalPlaces { get; set; } = 2;
    public int SortOrder { get; set; }
    public bool IsDefault { get; set; }
    public bool IsActive { get; set; }
}
