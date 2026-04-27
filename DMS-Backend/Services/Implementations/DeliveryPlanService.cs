using AutoMapper;
using Microsoft.EntityFrameworkCore;
using DMS_Backend.Data;
using DMS_Backend.Models.DTOs.DeliveryPlans;
using DMS_Backend.Models.Entities;
using DMS_Backend.Services.Interfaces;

namespace DMS_Backend.Services.Implementations;

public sealed class DeliveryPlanService : IDeliveryPlanService
{
    private readonly ApplicationDbContext _context;
    private readonly IMapper _mapper;
    private readonly ILogger<DeliveryPlanService> _logger;

    public DeliveryPlanService(
        ApplicationDbContext context,
        IMapper mapper,
        ILogger<DeliveryPlanService> logger)
    {
        _context = context;
        _mapper = mapper;
        _logger = logger;
    }

    public async Task<(IEnumerable<DeliveryPlanListDto> plans, int totalCount)> GetAllAsync(
        int page,
        int pageSize,
        DateTime? fromDate = null,
        DateTime? toDate = null,
        string? status = null,
        Guid? deliveryTurnId = null,
        CancellationToken cancellationToken = default)
    {
        var query = _context.Set<DeliveryPlan>()
            .Include(dp => dp.DeliveryTurn)
            .Include(dp => dp.DayType)
            .Include(dp => dp.DeliveryPlanItems)
            .AsQueryable();

        if (fromDate.HasValue)
        {
            query = query.Where(dp => dp.PlanDate >= fromDate.Value);
        }

        if (toDate.HasValue)
        {
            query = query.Where(dp => dp.PlanDate <= toDate.Value);
        }

        if (!string.IsNullOrWhiteSpace(status))
        {
            query = query.Where(dp => dp.Status == status);
        }

        if (deliveryTurnId.HasValue)
        {
            query = query.Where(dp => dp.DeliveryTurnId == deliveryTurnId.Value);
        }

        var totalCount = await query.CountAsync(cancellationToken);

        var plans = await query
            .OrderByDescending(dp => dp.PlanDate)
            .ThenBy(dp => dp.PlanNo)
            .Skip((page - 1) * pageSize)
            .Take(pageSize)
            .Select(dp => new DeliveryPlanListDto
            {
                Id = dp.Id,
                PlanNo = dp.PlanNo,
                PlanDate = dp.PlanDate,
                DeliveryTurnId = dp.DeliveryTurnId,
                DeliveryTurnName = dp.DeliveryTurn!.Name,
                DayTypeId = dp.DayTypeId,
                DayTypeName = dp.DayType!.Name,
                Status = dp.Status,
                UseFreezerStock = dp.UseFreezerStock,
                TotalItems = dp.DeliveryPlanItems.Count,
                UpdatedAt = dp.UpdatedAt
            })
            .ToListAsync(cancellationToken);

        return (plans, totalCount);
    }

    public async Task<DeliveryPlanDetailDto?> GetByIdAsync(Guid id, CancellationToken cancellationToken = default)
    {
        var plan = await _context.Set<DeliveryPlan>()
            .Include(dp => dp.DeliveryTurn)
            .Include(dp => dp.DayType)
            .Include(dp => dp.DeliveryPlanItems)
                .ThenInclude(dpi => dpi.Product)
            .Include(dp => dp.DeliveryPlanItems)
                .ThenInclude(dpi => dpi.Outlet)
            .FirstOrDefaultAsync(dp => dp.Id == id, cancellationToken);

        if (plan == null)
        {
            return null;
        }

        return new DeliveryPlanDetailDto
        {
            Id = plan.Id,
            PlanNo = plan.PlanNo,
            PlanDate = plan.PlanDate,
            DeliveryTurnId = plan.DeliveryTurnId,
            DeliveryTurnName = plan.DeliveryTurn!.Name,
            DayTypeId = plan.DayTypeId,
            DayTypeName = plan.DayType!.Name,
            Status = plan.Status,
            UseFreezerStock = plan.UseFreezerStock,
            ExcludedOutlets = plan.ExcludedOutlets,
            ExcludedProducts = plan.ExcludedProducts,
            Notes = plan.Notes,
            Items = plan.DeliveryPlanItems.Select(dpi => new DeliveryPlanItemDto
            {
                Id = dpi.Id,
                DeliveryPlanId = dpi.DeliveryPlanId,
                ProductId = dpi.ProductId,
                ProductName = dpi.Product!.Name,
                OutletId = dpi.OutletId,
                OutletName = dpi.Outlet!.Name,
                FullQuantity = dpi.FullQuantity,
                MiniQuantity = dpi.MiniQuantity,
                Notes = dpi.Notes
            }).ToList(),
            IsActive = plan.IsActive,
            CreatedAt = plan.CreatedAt,
            UpdatedAt = plan.UpdatedAt,
            CreatedById = plan.CreatedById,
            UpdatedById = plan.UpdatedById
        };
    }

