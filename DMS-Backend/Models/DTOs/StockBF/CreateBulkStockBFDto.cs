namespace DMS_Backend.Models.DTOs.StockBF;

public sealed class CreateBulkStockBFDto
{
    public required DateTime BFDate { get; set; }
    public required Guid OutletId { get; set; }
    public required List<StockBFItemDto> Items { get; set; }
}

public sealed class StockBFItemDto
{
    public required Guid ProductId { get; set; }
    public required decimal Quantity { get; set; }
}
