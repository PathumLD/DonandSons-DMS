using AutoMapper;
using DMS_Backend.Data;
using DMS_Backend.Models.DTOs.RecipeTemplates;
using DMS_Backend.Models.Entities;
using DMS_Backend.Services.Interfaces;
using Microsoft.EntityFrameworkCore;

namespace DMS_Backend.Services.Implementations;

public class RecipeTemplateService : IRecipeTemplateService
{
    private readonly ApplicationDbContext _context;
    private readonly IMapper _mapper;
    private readonly ISystemLogService _systemLogService;

    public RecipeTemplateService(
        ApplicationDbContext context,
        IMapper mapper,
        ISystemLogService systemLogService)
    {
        _context = context;
        _mapper = mapper;
        _systemLogService = systemLogService;
    }

    public async Task<(List<RecipeTemplateListDto> templates, int totalCount)> GetAllAsync(
        int page,
        int pageSize,
        string? searchTerm = null,
        bool? activeOnly = null,
        CancellationToken cancellationToken = default)
    {
        var query = _context.RecipeTemplates
            .Include(rt => rt.Category)
            .AsQueryable();

        if (activeOnly == true)
        {
            query = query.Where(rt => rt.IsActive);
        }

        if (!string.IsNullOrWhiteSpace(searchTerm))
        {
            query = query.Where(rt =>
                rt.Code.Contains(searchTerm) ||
                rt.Name.Contains(searchTerm) ||
                (rt.Description != null && rt.Description.Contains(searchTerm)));
        }

        var totalCount = await query.CountAsync(cancellationToken);

        var templates = await query
            .OrderBy(rt => rt.SortOrder)
            .ThenBy(rt => rt.Code)
            .Skip((page - 1) * pageSize)
            .Take(pageSize)
            .ToListAsync(cancellationToken);

        var templateDtos = _mapper.Map<List<RecipeTemplateListDto>>(templates);

        return (templateDtos, totalCount);
    }

    public async Task<RecipeTemplateDetailDto?> GetByIdAsync(Guid id, CancellationToken cancellationToken = default)
    {
        var template = await _context.RecipeTemplates
            .Include(rt => rt.Category)
            .FirstOrDefaultAsync(rt => rt.Id == id, cancellationToken);

        if (template == null)
        {
            return null;
        }

        return _mapper.Map<RecipeTemplateDetailDto>(template);
    }

    public async Task<RecipeTemplateDetailDto> CreateAsync(
        RecipeTemplateCreateDto dto,
        Guid userId,
        CancellationToken cancellationToken = default)
    {
        if (await CodeExistsAsync(dto.Code, null, cancellationToken))
        {
            throw new InvalidOperationException($"Recipe template with code '{dto.Code}' already exists.");
        }

        var template = _mapper.Map<RecipeTemplate>(dto);
        template.Id = Guid.NewGuid();
        template.CreatedById = userId;
        template.UpdatedById = userId;
        template.CreatedAt = DateTime.UtcNow;
        template.UpdatedAt = DateTime.UtcNow;

        _context.RecipeTemplates.Add(template);
        await _context.SaveChangesAsync(cancellationToken);

        await _systemLogService.LogInfoAsync("RecipeTemplateService", $"Recipe template created: {template.Code} by user {userId}");

        return _mapper.Map<RecipeTemplateDetailDto>(template);
    }

    public async Task<RecipeTemplateDetailDto> UpdateAsync(
        Guid id,
        RecipeTemplateUpdateDto dto,
        Guid userId,
        CancellationToken cancellationToken = default)
    {
        var template = await _context.RecipeTemplates
            .FirstOrDefaultAsync(rt => rt.Id == id, cancellationToken);

        if (template == null)
        {
            throw new InvalidOperationException($"Recipe template with ID {id} not found.");
        }

        if (await CodeExistsAsync(dto.Code, id, cancellationToken))
        {
            throw new InvalidOperationException($"Recipe template with code '{dto.Code}' already exists.");
        }

        _mapper.Map(dto, template);
        template.UpdatedById = userId;
        template.UpdatedAt = DateTime.UtcNow;

        await _context.SaveChangesAsync(cancellationToken);

        await _systemLogService.LogInfoAsync("RecipeTemplateService", $"Recipe template updated: {template.Code} by user {userId}");

        return _mapper.Map<RecipeTemplateDetailDto>(template);
    }

    public async Task DeleteAsync(Guid id, Guid userId, CancellationToken cancellationToken = default)
    {
        var template = await _context.RecipeTemplates
            .FirstOrDefaultAsync(rt => rt.Id == id, cancellationToken);

        if (template == null)
        {
            throw new InvalidOperationException($"Recipe template with ID {id} not found.");
        }

        template.IsActive = false;
        template.UpdatedById = userId;
        template.UpdatedAt = DateTime.UtcNow;

        await _context.SaveChangesAsync(cancellationToken);

        await _systemLogService.LogInfoAsync("RecipeTemplateService", $"Recipe template soft-deleted: {template.Code} by user {userId}");
    }

    public async Task<bool> CodeExistsAsync(string code, Guid? excludeId = null, CancellationToken cancellationToken = default)
    {
        var query = _context.RecipeTemplates.Where(rt => rt.Code == code);

        if (excludeId.HasValue)
        {
            query = query.Where(rt => rt.Id != excludeId.Value);
        }

        return await query.AnyAsync(cancellationToken);
    }
}
