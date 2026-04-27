using DMS_Backend.Common;
using DMS_Backend.Models.DTOs.RoundingRules;
using DMS_Backend.Services.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.Security.Claims;

namespace DMS_Backend.Controllers;

[Authorize]
[ApiController]
[Route("api/[controller]")]
public class RoundingRulesController : ControllerBase
{
    private readonly IRoundingRuleService _roundingRuleService;

    public RoundingRulesController(IRoundingRuleService roundingRuleService)
    {
        _roundingRuleService = roundingRuleService;
    }

    [HttpGet]
    [HasPermission("system:view")]
    public async Task<ActionResult<ApiResponse<object>>> GetAll(
        [FromQuery] int page = 1,
        [FromQuery] int pageSize = 50,
        [FromQuery] string? search = null,
        [FromQuery] bool? activeOnly = null,
        CancellationToken cancellationToken = default)
    {
        var (roundingRules, totalCount) = await _roundingRuleService.GetAllAsync(page, pageSize, search, activeOnly, cancellationToken);

        return Ok(ApiResponse<object>.SuccessResponse(new
        {
            RoundingRules = roundingRules,
            TotalCount = totalCount,
            Page = page,
            PageSize = pageSize,
            TotalPages = (int)Math.Ceiling(totalCount / (double)pageSize)
        }));
    }

    [HttpGet("{id:guid}")]
    [HasPermission("system:view")]
    public async Task<ActionResult<ApiResponse<RoundingRuleDetailDto>>> GetById(
        Guid id,
        CancellationToken cancellationToken = default)
    {
        var roundingRule = await _roundingRuleService.GetByIdAsync(id, cancellationToken);
        if (roundingRule == null)
        {
            return NotFound(ApiResponse<RoundingRuleDetailDto>.FailureResponse(Error.NotFound("RoundingRule", id.ToString())));
        }

        return Ok(ApiResponse<RoundingRuleDetailDto>.SuccessResponse(roundingRule));
    }

    [HttpPost]
    [HasPermission("system:create")]
    [Audit]
    public async Task<ActionResult<ApiResponse<RoundingRuleDetailDto>>> Create(
        [FromBody] RoundingRuleCreateDto dto,
        CancellationToken cancellationToken = default)
    {
        try
        {
            var userId = Guid.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier)!);
            var roundingRule = await _roundingRuleService.CreateAsync(dto, userId, cancellationToken);

            return CreatedAtAction(
                nameof(GetById),
                new { id = roundingRule.Id },
                ApiResponse<RoundingRuleDetailDto>.SuccessResponse(roundingRule));
        }
        catch (InvalidOperationException ex)
        {
            return Conflict(ApiResponse<RoundingRuleDetailDto>.FailureResponse(Error.Conflict(ex.Message)));
        }
    }

    [HttpPut("{id:guid}")]
    [HasPermission("system:edit")]
    [Audit]
    public async Task<ActionResult<ApiResponse<RoundingRuleDetailDto>>> Update(
        Guid id,
        [FromBody] RoundingRuleUpdateDto dto,
        CancellationToken cancellationToken = default)
    {
        try
        {
            var userId = Guid.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier)!);
            var roundingRule = await _roundingRuleService.UpdateAsync(id, dto, userId, cancellationToken);

            return Ok(ApiResponse<RoundingRuleDetailDto>.SuccessResponse(roundingRule));
        }
        catch (InvalidOperationException ex)
        {
            if (ex.Message.Contains("not found"))
            {
                return NotFound(ApiResponse<RoundingRuleDetailDto>.FailureResponse(Error.NotFound("RoundingRule", id.ToString())));
            }
            return Conflict(ApiResponse<RoundingRuleDetailDto>.FailureResponse(Error.Conflict(ex.Message)));
        }
    }

    [HttpDelete("{id:guid}")]
    [HasPermission("system:delete")]
    [Audit]
    public async Task<ActionResult<ApiResponse<object>>> Delete(
        Guid id,
        CancellationToken cancellationToken = default)
    {
        try
        {
            var userId = Guid.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier)!);
            await _roundingRuleService.DeleteAsync(id, userId, cancellationToken);

            return Ok(ApiResponse<object>.SuccessResponse(new { Message = "Rounding rule deleted successfully" }));
        }
        catch (InvalidOperationException ex)
        {
            if (ex.Message.Contains("not found"))
            {
                return NotFound(ApiResponse<object>.FailureResponse(Error.NotFound("RoundingRule", id.ToString())));
            }
            return Conflict(ApiResponse<object>.FailureResponse(Error.Conflict(ex.Message)));
        }
    }
}
