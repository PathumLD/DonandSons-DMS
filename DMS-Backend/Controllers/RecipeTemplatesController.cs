using DMS_Backend.Common;
using DMS_Backend.Models.DTOs.RecipeTemplates;
using DMS_Backend.Services.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.Security.Claims;

namespace DMS_Backend.Controllers;

[Authorize]
[ApiController]
[Route("api/[controller]")]
public class RecipeTemplatesController : ControllerBase
{
    private readonly IRecipeTemplateService _recipeTemplateService;

    public RecipeTemplatesController(IRecipeTemplateService recipeTemplateService)
    {
        _recipeTemplateService = recipeTemplateService;
    }

    [HttpGet]
    [HasPermission("recipes:view")]
    public async Task<ActionResult<ApiResponse<object>>> GetAll(
        [FromQuery] int page = 1,
        [FromQuery] int pageSize = 50,
        [FromQuery] string? search = null,
        [FromQuery] bool? activeOnly = null,
        CancellationToken cancellationToken = default)
    {
        var (templates, totalCount) = await _recipeTemplateService.GetAllAsync(page, pageSize, search, activeOnly, cancellationToken);

        return Ok(ApiResponse<object>.SuccessResponse(new
        {
            RecipeTemplates = templates,
            TotalCount = totalCount,
            Page = page,
            PageSize = pageSize,
            TotalPages = (int)Math.Ceiling(totalCount / (double)pageSize)
        }));
    }

    [HttpGet("{id:guid}")]
    [HasPermission("recipes:view")]
    public async Task<ActionResult<ApiResponse<RecipeTemplateDetailDto>>> GetById(
        Guid id,
        CancellationToken cancellationToken = default)
    {
        var template = await _recipeTemplateService.GetByIdAsync(id, cancellationToken);
        if (template == null)
        {
            return NotFound(ApiResponse<RecipeTemplateDetailDto>.FailureResponse(Error.NotFound("RecipeTemplate", id.ToString())));
        }

        return Ok(ApiResponse<RecipeTemplateDetailDto>.SuccessResponse(template));
    }

    [HttpPost]
    [HasPermission("recipes:create")]
    [Audit]
    public async Task<ActionResult<ApiResponse<RecipeTemplateDetailDto>>> Create(
        [FromBody] RecipeTemplateCreateDto dto,
        CancellationToken cancellationToken = default)
    {
        try
        {
            var userId = Guid.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier)!);
            var template = await _recipeTemplateService.CreateAsync(dto, userId, cancellationToken);

            return CreatedAtAction(
                nameof(GetById),
                new { id = template.Id },
                ApiResponse<RecipeTemplateDetailDto>.SuccessResponse(template));
        }
        catch (InvalidOperationException ex)
        {
            return Conflict(ApiResponse<RecipeTemplateDetailDto>.FailureResponse(Error.Conflict(ex.Message)));
        }
    }

    [HttpPut("{id:guid}")]
    [HasPermission("recipes:edit")]
    [Audit]
    public async Task<ActionResult<ApiResponse<RecipeTemplateDetailDto>>> Update(
        Guid id,
        [FromBody] RecipeTemplateUpdateDto dto,
        CancellationToken cancellationToken = default)
    {
        try
        {
            var userId = Guid.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier)!);
            var template = await _recipeTemplateService.UpdateAsync(id, dto, userId, cancellationToken);

            return Ok(ApiResponse<RecipeTemplateDetailDto>.SuccessResponse(template));
        }
        catch (InvalidOperationException ex)
        {
            if (ex.Message.Contains("not found"))
            {
                return NotFound(ApiResponse<RecipeTemplateDetailDto>.FailureResponse(Error.NotFound("RecipeTemplate", id.ToString())));
            }
            return Conflict(ApiResponse<RecipeTemplateDetailDto>.FailureResponse(Error.Conflict(ex.Message)));
        }
    }

    [HttpDelete("{id:guid}")]
    [HasPermission("recipes:delete")]
    [Audit]
    public async Task<ActionResult<ApiResponse<object>>> Delete(
        Guid id,
        CancellationToken cancellationToken = default)
    {
        try
        {
            var userId = Guid.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier)!);
            await _recipeTemplateService.DeleteAsync(id, userId, cancellationToken);

            return Ok(ApiResponse<object>.SuccessResponse(new { Message = "Recipe template deleted successfully" }));
        }
        catch (InvalidOperationException ex)
        {
            return NotFound(ApiResponse<object>.FailureResponse(Error.NotFound("RecipeTemplate", id.ToString())));
        }
    }
}
