using DMS_Backend.Common;
using DMS_Backend.Models.DTOs.LabelTemplates;
using DMS_Backend.Services.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.Security.Claims;

namespace DMS_Backend.Controllers;

[Authorize]
[ApiController]
[Route("api/[controller]")]
public class LabelTemplatesController : ControllerBase
{
    private readonly ILabelTemplateService _labelTemplateService;

    public LabelTemplatesController(ILabelTemplateService labelTemplateService)
    {
        _labelTemplateService = labelTemplateService;
    }

    [HttpGet]
    [HasPermission("label-templates:view")]
    public async Task<ActionResult<ApiResponse<object>>> GetAll(
        [FromQuery] int page = 1,
        [FromQuery] int pageSize = 50,
        [FromQuery] string? search = null,
        [FromQuery] bool? activeOnly = null,
        CancellationToken cancellationToken = default)
    {
        var (labelTemplates, totalCount) = await _labelTemplateService.GetAllAsync(page, pageSize, search, activeOnly, cancellationToken);

        return Ok(ApiResponse<object>.SuccessResponse(new
        {
            LabelTemplates = labelTemplates,
            TotalCount = totalCount,
            Page = page,
            PageSize = pageSize,
            TotalPages = (int)Math.Ceiling(totalCount / (double)pageSize)
        }));
    }

    [HttpGet("{id:guid}")]
    [HasPermission("label-templates:view")]
    public async Task<ActionResult<ApiResponse<LabelTemplateDetailDto>>> GetById(
        Guid id,
        CancellationToken cancellationToken = default)
    {
        var labelTemplate = await _labelTemplateService.GetByIdAsync(id, cancellationToken);
        if (labelTemplate == null)
        {
            return NotFound(ApiResponse<LabelTemplateDetailDto>.FailureResponse(Error.NotFound("LabelTemplate", id.ToString())));
        }

        return Ok(ApiResponse<LabelTemplateDetailDto>.SuccessResponse(labelTemplate));
    }

    [HttpPost]
    [HasPermission("label-templates:create")]
    [Audit]
    public async Task<ActionResult<ApiResponse<LabelTemplateDetailDto>>> Create(
        [FromBody] LabelTemplateCreateDto dto,
        CancellationToken cancellationToken = default)
    {
        try
        {
            var userId = Guid.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier)!);
            var labelTemplate = await _labelTemplateService.CreateAsync(dto, userId, cancellationToken);

            return CreatedAtAction(
                nameof(GetById),
                new { id = labelTemplate.Id },
                ApiResponse<LabelTemplateDetailDto>.SuccessResponse(labelTemplate));
        }
        catch (InvalidOperationException ex)
        {
            return Conflict(ApiResponse<LabelTemplateDetailDto>.FailureResponse(Error.Conflict(ex.Message)));
        }
    }

    [HttpPut("{id:guid}")]
    [HasPermission("label-templates:edit")]
    [Audit]
    public async Task<ActionResult<ApiResponse<LabelTemplateDetailDto>>> Update(
        Guid id,
        [FromBody] LabelTemplateUpdateDto dto,
        CancellationToken cancellationToken = default)
    {
        try
        {
            var userId = Guid.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier)!);
            var labelTemplate = await _labelTemplateService.UpdateAsync(id, dto, userId, cancellationToken);

            return Ok(ApiResponse<LabelTemplateDetailDto>.SuccessResponse(labelTemplate));
        }
        catch (InvalidOperationException ex)
        {
            if (ex.Message.Contains("not found"))
            {
                return NotFound(ApiResponse<LabelTemplateDetailDto>.FailureResponse(Error.NotFound("LabelTemplate", id.ToString())));
            }
            return Conflict(ApiResponse<LabelTemplateDetailDto>.FailureResponse(Error.Conflict(ex.Message)));
        }
    }

    [HttpDelete("{id:guid}")]
    [HasPermission("label-templates:delete")]
    [Audit]
    public async Task<ActionResult<ApiResponse<object>>> Delete(
        Guid id,
        CancellationToken cancellationToken = default)
    {
        try
        {
            var userId = Guid.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier)!);
            await _labelTemplateService.DeleteAsync(id, userId, cancellationToken);

            return Ok(ApiResponse<object>.SuccessResponse(new { Message = "Label template deleted successfully" }));
        }
        catch (InvalidOperationException ex)
        {
            if (ex.Message.Contains("not found"))
            {
                return NotFound(ApiResponse<object>.FailureResponse(Error.NotFound("LabelTemplate", id.ToString())));
            }
            return Conflict(ApiResponse<object>.FailureResponse(Error.Conflict(ex.Message)));
        }
    }
}
