using DMS_Backend.Common;
using DMS_Backend.Services.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.Security.Claims;

namespace DMS_Backend.Controllers;

[Authorize]
[ApiController]
[Route("api/day-lock")]
public class DayLockController : ControllerBase
{
    private readonly IDayLockService _dayLockService;

    public DayLockController(IDayLockService dayLockService)
    {
        _dayLockService = dayLockService;
    }

    [HttpPost("lock")]
    [HasPermission("admin:day-lock")]
    [Audit]
    public async Task<ActionResult<ApiResponse<object>>> LockDay(
        [FromQuery] DateTime date,
        CancellationToken cancellationToken = default)
    {
        try
        {
            var userId = Guid.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier)!);
            var dayLock = await _dayLockService.LockDayAsync(date, userId, cancellationToken);

            return Ok(ApiResponse<object>.SuccessResponse(new
            {
                Message = $"Day locked successfully for {date:yyyy-MM-dd}",
                Date = dayLock.LockDate,
                LockedBy = userId,
                LockedAt = dayLock.CreatedAt
            }));
        }
        catch (InvalidOperationException ex)
        {
            return BadRequest(ApiResponse<object>.FailureResponse(
                Error.Validation(ex.Message)));
        }
    }

    [HttpGet("status")]
    [HasPermission("admin:view")]
    public async Task<ActionResult<ApiResponse<object>>> GetStatus(
        CancellationToken cancellationToken = default)
    {
        var lastLockedDate = await _dayLockService.GetLastLockedDateAsync(cancellationToken);

        return Ok(ApiResponse<object>.SuccessResponse(new
        {
            LastLockedDate = lastLockedDate,
            IsLocked = lastLockedDate.HasValue,
            Message = lastLockedDate.HasValue
                ? $"Last day lock: {lastLockedDate:yyyy-MM-dd}"
                : "No days are currently locked"
        }));
    }

    [HttpGet("check")]
    public async Task<ActionResult<ApiResponse<object>>> CheckDate(
        [FromQuery] DateTime date,
        CancellationToken cancellationToken = default)
    {
        var isLocked = await _dayLockService.IsDayLockedAsync(date, cancellationToken);

        return Ok(ApiResponse<object>.SuccessResponse(new
        {
            Date = date,
            IsLocked = isLocked,
            Message = isLocked
                ? $"Date {date:yyyy-MM-dd} is locked"
                : $"Date {date:yyyy-MM-dd} is not locked"
        }));
    }
}
