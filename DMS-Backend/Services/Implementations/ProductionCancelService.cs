using Microsoft.EntityFrameworkCore;
using AutoMapper;
using DMS_Backend.Data;
using DMS_Backend.Models.Entities;
using DMS_Backend.Models.DTOs.ProductionCancels;
using DMS_Backend.Services.Interfaces;

namespace DMS_Backend.Services.Implementations;

public class ProductionCancelService : IProductionCancelService
{
    private readonly ApplicationDbContext _context;
    private readonly IMapper _mapper;

    public ProductionCancelService(ApplicationDbContext context, IMapper mapper)
    {
        _context = context;
        _mapper = mapper;
    }

    public async Task<(List<ProductionCancelListDto> Cancellations, int TotalCount)> GetAllAsync(
        int page, int pageSize, DateTime? fromDate, DateTime? toDate,
        Guid? productId, string? status, CancellationToken cancellationToken = default)
    {
        var query = _context.ProductionCancels
            .Include(p => p.Product)
            .Include(p => p.CreatedBy)
            .Include(p => p.ApprovedBy)
            .Where(p => p.IsActive)
            .AsQueryable();

        if (fromDate.HasValue)
            query = query.Where(p => p.CancelDate >= fromDate.Value);

        if (toDate.HasValue)
            query = query.Where(p => p.CancelDate <= toDate.Value);

        if (productId.HasValue)
            query = query.Where(p => p.ProductId == productId.Value);

        if (!string.IsNullOrWhiteSpace(status) && Enum.TryParse<ProductionCancelStatus>(status, true, out var statusEnum))
            query = query.Where(p => p.Status == statusEnum);

        var totalCount = await query.CountAsync(cancellationToken);

        var cancellations = await query
            .OrderByDescending(p => p.CancelDate)
            .ThenByDescending(p => p.CreatedAt)
            .Skip((page - 1) * pageSize)
            .Take(pageSize)
            .ToListAsync(cancellationToken);

        return (_mapper.Map<List<ProductionCancelListDto>>(cancellations), totalCount);
    }

    public async Task<ProductionCancelDetailDto?> GetByIdAsync(Guid id, CancellationToken cancellationToken = default)
    {
        var cancellation = await _context.ProductionCancels
            .Include(p => p.Product)
            .Include(p => p.CreatedBy)
            .Include(p => p.ApprovedBy)
            .FirstOrDefaultAsync(p => p.Id == id && p.IsActive, cancellationToken);

        if (cancellation == null)
            return null;

        return _mapper.Map<ProductionCancelDetailDto>(cancellation);
    }

    public async Task<ProductionCancelDetailDto?> GetByCancelNoAsync(string cancelNo, CancellationToken cancellationToken = default)
    {
        var cancellation = await _context.ProductionCancels
            .Include(p => p.Product)
            .Include(p => p.CreatedBy)
            .Include(p => p.ApprovedBy)
            .FirstOrDefaultAsync(p => p.CancelNo == cancelNo && p.IsActive, cancellationToken);

        if (cancellation == null)
            return null;

        return _mapper.Map<ProductionCancelDetailDto>(cancellation);
    }

    public async Task<ProductionCancelDetailDto> CreateAsync(CreateProductionCancelDto dto, Guid userId, CancellationToken cancellationToken = default)
    {
        var cancellation = new ProductionCancel
        {
            Id = Guid.NewGuid(),
            CancelDate = DateTime.SpecifyKind(dto.CancelDate, DateTimeKind.Utc),
            ProductionNo = dto.ProductionNo,
            ProductId = dto.ProductId,
            CancelledQty = dto.CancelledQty,
            Reason = dto.Reason,
            Status = ProductionCancelStatus.Pending,
            CreatedById = userId,
            CreatedAt = DateTime.UtcNow,
            UpdatedAt = DateTime.UtcNow
        };

        _context.ProductionCancels.Add(cancellation);
        await _context.SaveChangesAsync(cancellationToken);

        return await GetByIdAsync(cancellation.Id, cancellationToken) 
            ?? throw new InvalidOperationException("Failed to retrieve created cancellation");
    }

    public async Task<ProductionCancelDetailDto?> UpdateAsync(Guid id, UpdateProductionCancelDto dto, Guid userId, CancellationToken cancellationToken = default)
    {
        var cancellation = await _context.ProductionCancels
            .FirstOrDefaultAsync(p => p.Id == id && p.IsActive, cancellationToken);

        if (cancellation == null)
            return null;

        if (cancellation.Status != ProductionCancelStatus.Pending)
            throw new InvalidOperationException("Only pending cancellations can be updated");

        cancellation.CancelDate = DateTime.SpecifyKind(dto.CancelDate, DateTimeKind.Utc);
        cancellation.ProductionNo = dto.ProductionNo;
        cancellation.ProductId = dto.ProductId;
        cancellation.CancelledQty = dto.CancelledQty;
        cancellation.Reason = dto.Reason;
        cancellation.UpdatedById = userId;
        cancellation.UpdatedAt = DateTime.UtcNow;

        await _context.SaveChangesAsync(cancellationToken);

        return await GetByIdAsync(id, cancellationToken);
    }

    public async Task<bool> DeleteAsync(Guid id, CancellationToken cancellationToken = default)
    {
        var cancellation = await _context.ProductionCancels
            .FirstOrDefaultAsync(p => p.Id == id && p.IsActive, cancellationToken);

        if (cancellation == null)
            return false;

        if (cancellation.Status != ProductionCancelStatus.Pending)
            throw new InvalidOperationException("Only pending cancellations can be deleted");

        cancellation.IsActive = false;
        cancellation.UpdatedAt = DateTime.UtcNow;

        await _context.SaveChangesAsync(cancellationToken);

        return true;
    }

    public async Task<ProductionCancelDetailDto?> ApproveAsync(Guid id, Guid userId, CancellationToken cancellationToken = default)
    {
        var cancellation = await _context.ProductionCancels
            .FirstOrDefaultAsync(p => p.Id == id && p.IsActive, cancellationToken);

        if (cancellation == null)
            return null;

        if (cancellation.Status != ProductionCancelStatus.Pending)
            throw new InvalidOperationException("Only pending cancellations can be approved");

        cancellation.Status = ProductionCancelStatus.Approved;
        cancellation.ApprovedById = userId;
        cancellation.ApprovedDate = DateTime.UtcNow;
        cancellation.UpdatedById = userId;
        cancellation.UpdatedAt = DateTime.UtcNow;

        await _context.SaveChangesAsync(cancellationToken);

        return await GetByIdAsync(id, cancellationToken);
    }

    public async Task<ProductionCancelDetailDto?> RejectAsync(Guid id, Guid userId, CancellationToken cancellationToken = default)
    {
        var cancellation = await _context.ProductionCancels
            .FirstOrDefaultAsync(p => p.Id == id && p.IsActive, cancellationToken);

        if (cancellation == null)
            return null;

        if (cancellation.Status != ProductionCancelStatus.Pending)
            throw new InvalidOperationException("Only pending cancellations can be rejected");

        cancellation.Status = ProductionCancelStatus.Rejected;
        cancellation.UpdatedById = userId;
        cancellation.UpdatedAt = DateTime.UtcNow;

        await _context.SaveChangesAsync(cancellationToken);

        return await GetByIdAsync(id, cancellationToken);
    }
}
