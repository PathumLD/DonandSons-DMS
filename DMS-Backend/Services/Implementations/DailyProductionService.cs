using Microsoft.EntityFrameworkCore;
using AutoMapper;
using DMS_Backend.Data;
using DMS_Backend.Models.Entities;
using DMS_Backend.Models.DTOs.DailyProductions;
using DMS_Backend.Services.Interfaces;

namespace DMS_Backend.Services.Implementations;

public class DailyProductionService : IDailyProductionService
{
    private readonly ApplicationDbContext _context;
    private readonly IMapper _mapper;

    public DailyProductionService(ApplicationDbContext context, IMapper mapper)
    {
        _context = context;
        _mapper = mapper;
    }

    public async Task<(List<DailyProductionListDto> Productions, int TotalCount)> GetAllAsync(
        int page, int pageSize, DateTime? fromDate, DateTime? toDate,
        Guid? productId, string? status, CancellationToken cancellationToken = default)
    {
        var query = _context.DailyProductions
            .Include(d => d.Product)
            .Include(d => d.Shift)
            .Include(d => d.CreatedBy)
            .Include(d => d.ApprovedBy)
            .Where(d => d.IsActive)
            .AsQueryable();

        if (fromDate.HasValue)
            query = query.Where(d => d.ProductionDate >= fromDate.Value);

        if (toDate.HasValue)
            query = query.Where(d => d.ProductionDate <= toDate.Value);

        if (productId.HasValue)
            query = query.Where(d => d.ProductId == productId.Value);

        if (!string.IsNullOrWhiteSpace(status) && Enum.TryParse<DailyProductionStatus>(status, true, out var statusEnum))
            query = query.Where(d => d.Status == statusEnum);

        var totalCount = await query.CountAsync(cancellationToken);

        var productions = await query
            .OrderByDescending(d => d.ProductionDate)
            .ThenByDescending(d => d.CreatedAt)
            .Skip((page - 1) * pageSize)
            .Take(pageSize)
            .ToListAsync(cancellationToken);

        return (_mapper.Map<List<DailyProductionListDto>>(productions), totalCount);
    }

    public async Task<DailyProductionDetailDto?> GetByIdAsync(Guid id, CancellationToken cancellationToken = default)
    {
        var production = await _context.DailyProductions
            .Include(d => d.Product)
            .Include(d => d.Shift)
            .Include(d => d.CreatedBy)
            .Include(d => d.ApprovedBy)
            .FirstOrDefaultAsync(d => d.Id == id && d.IsActive, cancellationToken);

        if (production == null)
            return null;

        return _mapper.Map<DailyProductionDetailDto>(production);
    }

    public async Task<DailyProductionDetailDto?> GetByProductionNoAsync(string productionNo, CancellationToken cancellationToken = default)
    {
        var production = await _context.DailyProductions
            .Include(d => d.Product)
            .Include(d => d.Shift)
            .Include(d => d.CreatedBy)
            .Include(d => d.ApprovedBy)
            .FirstOrDefaultAsync(d => d.ProductionNo == productionNo && d.IsActive, cancellationToken);

        if (production == null)
            return null;

        return _mapper.Map<DailyProductionDetailDto>(production);
    }

    public async Task<DailyProductionDetailDto> CreateAsync(CreateDailyProductionDto dto, Guid userId, CancellationToken cancellationToken = default)
    {
        // Verify shift exists
        var shiftExists = await _context.Shifts.AnyAsync(s => s.Id == dto.ShiftId && s.IsActive, cancellationToken);
        if (!shiftExists)
            throw new InvalidOperationException($"Invalid shift ID: {dto.ShiftId}");

        var production = new DailyProduction
        {
            Id = Guid.NewGuid(),
            ProductionDate = DateTime.SpecifyKind(dto.ProductionDate, DateTimeKind.Utc),
            ProductId = dto.ProductId,
            PlannedQty = dto.PlannedQty,
            ProducedQty = dto.ProducedQty,
            ShiftId = dto.ShiftId,
            Status = DailyProductionStatus.Pending,
            Notes = dto.Notes,
            CreatedById = userId,
            CreatedAt = DateTime.UtcNow,
            UpdatedAt = DateTime.UtcNow
        };

        _context.DailyProductions.Add(production);
        await _context.SaveChangesAsync(cancellationToken);

        return await GetByIdAsync(production.Id, cancellationToken) 
            ?? throw new InvalidOperationException("Failed to retrieve created production");
    }

