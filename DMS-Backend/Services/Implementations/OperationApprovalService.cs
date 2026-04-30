using DMS_Backend.Models.DTOs.OperationApprovals;
using DMS_Backend.Services.Interfaces;

namespace DMS_Backend.Services.Implementations;

public class OperationApprovalService : IOperationApprovalService
{
    private readonly IDeliveryService _deliveryService;
    private readonly ITransferService _transferService;
    private readonly IDisposalService _disposalService;
    private readonly ICancellationService _cancellationService;
    private readonly ILabelPrintRequestService _labelPrintRequestService;
    private readonly IStockBFService _stockBFService;
    private readonly IDeliveryReturnService _deliveryReturnService;

    public OperationApprovalService(
        IDeliveryService deliveryService,
        ITransferService transferService,
        IDisposalService disposalService,
        ICancellationService cancellationService,
        ILabelPrintRequestService labelPrintRequestService,
        IStockBFService stockBFService,
        IDeliveryReturnService deliveryReturnService)
    {
        _deliveryService = deliveryService;
        _transferService = transferService;
        _disposalService = disposalService;
        _cancellationService = cancellationService;
        _labelPrintRequestService = labelPrintRequestService;
        _stockBFService = stockBFService;
        _deliveryReturnService = deliveryReturnService;
    }

    public async Task<OperationApprovalsSummaryDto> GetPendingApprovalsAsync(Guid requestingUserId, CancellationToken cancellationToken = default)
    {
        var summary = new OperationApprovalsSummaryDto();

        // Execute sequentially to avoid DbContext threading issues
        // Each service call uses the same DbContext instance, which doesn't support concurrent operations
        var (deliveries, _) = await _deliveryService.GetAllAsync(1, int.MaxValue, null, null, null, "Pending", cancellationToken);
        var (transfers, _) = await _transferService.GetAllAsync(1, int.MaxValue, null, null, null, null, "Pending", cancellationToken);
        var (disposals, _) = await _disposalService.GetAllAsync(1, int.MaxValue, null, null, null, "Pending", cancellationToken);
        var (cancellations, _) = await _cancellationService.GetAllAsync(1, int.MaxValue, null, null, null, "Pending", cancellationToken);
        var (labelPrintRequests, _) = await _labelPrintRequestService.GetAllAsync(1, int.MaxValue, null, null, null, "Pending", cancellationToken);
        var (deliveryReturns, _) = await _deliveryReturnService.GetAllAsync(1, int.MaxValue, null, null, null, "Pending", cancellationToken);
        var (stockBFs, _) = await _stockBFService.GetAllAsync(1, int.MaxValue, null, null, null, null, "Pending", requestingUserId, true, false, cancellationToken);

        summary.Deliveries = deliveries.Select(d => new OperationApprovalItemDto
        {
            Id = d.Id,
            ApprovalType = "Delivery",
            ReferenceNo = d.DeliveryNo,
            RequestDate = d.DeliveryDate,
            OutletName = d.OutletName,
            Status = d.Status,
            RequestedByName = d.CreatedByName,
            TotalValue = d.TotalValue,
            ItemCount = d.TotalItems
        }).ToList();

        summary.Transfers = transfers.Select(t => new OperationApprovalItemDto
        {
            Id = t.Id,
            ApprovalType = "Transfer",
            ReferenceNo = t.TransferNo,
            RequestDate = t.TransferDate,
            OutletName = $"{t.FromOutletName} → {t.ToOutletName}",
            Status = t.Status,
            RequestedByName = t.CreatedByName,
            ItemCount = t.TotalItems
        }).ToList();

        summary.Disposals = disposals.Select(d => new OperationApprovalItemDto
        {
            Id = d.Id,
            ApprovalType = "Disposal",
            ReferenceNo = d.DisposalNo,
            RequestDate = d.DisposalDate,
            OutletName = d.OutletName,
            Status = d.Status,
            RequestedByName = d.CreatedByName,
            ItemCount = d.TotalItems
        }).ToList();

        summary.Cancellations = cancellations.Select(c => new OperationApprovalItemDto
        {
            Id = c.Id,
            ApprovalType = "Cancellation",
            ReferenceNo = c.CancellationNo,
            RequestDate = c.CancellationDate,
            OutletName = c.OutletName,
            Status = c.Status,
            RequestedByName = c.UpdatedByName,
            Description = $"Delivery: {c.DeliveryNo}"
        }).ToList();

        summary.LabelPrintRequests = labelPrintRequests.Select(l => new OperationApprovalItemDto
        {
            Id = l.Id,
            ApprovalType = "Label Print",
            ReferenceNo = l.DisplayNo,
            RequestDate = l.Date,
            OutletName = l.ProductName,
            Status = l.Status,
            RequestedByName = l.UpdatedByName,
            ItemCount = l.LabelCount,
            Description = $"Product: {l.ProductCode}"
        }).ToList();

        summary.DeliveryReturns = deliveryReturns.Select(r => new OperationApprovalItemDto
        {
            Id = r.Id,
            ApprovalType = "Delivery Return",
            ReferenceNo = r.ReturnNo,
            RequestDate = r.ReturnDate,
            OutletName = r.OutletName,
            Status = r.Status,
            RequestedByName = r.UpdatedByName,
            ItemCount = r.TotalItems,
            Description = $"Delivery: {r.DeliveryNo}, Reason: {r.Reason}"
        }).ToList();

        summary.StockBFs = stockBFs.Select(s => new OperationApprovalItemDto
        {
            Id = s.Id,
            ApprovalType = "Stock BF",
            ReferenceNo = s.BFNo,
            RequestDate = s.BFDate,
            OutletName = s.OutletName,
            Status = s.Status,
            RequestedByName = s.UpdatedByName,
            Description = $"{s.ProductName} - Qty: {s.Quantity}"
        }).ToList();

        return summary;
    }
}
