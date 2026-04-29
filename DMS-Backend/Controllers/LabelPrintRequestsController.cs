using DMS_Backend.Common;
using DMS_Backend.Models.DTOs.LabelPrintRequests;
using DMS_Backend.Services.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.Security.Claims;

namespace DMS_Backend.Controllers;

[Authorize]
[ApiController]
[Route("api/label-print-requests")]
public class LabelPrintRequestsController : ControllerBase
{
    private readonly ILabelPrintRequestService _labelPrintRequestService;

    public LabelPrintRequestsController(ILabelPrintRequestService labelPrintRequestService)
    {
        _labelPrintRequestService = labelPrintRequestService;
    }

    [HttpGet]
    [HasPermission("operation:label-printing:view")]
    public async Task<ActionResult<ApiResponse<object>>> GetAll(
        [FromQuery] int page = 1,
        [FromQuery] int pageSize = 50,
        [FromQuery] DateTime? fromDate = null,
        [FromQuery] DateTime? toDate = null,
        [FromQuery] Guid? productId = null,
        [FromQuery] string? status = null,
        CancellationToken cancellationToken = default)
    {
        var (labelPrintRequests, totalCount) = await _labelPrintRequestService.GetAllAsync(
            page, pageSize, fromDate, toDate, productId, status, cancellationToken);

        return Ok(ApiResponse<object>.SuccessResponse(new
        {
            LabelPrintRequests = labelPrintRequests,
            TotalCount = totalCount,
            Page = page,
            PageSize = pageSize,
            TotalPages = (int)Math.Ceiling(totalCount / (double)pageSize)
        }));
    }

    [HttpGet("{id:guid}")]
    [HasPermission("operation:label-printing:view")]
    public async Task<ActionResult<ApiResponse<LabelPrintRequestDetailDto>>> GetById(
        Guid id,
        CancellationToken cancellationToken = default)
    {
        var labelPrintRequest = await _labelPrintRequestService.GetByIdAsync(id, cancellationToken);
        if (labelPrintRequest == null)
        {
            return NotFound(ApiResponse<LabelPrintRequestDetailDto>.FailureResponse(
                Error.NotFound("LabelPrintRequest", id.ToString())));
        }

        return Ok(ApiResponse<LabelPrintRequestDetailDto>.SuccessResponse(labelPrintRequest));
    }

    [HttpPost]
    [HasPermission("operation:label-printing:create")]
    [Audit]
    [DayLockGuard]
    public async Task<ActionResult<ApiResponse<LabelPrintRequestDetailDto>>> Create(
        [FromBody] CreateLabelPrintRequestDto dto,
        CancellationToken cancellationToken = default)
    {
        try
        {
            var userId = Guid.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier)!);
            var labelPrintRequest = await _labelPrintRequestService.CreateAsync(dto, userId, cancellationToken);

            return CreatedAtAction(
                nameof(GetById),
                new { id = labelPrintRequest.Id },
                ApiResponse<LabelPrintRequestDetailDto>.SuccessResponse(labelPrintRequest));
        }
        catch (InvalidOperationException ex)
        {
            return Conflict(ApiResponse<LabelPrintRequestDetailDto>.FailureResponse(
                Error.Conflict(ex.Message)));
        }
    }

    [HttpPut("{id:guid}")]
    [HasPermission("operation:label-printing:update")]
    [Audit]
    [DayLockGuard]
    public async Task<ActionResult<ApiResponse<LabelPrintRequestDetailDto>>> Update(
        Guid id,
        [FromBody] UpdateLabelPrintRequestDto dto,
        CancellationToken cancellationToken = default)
    {
        try
        {
            var userId = Guid.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier)!);
            var labelPrintRequest = await _labelPrintRequestService.UpdateAsync(id, dto, userId, cancellationToken);

            if (labelPrintRequest == null)
            {
                return NotFound(ApiResponse<LabelPrintRequestDetailDto>.FailureResponse(
                    Error.NotFound("LabelPrintRequest", id.ToString())));
            }

            return Ok(ApiResponse<LabelPrintRequestDetailDto>.SuccessResponse(labelPrintRequest));
        }
        catch (InvalidOperationException ex)
        {
            return BadRequest(ApiResponse<LabelPrintRequestDetailDto>.FailureResponse(
                Error.Validation(ex.Message)));
        }
    }

    [HttpDelete("{id:guid}")]
    [HasPermission("operation:label-printing:delete")]
    [Audit]
    [DayLockGuard]
    public async Task<ActionResult<ApiResponse<object>>> Delete(
        Guid id,
        CancellationToken cancellationToken = default)
    {
        try
        {
            var deleted = await _labelPrintRequestService.DeleteAsync(id, cancellationToken);
            if (!deleted)
            {
                return NotFound(ApiResponse<object>.FailureResponse(
                    Error.NotFound("LabelPrintRequest", id.ToString())));
            }

            return Ok(ApiResponse<object>.SuccessResponse(new { Message = "Label print request deleted successfully" }));
        }
        catch (InvalidOperationException ex)
        {
            return BadRequest(ApiResponse<object>.FailureResponse(
                Error.Validation(ex.Message)));
        }
    }

    [HttpPost("{id:guid}/approve")]
    [HasPermission("operation:label-printing:approve")]
    [Audit]
    [DayLockGuard]
    public async Task<ActionResult<ApiResponse<LabelPrintRequestDetailDto>>> Approve(
        Guid id,
        CancellationToken cancellationToken = default)
    {
        try
        {
            var userId = Guid.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier)!);
            var labelPrintRequest = await _labelPrintRequestService.ApproveAsync(id, userId, cancellationToken);

            if (labelPrintRequest == null)
            {
                return NotFound(ApiResponse<LabelPrintRequestDetailDto>.FailureResponse(
                    Error.NotFound("LabelPrintRequest", id.ToString())));
            }

            return Ok(ApiResponse<LabelPrintRequestDetailDto>.SuccessResponse(labelPrintRequest));
        }
        catch (InvalidOperationException ex)
        {
            return BadRequest(ApiResponse<LabelPrintRequestDetailDto>.FailureResponse(
                Error.Validation(ex.Message)));
        }
    }

    [HttpPost("{id:guid}/reject")]
    [HasPermission("operation:label-printing:approve")]
    [Audit]
    [DayLockGuard]
    public async Task<ActionResult<ApiResponse<LabelPrintRequestDetailDto>>> Reject(
        Guid id,
        CancellationToken cancellationToken = default)
    {
        try
        {
            var userId = Guid.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier)!);
            var labelPrintRequest = await _labelPrintRequestService.RejectAsync(id, userId, cancellationToken);

            if (labelPrintRequest == null)
            {
                return NotFound(ApiResponse<LabelPrintRequestDetailDto>.FailureResponse(
                    Error.NotFound("LabelPrintRequest", id.ToString())));
            }

            return Ok(ApiResponse<LabelPrintRequestDetailDto>.SuccessResponse(labelPrintRequest));
        }
        catch (InvalidOperationException ex)
        {
            return BadRequest(ApiResponse<LabelPrintRequestDetailDto>.FailureResponse(
                Error.Validation(ex.Message)));
        }
    }
}
