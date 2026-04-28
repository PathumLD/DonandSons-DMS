using Microsoft.EntityFrameworkCore;
using AutoMapper;
using DMS_Backend.Data;
using DMS_Backend.Models.Entities;
using DMS_Backend.Models.DTOs.Disposals;
using DMS_Backend.Services.Interfaces;

namespace DMS_Backend.Services.Implementations;

public class DisposalService : IDisposalService
{
    private readonly ApplicationDbContext _context;
    private readonly IMapper _mapper;

    public DisposalService(ApplicationDbContext context, IMapper mapper)
    {
        _context = context;
        _mapper = mapper;
    }

    public async Task<(List<DisposalListDto> Disposals, int TotalCount)> GetAllAsync(
        int page, int pageSize, DateTime? fromDate, DateTime? toDate,
        Guid? outletId, string? status, CancellationToken cancellationToken = default)
    {
        var query = _context.Disposals
            .Include(d => d.Outlet)
            .Include(d => d.CreatedBy)
            .Include(d => d.ApprovedBy)
            .AsQueryable();

        if (fromDate.HasValue)
            query = query.Where(d => d.DisposalDate >= fromDate.Value);

        if (toDate.HasValue)
            query = query.Where(d => d.DisposalDate <= toDate.Value);

        if (outletId.HasValue)
            query = query.Where(d => d.OutletId == outletId.Value);

        if (!string.IsNullOrWhiteSpace(status) && Enum.TryParse<DisposalStatus>(status, true, out var statusEnum))
            query = query.Where(d => d.Status == statusEnum);

        var totalCount = await query.CountAsync(cancellationToken);

        var disposals = await query
            .OrderByDescending(d => d.DisposalDate)
            .ThenByDescending(d => d.CreatedAt)
            .Skip((page - 1) * pageSize)
            .Take(pageSize)
            .ToListAsync(cancellationToken);

        return (_mapper.Map<List<DisposalListDto>>(disposals), totalCount);
    }

    public async Task<DisposalDetailDto?> GetByIdAsync(Guid id, CancellationToken cancellationToken = default)
    {
        var disposal = await _context.Disposals
            .Include(d => d.Outlet)
            .Include(d => d.CreatedBy)
            .Include(d => d.ApprovedBy)
            .Include(d => d.Items)
                .ThenInclude(i => i.Product)
            .FirstOrDefaultAsync(d => d.Id == id, cancellationToken);

        if (disposal == null)
            return null;

        return _mapper.Map<DisposalDetailDto>(disposal);
    }

    public async Task<DisposalDetailDto?> GetByDisposalNoAsync(string disposalNo, CancellationToken cancellationToken = default)
    {
        var disposal = await _context.Disposals
            .Include(d => d.Outlet)
            .Include(d => d.CreatedBy)
            .Include(d => d.ApprovedBy)
            .Include(d => d.Items)
                .ThenInclude(i => i.Product)
            .FirstOrDefaultAsync(d => d.DisposalNo == disposalNo, cancellationToken);

        if (disposal == null)
            return null;

        return _mapper.Map<DisposalDetailDto>(disposal);
    }

    public async Task<DisposalDetailDto> CreateAsync(CreateDisposalDto dto, Guid userId, CancellationToken cancellationToken = default)
    {
        var disposal = new Disposal
        {
            Id = Guid.NewGuid(),
            DisposalDate = DateTime.SpecifyKind(dto.DisposalDate, DateTimeKind.Utc),
            OutletId = dto.OutletId,
            DeliveredDate = DateTime.SpecifyKind(dto.DeliveredDate, DateTimeKind.Utc),
            Status = DisposalStatus.Draft,
            Notes = dto.Notes,
            CreatedById = userId,
            CreatedAt = DateTime.UtcNow,
            UpdatedAt = DateTime.UtcNow
        };

        foreach (var itemDto in dto.Items)
        {
            var item = new DisposalItem
            {
                Id = Guid.NewGuid(),
                DisposalId = disposal.Id,
                ProductId = itemDto.ProductId,
                Quantity = itemDto.Quantity,
                Reason = itemDto.Reason,
                CreatedAt = DateTime.UtcNow,
                UpdatedAt = DateTime.UtcNow
            };
            disposal.Items.Add(item);
        }

        disposal.TotalItems = disposal.Items.Count;

        _context.Disposals.Add(disposal);
        await _context.SaveChangesAsync(cancellationToken);

        return await GetByIdAsync(disposal.Id, cancellationToken) 
            ?? throw new InvalidOperationException("Failed to retrieve created disposal");
    }

