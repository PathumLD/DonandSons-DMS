using Microsoft.EntityFrameworkCore;
using AutoMapper;
using DMS_Backend.Data;
using DMS_Backend.Models.Entities;
using DMS_Backend.Models.DTOs.StoresIssueNotes;
using DMS_Backend.Services.Interfaces;

namespace DMS_Backend.Services.Implementations;

public class StoresIssueNoteService : IStoresIssueNoteService
{
    private readonly ApplicationDbContext _context;
    private readonly IMapper _mapper;

    public StoresIssueNoteService(ApplicationDbContext context, IMapper mapper)
    {
        _context = context;
        _mapper = mapper;
    }

    public async Task<ComputeStoresIssueNoteResponseDto> ComputeStoresIssueNoteAsync(Guid productionPlanId, Guid productionSectionId, CancellationToken cancellationToken = default)
    {
        var productionPlan = await _context.ProductionPlans
            .FirstOrDefaultAsync(pp => pp.Id == productionPlanId, cancellationToken);

        if (productionPlan == null)
            throw new InvalidOperationException("Production plan not found");

        var section = await _context.ProductionSections
            .FirstOrDefaultAsync(ps => ps.Id == productionSectionId, cancellationToken);

        if (section == null)
            throw new InvalidOperationException("Production section not found");

        var planItems = await _context.ProductionPlanItems
            .Include(ppi => ppi.Product)
            .Where(ppi => ppi.ProductionPlanId == productionPlanId && 
                         ppi.ProductionSectionId == productionSectionId && 
                         !ppi.IsExcluded)
            .ToListAsync(cancellationToken);

        // Get product IDs
        var productIds = planItems.Select(pi => pi.ProductId).Distinct().ToList();

        // Query recipes separately
        var recipes = await _context.Recipes
            .Include(r => r.RecipeComponents)
                .ThenInclude(rc => rc.RecipeIngredients)
                    .ThenInclude(ri => ri.Ingredient)
                        .ThenInclude(i => i!.UnitOfMeasure)
            .Where(r => productIds.Contains(r.ProductId) && r.IsActive)
            .ToListAsync(cancellationToken);

        var recipesByProductId = recipes.ToDictionary(r => r.ProductId, r => r);

        var ingredientRequirements = new Dictionary<Guid, ComputedIngredientDto>();

        foreach (var planItem in planItems)
        {
            var product = planItem.Product!;
            
            if (!recipesByProductId.TryGetValue(product.Id, out var recipe))
                continue;

            foreach (var component in recipe.RecipeComponents)
            {
                foreach (var recipeIngredient in component.RecipeIngredients)
                {
                    var ingredient = recipeIngredient.Ingredient!;
                    var requiredQty = recipeIngredient.QtyPerUnit * planItem.ProduceQty;

                    if (!ingredientRequirements.ContainsKey(ingredient.Id))
                    {
                        ingredientRequirements[ingredient.Id] = new ComputedIngredientDto
                        {
                            IngredientId = ingredient.Id,
                            IngredientCode = ingredient.Code,
                            IngredientName = ingredient.Name,
                            Unit = ingredient.UnitOfMeasure?.Code ?? string.Empty,
                            ProductionQty = 0,
                            ExtraPercentage = ingredient.ExtraPercentage,
                            ExtraQty = 0,
                            TotalQty = 0,
                            UsedInProducts = new List<string>()
                        };
                    }

                    ingredientRequirements[ingredient.Id].ProductionQty += requiredQty;
                    if (!ingredientRequirements[ingredient.Id].UsedInProducts.Contains(product.Name))
                    {
                        ingredientRequirements[ingredient.Id].UsedInProducts.Add(product.Name);
                    }
                }
            }
        }

        foreach (var ingredientDto in ingredientRequirements.Values)
        {
            ingredientDto.ExtraQty = ingredientDto.ProductionQty * ingredientDto.ExtraPercentage / 100;
            ingredientDto.TotalQty = ingredientDto.ProductionQty + ingredientDto.ExtraQty;
        }

        return new ComputeStoresIssueNoteResponseDto
        {
            ProductionPlanId = productionPlanId,
            ProductionSectionId = productionSectionId,
            ProductionSectionName = section.Name,
            Ingredients = ingredientRequirements.Values
                .OrderBy(i => i.IngredientCode)
                .ToList()
        };
    }

