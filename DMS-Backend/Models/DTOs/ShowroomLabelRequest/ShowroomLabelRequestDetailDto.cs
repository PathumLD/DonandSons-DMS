namespace DMS_Backend.Models.DTOs.ShowroomLabelRequest;

public sealed class ShowroomLabelRequestDetailDto
{
    public Guid Id { get; set; }
    public Guid OutletId { get; set; }
    public string OutletCode { get; set; } = string.Empty;
    public string OutletName { get; set; } = string.Empty;
    public string Text1 { get; set; } = string.Empty;
    public string? Text2 { get; set; }
    public int LabelCount { get; set; }
    public DateTime RequestDate { get; set; }
    public bool IsActive { get; set; }
    public DateTime CreatedAt { get; set; }
    public DateTime UpdatedAt { get; set; }
    public Guid? CreatedById { get; set; }
    public Guid? UpdatedById { get; set; }
}
