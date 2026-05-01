using DMS_Backend.Models.DTOs.OperationApprovals;

namespace DMS_Backend.Services.Interfaces;

public interface IOperationApprovalService
{
    Task<OperationApprovalsSummaryDto> GetPendingApprovalsAsync(Guid requestingUserId, CancellationToken cancellationToken = default);
}