    public async Task<StoresIssueNoteDetailDto> CreateStoresIssueNoteAsync(CreateStoresIssueNoteDto dto, CancellationToken cancellationToken = default)
    {
        var existingNote = await _context.StoresIssueNotes
            .FirstOrDefaultAsync(sin => sin.ProductionPlanId == dto.ProductionPlanId && 
                                       sin.ProductionSectionId == dto.ProductionSectionId, 
                                cancellationToken);

        if (existingNote != null)
            throw new InvalidOperationException("Stores issue note already exists for this production plan and section");

        var issueNoteNo = await GenerateIssueNoteNoAsync(cancellationToken);

        var note = new StoresIssueNote
        {
            Id = Guid.NewGuid(),
            IssueNoteNo = issueNoteNo,
            ProductionPlanId = dto.ProductionPlanId,
            ProductionSectionId = dto.ProductionSectionId,
            IssueDate = dto.IssueDate,
            Status = StoresIssueNoteStatus.Draft,
            CreatedAt = DateTime.UtcNow
        };

        foreach (var itemDto in dto.Items)
        {
            var item = new StoresIssueNoteItem
            {
                Id = Guid.NewGuid(),
                StoresIssueNoteId = note.Id,
                IngredientId = itemDto.IngredientId,
                ProductionQty = itemDto.ProductionQty,
                ExtraQty = itemDto.ExtraQty,
                TotalQty = itemDto.TotalQty,
                Notes = itemDto.Notes,
                CreatedAt = DateTime.UtcNow
            };

            note.StoresIssueNoteItems.Add(item);
        }

        _context.StoresIssueNotes.Add(note);
        await _context.SaveChangesAsync(cancellationToken);

        return await GetStoresIssueNoteByIdAsync(note.Id, cancellationToken) ?? throw new InvalidOperationException("Failed to retrieve created note");
    }

    public async Task<StoresIssueNoteDetailDto?> GetStoresIssueNoteByIdAsync(Guid id, CancellationToken cancellationToken = default)
    {
        var note = await _context.StoresIssueNotes
            .Include(sin => sin.ProductionSection)
            .Include(sin => sin.StoresIssueNoteItems)
                .ThenInclude(sini => sini.Ingredient)
            .FirstOrDefaultAsync(sin => sin.Id == id, cancellationToken);

        if (note == null)
            return null;

        return _mapper.Map<StoresIssueNoteDetailDto>(note);
    }

    public async Task<StoresIssueNoteDetailDto?> GetBySectionAsync(Guid productionPlanId, Guid productionSectionId, CancellationToken cancellationToken = default)
    {
        var note = await _context.StoresIssueNotes
            .Include(sin => sin.ProductionSection)
            .Include(sin => sin.StoresIssueNoteItems)
                .ThenInclude(sini => sini.Ingredient)
            .FirstOrDefaultAsync(sin => sin.ProductionPlanId == productionPlanId && 
                                       sin.ProductionSectionId == productionSectionId, 
                                cancellationToken);

        if (note == null)
            return null;

        return _mapper.Map<StoresIssueNoteDetailDto>(note);
    }

    public async Task<List<StoresIssueNoteListDto>> GetAllStoresIssueNotesAsync(CancellationToken cancellationToken = default)
    {
        var notes = await _context.StoresIssueNotes
            .Include(sin => sin.ProductionSection)
            .Include(sin => sin.StoresIssueNoteItems)
            .OrderByDescending(sin => sin.CreatedAt)
            .ToListAsync(cancellationToken);

        return _mapper.Map<List<StoresIssueNoteListDto>>(notes);
    }

