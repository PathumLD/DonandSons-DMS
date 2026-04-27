namespace DMS_Backend.Models.DTOs.DayTypes;

public sealed class CreateDayTypeDto
{
    public required string Code { get; set; }
    public required string Name { get; set; }
    public string? Description { get; set; }
    public decimal Multiplier { get; set; } = 1.00m;
    public string? Color { get; set; }
    public bool IsActive { get; set; } = true;
}
