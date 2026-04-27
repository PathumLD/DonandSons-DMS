using DMS_Backend.Models.DTOs.RecipeTemplates;

namespace DMS_Backend.Services.Interfaces;

public interface IRecipeTemplateService
{
    Task<(List<RecipeTemplateListDto> templates, int totalCount)> GetAllAsync(
        int page,
        int pageSize,
        string? searchTerm = null,
        bool? activeOnly = null,
        CancellationToken cancellationToken = default);

    Task<RecipeTemplateDetailDto?> GetByIdAsync(Guid id, CancellationToken cancellationToken = default);

    Task<RecipeTemplateDetailDto> CreateAsync(RecipeTemplateCreateDto dto, Guid userId, CancellationToken cancellationToken = default);

    Task<RecipeTemplateDetailDto> UpdateAsync(Guid id, RecipeTemplateUpdateDto dto, Guid userId, CancellationToken cancellationToken = default);

    Task DeleteAsync(Guid id, Guid userId, CancellationToken cancellationToken = default);

    Task<bool> CodeExistsAsync(string code, Guid? excludeId = null, CancellationToken cancellationToken = default);
}
