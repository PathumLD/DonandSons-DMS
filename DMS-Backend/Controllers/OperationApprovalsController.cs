using DMS_Backend.Common;
using DMS_Backend.Models.DTOs.OperationApprovals;
using DMS_Backend.Services.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.Security.Claims;

namespace DMS_Backend.Controllers;

[Authorize]
[ApiController]
[Route("api/operation-approvals")]
public class OperationApprovalsController : ControllerBase
{
    private readonly IOperationApprovalService _operationApprovalService;

    public OperationApprovalsController(IOperationApprovalService operationApprovalService)
    {
        _operationApprovalService = operationApprovalService;
    }

    [HttpGet("pending")]
    [HasPermission("operation:approvals:view")]
    public async Task<ActionResult<ApiResponse<OperationApprovalsSummaryDto>>> GetPendingApprovals(
        CancellationToken cancellationToken = default)
    {
        var userId = Guid.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier)!);
        var summary = await _operationApprovalService.GetPendingApprovalsAsync(userId, cancellationToken);
        return Ok(ApiResponse<OperationApprovalsSummaryDto>.SuccessResponse(summary));
    }
}