    public async Task<StoresIssueNoteDetailDto?> UpdateStoresIssueNoteAsync(Guid id, UpdateStoresIssueNoteDto dto, CancellationToken cancellationToken = default)
    {
        var note = await _context.StoresIssueNotes
            .Include(sin => sin.StoresIssueNoteItems)
            .FirstOrDefaultAsync(sin => sin.Id == id, cancellationToken);

        if (note == null)
            return null;

        if (dto.IssueDate.HasValue)
            note.IssueDate = dto.IssueDate.Value;

        if (dto.Status.HasValue)
            note.Status = dto.Status.Value;

        if (dto.Items != null)
        {
            foreach (var itemDto in dto.Items)
            {
                var item = note.StoresIssueNoteItems.FirstOrDefault(i => i.Id == itemDto.Id);
                if (item != null)
                {
                    if (itemDto.ExtraQty.HasValue)
                    {
                        item.ExtraQty = itemDto.ExtraQty.Value;
                        item.TotalQty = item.ProductionQty + item.ExtraQty;
                    }

                    if (itemDto.Notes != null)
                        item.Notes = itemDto.Notes;

                    item.UpdatedAt = DateTime.UtcNow;
                }
            }
        }

        note.UpdatedAt = DateTime.UtcNow;

        await _context.SaveChangesAsync(cancellationToken);

        return await GetStoresIssueNoteByIdAsync(id, cancellationToken);
    }

    public async Task<bool> DeleteStoresIssueNoteAsync(Guid id, CancellationToken cancellationToken = default)
    {
        var note = await _context.StoresIssueNotes
            .Include(sin => sin.StoresIssueNoteItems)
            .FirstOrDefaultAsync(sin => sin.Id == id, cancellationToken);

        if (note == null)
            return false;

        _context.StoresIssueNotes.Remove(note);
        await _context.SaveChangesAsync(cancellationToken);

        return true;
    }

    public async Task<StoresIssueNoteDetailDto?> IssueNoteAsync(Guid id, Guid issuedBy, CancellationToken cancellationToken = default)
    {
        var note = await _context.StoresIssueNotes
            .FirstOrDefaultAsync(sin => sin.Id == id, cancellationToken);

        if (note == null)
            return null;

        if (note.Status != StoresIssueNoteStatus.Draft)
            throw new InvalidOperationException("Only draft notes can be issued");

        note.Status = StoresIssueNoteStatus.Issued;
        note.IssuedBy = issuedBy;
        note.UpdatedAt = DateTime.UtcNow;

        await _context.SaveChangesAsync(cancellationToken);

        return await GetStoresIssueNoteByIdAsync(id, cancellationToken);
    }

    public async Task<StoresIssueNoteDetailDto?> ReceiveNoteAsync(Guid id, Guid receivedBy, CancellationToken cancellationToken = default)
    {
        var note = await _context.StoresIssueNotes
            .FirstOrDefaultAsync(sin => sin.Id == id, cancellationToken);

        if (note == null)
            return null;

        if (note.Status != StoresIssueNoteStatus.Issued)
            throw new InvalidOperationException("Only issued notes can be received");

        note.Status = StoresIssueNoteStatus.Received;
        note.ReceivedBy = receivedBy;
        note.ReceivedAt = DateTime.UtcNow;
        note.UpdatedAt = DateTime.UtcNow;

        await _context.SaveChangesAsync(cancellationToken);

        return await GetStoresIssueNoteByIdAsync(id, cancellationToken);
    }

    private async Task<string> GenerateIssueNoteNoAsync(CancellationToken cancellationToken = default)
    {
        var year = DateTime.UtcNow.Year;
        var prefix = $"SIN-{year}-";

        var lastNote = await _context.StoresIssueNotes
            .Where(sin => sin.IssueNoteNo.StartsWith(prefix))
            .OrderByDescending(sin => sin.IssueNoteNo)
            .FirstOrDefaultAsync(cancellationToken);

        int nextNumber = 1;
        if (lastNote != null)
        {
            var lastNumberStr = lastNote.IssueNoteNo.Substring(prefix.Length);
            if (int.TryParse(lastNumberStr, out int lastNumber))
            {
                nextNumber = lastNumber + 1;
            }
        }

        return $"{prefix}{nextNumber:D6}";
    }
}