    public async Task<DeliveryPlanDetailDto?> GetByPlanNoAsync(string planNo, CancellationToken cancellationToken = default)
    {
        var plan = await _context.Set<DeliveryPlan>()
            .Include(dp => dp.DeliveryTurn)
            .Include(dp => dp.DayType)
            .Include(dp => dp.DeliveryPlanItems)
                .ThenInclude(dpi => dpi.Product)
            .Include(dp => dp.DeliveryPlanItems)
                .ThenInclude(dpi => dpi.Outlet)
            .FirstOrDefaultAsync(dp => dp.PlanNo == planNo, cancellationToken);

        if (plan == null)
        {
            return null;
        }

        return await GetByIdAsync(plan.Id, cancellationToken);
    }

    public async Task<DeliveryPlanDetailDto> CreateAsync(
        CreateDeliveryPlanDto dto,
        Guid userId,
        CancellationToken cancellationToken = default)
    {
        var exists = await _context.Set<DeliveryPlan>()
            .AnyAsync(dp => dp.PlanNo == dto.PlanNo, cancellationToken);

        if (exists)
        {
            throw new InvalidOperationException($"Delivery plan with number '{dto.PlanNo}' already exists.");
        }

        var plan = _mapper.Map<DeliveryPlan>(dto);
        plan.Id = Guid.NewGuid();
        plan.Status = "Draft";
        plan.CreatedById = userId;
        plan.UpdatedById = userId;
        plan.CreatedAt = DateTime.UtcNow;
        plan.UpdatedAt = DateTime.UtcNow;

        _context.Set<DeliveryPlan>().Add(plan);
        await _context.SaveChangesAsync(cancellationToken);

        _logger.LogInformation("Delivery plan created: {PlanNo} for {PlanDate}", plan.PlanNo, plan.PlanDate);

        return (await GetByIdAsync(plan.Id, cancellationToken))!;
    }

    public async Task<DeliveryPlanDetailDto> UpdateAsync(
        Guid id,
        UpdateDeliveryPlanDto dto,
        Guid userId,
        CancellationToken cancellationToken = default)
    {
        var plan = await _context.Set<DeliveryPlan>()
            .FirstOrDefaultAsync(dp => dp.Id == id, cancellationToken);

        if (plan == null)
        {
            throw new InvalidOperationException($"Delivery plan with ID '{id}' not found.");
        }

        if (plan.Status != "Draft")
        {
            throw new InvalidOperationException("Only draft plans can be updated.");
        }

        _mapper.Map(dto, plan);
        plan.UpdatedById = userId;
        plan.UpdatedAt = DateTime.UtcNow;

        await _context.SaveChangesAsync(cancellationToken);

        _logger.LogInformation("Delivery plan updated: {PlanNo}", plan.PlanNo);

        return (await GetByIdAsync(id, cancellationToken))!;
    }

    public async Task DeleteAsync(Guid id, CancellationToken cancellationToken = default)
    {
        var plan = await _context.Set<DeliveryPlan>()
            .FirstOrDefaultAsync(dp => dp.Id == id, cancellationToken);

        if (plan == null)
        {
            throw new InvalidOperationException($"Delivery plan with ID '{id}' not found.");
        }

        if (plan.Status != "Draft")
        {
            throw new InvalidOperationException("Only draft plans can be deleted.");
        }

        plan.IsActive = false;
        plan.UpdatedAt = DateTime.UtcNow;

        await _context.SaveChangesAsync(cancellationToken);

        _logger.LogInformation("Delivery plan soft-deleted: {PlanNo}", plan.PlanNo);
    }

