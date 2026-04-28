namespace DMS_Backend.Models.DTOs.LabelPrintRequests;

public sealed class LabelPrintRequestListDto
{
    public Guid Id { get; set; }
    public string DisplayNo { get; set; } = string.Empty;
    public DateTime Date { get; set; }
    public Guid ProductId { get; set; }
    public string ProductName { get; set; } = string.Empty;
    public int LabelCount { get; set; }
    public DateTime StartDate { get; set; }
    public int ExpiryDays { get; set; }
    public string Status { get; set; } = string.Empty;
    public DateTime UpdatedAt { get; set; }
}