    public async Task<DailyProductionDetailDto?> UpdateAsync(Guid id, UpdateDailyProductionDto dto, Guid userId, CancellationToken cancellationToken = default)
    {
        var production = await _context.DailyProductions
            .FirstOrDefaultAsync(d => d.Id == id && d.IsActive, cancellationToken);

        if (production == null)
            return null;

        if (production.Status != DailyProductionStatus.Pending)
            throw new InvalidOperationException("Only pending productions can be updated");

        // Verify shift exists
        var shiftExists = await _context.Shifts.AnyAsync(s => s.Id == dto.ShiftId && s.IsActive, cancellationToken);
        if (!shiftExists)
            throw new InvalidOperationException($"Invalid shift ID: {dto.ShiftId}");

        production.ProductionDate = DateTime.SpecifyKind(dto.ProductionDate, DateTimeKind.Utc);
        production.ProductId = dto.ProductId;
        production.PlannedQty = dto.PlannedQty;
        production.ProducedQty = dto.ProducedQty;
        production.ShiftId = dto.ShiftId;
        production.Notes = dto.Notes;
        production.UpdatedById = userId;
        production.UpdatedAt = DateTime.UtcNow;

        await _context.SaveChangesAsync(cancellationToken);

        return await GetByIdAsync(id, cancellationToken);
    }

    public async Task<bool> DeleteAsync(Guid id, CancellationToken cancellationToken = default)
    {
        var production = await _context.DailyProductions
            .FirstOrDefaultAsync(d => d.Id == id && d.IsActive, cancellationToken);

        if (production == null)
            return false;

        if (production.Status != DailyProductionStatus.Pending)
            throw new InvalidOperationException("Only pending productions can be deleted");

        production.IsActive = false;
        production.UpdatedAt = DateTime.UtcNow;

        await _context.SaveChangesAsync(cancellationToken);

        return true;
    }

    public async Task<DailyProductionDetailDto?> ApproveAsync(Guid id, Guid userId, CancellationToken cancellationToken = default)
    {
        var production = await _context.DailyProductions
            .FirstOrDefaultAsync(d => d.Id == id && d.IsActive, cancellationToken);

        if (production == null)
            return null;

        if (production.Status != DailyProductionStatus.Pending)
            throw new InvalidOperationException("Only pending productions can be approved");

        production.Status = DailyProductionStatus.Approved;
        production.ApprovedById = userId;
        production.ApprovedDate = DateTime.UtcNow;
        production.UpdatedById = userId;
        production.UpdatedAt = DateTime.UtcNow;

        await _context.SaveChangesAsync(cancellationToken);

        return await GetByIdAsync(id, cancellationToken);
    }

    public async Task<DailyProductionDetailDto?> RejectAsync(Guid id, Guid userId, CancellationToken cancellationToken = default)
    {
        var production = await _context.DailyProductions
            .FirstOrDefaultAsync(d => d.Id == id && d.IsActive, cancellationToken);

        if (production == null)
            return null;

        if (production.Status != DailyProductionStatus.Pending)
            throw new InvalidOperationException("Only pending productions can be rejected");

        production.Status = DailyProductionStatus.Rejected;
        production.UpdatedById = userId;
        production.UpdatedAt = DateTime.UtcNow;

        await _context.SaveChangesAsync(cancellationToken);

        return await GetByIdAsync(id, cancellationToken);
    }
}