    public async Task<DeliveryPlanDetailDto> SubmitAsync(
        Guid id,
        Guid userId,
        CancellationToken cancellationToken = default)
    {
        var plan = await _context.Set<DeliveryPlan>()
            .FirstOrDefaultAsync(dp => dp.Id == id, cancellationToken);

        if (plan == null)
        {
            throw new InvalidOperationException($"Delivery plan with ID '{id}' not found.");
        }

        if (plan.Status != "Draft")
        {
            throw new InvalidOperationException("Plan is not in draft status.");
        }

        plan.Status = "InProduction";
        plan.UpdatedById = userId;
        plan.UpdatedAt = DateTime.UtcNow;

        await _context.SaveChangesAsync(cancellationToken);

        _logger.LogInformation("Delivery plan submitted: {PlanNo}", plan.PlanNo);

        return (await GetByIdAsync(id, cancellationToken))!;
    }

    public async Task<IEnumerable<DeliveryPlanItemDto>> BulkUpsertItemsAsync(
        Guid planId,
        List<BulkUpsertDeliveryPlanItemDto> items,
        Guid userId,
        CancellationToken cancellationToken = default)
    {
        var plan = await _context.Set<DeliveryPlan>()
            .Include(dp => dp.DeliveryPlanItems)
            .FirstOrDefaultAsync(dp => dp.Id == planId, cancellationToken);

        if (plan == null)
        {
            throw new InvalidOperationException($"Delivery plan with ID '{planId}' not found.");
        }

        if (plan.Status != "Draft")
        {
            throw new InvalidOperationException("Only draft plans can have items modified.");
        }

        var results = new List<DeliveryPlanItemDto>();

        foreach (var itemDto in items)
        {
            var existing = await _context.Set<DeliveryPlanItem>()
                .Include(dpi => dpi.Product)
                .Include(dpi => dpi.Outlet)
                .FirstOrDefaultAsync(dpi =>
                    dpi.DeliveryPlanId == planId &&
                    dpi.ProductId == itemDto.ProductId &&
                    dpi.OutletId == itemDto.OutletId,
                    cancellationToken);

            if (existing != null)
            {
                existing.FullQuantity = itemDto.FullQuantity;
                existing.MiniQuantity = itemDto.MiniQuantity;
                existing.Notes = itemDto.Notes;
                existing.UpdatedById = userId;
                existing.UpdatedAt = DateTime.UtcNow;

                await _context.SaveChangesAsync(cancellationToken);

                results.Add(new DeliveryPlanItemDto
                {
                    Id = existing.Id,
                    DeliveryPlanId = existing.DeliveryPlanId,
                    ProductId = existing.ProductId,
                    ProductName = existing.Product!.Name,
                    OutletId = existing.OutletId,
                    OutletName = existing.Outlet!.Name,
                    FullQuantity = existing.FullQuantity,
                    MiniQuantity = existing.MiniQuantity,
                    Notes = existing.Notes
                });
            }
            else
            {
                var newItem = new DeliveryPlanItem
                {
                    Id = Guid.NewGuid(),
                    DeliveryPlanId = planId,
                    ProductId = itemDto.ProductId,
                    OutletId = itemDto.OutletId,
                    FullQuantity = itemDto.FullQuantity,
                    MiniQuantity = itemDto.MiniQuantity,
                    Notes = itemDto.Notes,
                    CreatedById = userId,
                    UpdatedById = userId,
                    CreatedAt = DateTime.UtcNow,
                    UpdatedAt = DateTime.UtcNow,
                    IsActive = true
                };

                _context.Set<DeliveryPlanItem>().Add(newItem);
                await _context.SaveChangesAsync(cancellationToken);

                var addedItem = await _context.Set<DeliveryPlanItem>()
                    .Include(dpi => dpi.Product)
                    .Include(dpi => dpi.Outlet)
                    .FirstAsync(dpi => dpi.Id == newItem.Id, cancellationToken);

                results.Add(new DeliveryPlanItemDto
                {
                    Id = addedItem.Id,
                    DeliveryPlanId = addedItem.DeliveryPlanId,
                    ProductId = addedItem.ProductId,
                    ProductName = addedItem.Product!.Name,
                    OutletId = addedItem.OutletId,
                    OutletName = addedItem.Outlet!.Name,
                    FullQuantity = addedItem.FullQuantity,
                    MiniQuantity = addedItem.MiniQuantity,
                    Notes = addedItem.Notes
                });
            }
        }

        plan.UpdatedById = userId;
        plan.UpdatedAt = DateTime.UtcNow;
        await _context.SaveChangesAsync(cancellationToken);

        _logger.LogInformation("Bulk upsert completed for plan {PlanNo}: {Count} items processed", 
            plan.PlanNo, items.Count);

        return results;
    }
}