    public async Task<DisposalDetailDto?> UpdateAsync(Guid id, UpdateDisposalDto dto, Guid userId, CancellationToken cancellationToken = default)
    {
        var disposal = await _context.Disposals
            .Include(d => d.Items)
            .FirstOrDefaultAsync(d => d.Id == id, cancellationToken);

        if (disposal == null)
            return null;

        if (disposal.Status != DisposalStatus.Draft)
            throw new InvalidOperationException("Only draft disposals can be updated");

        disposal.DisposalDate = DateTime.SpecifyKind(dto.DisposalDate, DateTimeKind.Utc);
        disposal.OutletId = dto.OutletId;
        disposal.DeliveredDate = DateTime.SpecifyKind(dto.DeliveredDate, DateTimeKind.Utc);
        disposal.Notes = dto.Notes;
        disposal.UpdatedById = userId;
        disposal.UpdatedAt = DateTime.UtcNow;

        _context.DisposalItems.RemoveRange(disposal.Items);

        foreach (var itemDto in dto.Items)
        {
            var item = new DisposalItem
            {
                Id = itemDto.Id ?? Guid.NewGuid(),
                DisposalId = disposal.Id,
                ProductId = itemDto.ProductId,
                Quantity = itemDto.Quantity,
                Reason = itemDto.Reason,
                CreatedAt = DateTime.UtcNow,
                UpdatedAt = DateTime.UtcNow
            };
            disposal.Items.Add(item);
        }

        disposal.TotalItems = disposal.Items.Count;

        await _context.SaveChangesAsync(cancellationToken);

        return await GetByIdAsync(id, cancellationToken);
    }

    public async Task<bool> DeleteAsync(Guid id, CancellationToken cancellationToken = default)
    {
        var disposal = await _context.Disposals
            .FirstOrDefaultAsync(d => d.Id == id, cancellationToken);

        if (disposal == null)
            return false;

        if (disposal.Status != DisposalStatus.Draft)
            throw new InvalidOperationException("Only draft disposals can be deleted");

        disposal.IsActive = false;
        disposal.UpdatedAt = DateTime.UtcNow;

        await _context.SaveChangesAsync(cancellationToken);

        return true;
    }

    public async Task<DisposalDetailDto?> SubmitAsync(Guid id, Guid userId, CancellationToken cancellationToken = default)
    {
        var disposal = await _context.Disposals
            .FirstOrDefaultAsync(d => d.Id == id, cancellationToken);

        if (disposal == null)
            return null;

        if (disposal.Status != DisposalStatus.Draft)
            throw new InvalidOperationException("Only draft disposals can be submitted");

        disposal.Status = DisposalStatus.Pending;
        disposal.UpdatedById = userId;
        disposal.UpdatedAt = DateTime.UtcNow;

        await _context.SaveChangesAsync(cancellationToken);

        return await GetByIdAsync(id, cancellationToken);
    }

    public async Task<DisposalDetailDto?> ApproveAsync(Guid id, Guid userId, CancellationToken cancellationToken = default)
    {
        var disposal = await _context.Disposals
            .FirstOrDefaultAsync(d => d.Id == id, cancellationToken);

        if (disposal == null)
            return null;

        if (disposal.Status != DisposalStatus.Pending)
            throw new InvalidOperationException("Only pending disposals can be approved");

        disposal.Status = DisposalStatus.Approved;
        disposal.ApprovedById = userId;
        disposal.ApprovedDate = DateTime.UtcNow;
        disposal.UpdatedById = userId;
        disposal.UpdatedAt = DateTime.UtcNow;

        await _context.SaveChangesAsync(cancellationToken);

        return await GetByIdAsync(id, cancellationToken);
    }

    public async Task<DisposalDetailDto?> RejectAsync(Guid id, Guid userId, CancellationToken cancellationToken = default)
    {
        var disposal = await _context.Disposals
            .FirstOrDefaultAsync(d => d.Id == id, cancellationToken);

        if (disposal == null)
            return null;

        if (disposal.Status != DisposalStatus.Pending)
            throw new InvalidOperationException("Only pending disposals can be rejected");

        disposal.Status = DisposalStatus.Rejected;
        disposal.UpdatedById = userId;
        disposal.UpdatedAt = DateTime.UtcNow;

        await _context.SaveChangesAsync(cancellationToken);

        return await GetByIdAsync(id, cancellationToken);
    }
}
