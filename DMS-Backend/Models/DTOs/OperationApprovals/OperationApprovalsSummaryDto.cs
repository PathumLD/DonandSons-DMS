namespace DMS_Backend.Models.DTOs.OperationApprovals;

public sealed class OperationApprovalsSummaryDto
{
    public List<OperationApprovalItemDto> Deliveries { get; set; } = new();
    public List<OperationApprovalItemDto> Transfers { get; set; } = new();
    public List<OperationApprovalItemDto> Disposals { get; set; } = new();
    public List<OperationApprovalItemDto> Cancellations { get; set; } = new();
    public List<OperationApprovalItemDto> LabelPrintRequests { get; set; } = new();
    public List<OperationApprovalItemDto> StockBFs { get; set; } = new();
    public List<OperationApprovalItemDto> DeliveryReturns { get; set; } = new();
    
    public int TotalPendingCount => 
        Deliveries.Count + 
        Transfers.Count + 
        Disposals.Count + 
        Cancellations.Count + 
        LabelPrintRequests.Count + 
        StockBFs.Count + 
        DeliveryReturns.Count;
}
