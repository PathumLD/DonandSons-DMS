using Microsoft.EntityFrameworkCore;
using AutoMapper;
using DMS_Backend.Data;
using DMS_Backend.Models.Entities;
using DMS_Backend.Models.DTOs.DeliveryReturns;
using DMS_Backend.Services.Interfaces;

namespace DMS_Backend.Services.Implementations;

public class DeliveryReturnService : IDeliveryReturnService
{
    private readonly ApplicationDbContext _context;
    private readonly IMapper _mapper;

    public DeliveryReturnService(ApplicationDbContext context, IMapper mapper)
    {
        _context = context;
        _mapper = mapper;
    }

    public async Task<(List<DeliveryReturnListDto> DeliveryReturns, int TotalCount)> GetAllAsync(
        int page, int pageSize, DateTime? fromDate, DateTime? toDate,
        Guid? outletId, string? status, CancellationToken cancellationToken = default)
    {
        var query = _context.DeliveryReturns
            .Include(dr => dr.Outlet)
            .Include(dr => dr.UpdatedBy)
            .Include(dr => dr.ApprovedBy)
            .AsQueryable();

        if (fromDate.HasValue)
            query = query.Where(dr => dr.ReturnDate >= fromDate.Value);

        if (toDate.HasValue)
            query = query.Where(dr => dr.ReturnDate <= toDate.Value);

        if (outletId.HasValue)
            query = query.Where(dr => dr.OutletId == outletId.Value);

        if (!string.IsNullOrWhiteSpace(status) && Enum.TryParse<DeliveryReturnStatus>(status, true, out var statusEnum))
            query = query.Where(dr => dr.Status == statusEnum);

        var totalCount = await query.CountAsync(cancellationToken);

        var deliveryReturns = await query
            .OrderByDescending(dr => dr.ReturnDate)
            .ThenByDescending(dr => dr.CreatedAt)
            .Skip((page - 1) * pageSize)
            .Take(pageSize)
            .ToListAsync(cancellationToken);

        return (_mapper.Map<List<DeliveryReturnListDto>>(deliveryReturns), totalCount);
    }

    public async Task<DeliveryReturnDetailDto?> GetByIdAsync(Guid id, CancellationToken cancellationToken = default)
    {
        var deliveryReturn = await _context.DeliveryReturns
            .Include(dr => dr.Outlet)
            .Include(dr => dr.ApprovedBy)
            .Include(dr => dr.Items)
                .ThenInclude(i => i.Product)
            .FirstOrDefaultAsync(dr => dr.Id == id, cancellationToken);

        if (deliveryReturn == null)
            return null;

        return _mapper.Map<DeliveryReturnDetailDto>(deliveryReturn);
    }

    public async Task<DeliveryReturnDetailDto?> GetByReturnNoAsync(string returnNo, CancellationToken cancellationToken = default)
    {
        var deliveryReturn = await _context.DeliveryReturns
            .Include(dr => dr.Outlet)
            .Include(dr => dr.ApprovedBy)
            .Include(dr => dr.Items)
                .ThenInclude(i => i.Product)
            .FirstOrDefaultAsync(dr => dr.ReturnNo == returnNo, cancellationToken);

        if (deliveryReturn == null)
            return null;

        return _mapper.Map<DeliveryReturnDetailDto>(deliveryReturn);
    }

    public async Task<DeliveryReturnDetailDto> CreateAsync(CreateDeliveryReturnDto dto, Guid userId, CancellationToken cancellationToken = default)
    {
        var deliveryReturn = new DeliveryReturn
        {
            Id = Guid.NewGuid(),
            ReturnDate = DateTime.SpecifyKind(dto.ReturnDate, DateTimeKind.Utc),
            DeliveryNo = dto.DeliveryNo,
            DeliveredDate = DateTime.SpecifyKind(dto.DeliveredDate, DateTimeKind.Utc),
            OutletId = dto.OutletId,
            Reason = dto.Reason,
            Status = DeliveryReturnStatus.Draft,
            CreatedById = userId,
            CreatedAt = DateTime.UtcNow,
            UpdatedAt = DateTime.UtcNow
        };

        foreach (var itemDto in dto.Items)
        {
            var item = new DeliveryReturnItem
            {
                Id = Guid.NewGuid(),
                DeliveryReturnId = deliveryReturn.Id,
                ProductId = itemDto.ProductId,
                Quantity = itemDto.Quantity,
                CreatedAt = DateTime.UtcNow,
                UpdatedAt = DateTime.UtcNow
            };
            deliveryReturn.Items.Add(item);
        }

        deliveryReturn.TotalItems = deliveryReturn.Items.Count;

        _context.DeliveryReturns.Add(deliveryReturn);
        await _context.SaveChangesAsync(cancellationToken);

        return await GetByIdAsync(deliveryReturn.Id, cancellationToken) 
            ?? throw new InvalidOperationException("Failed to retrieve created delivery return");
    }

    public async Task<DeliveryReturnDetailDto?> UpdateAsync(Guid id, UpdateDeliveryReturnDto dto, Guid userId, CancellationToken cancellationToken = default)
    {
        var deliveryReturn = await _context.DeliveryReturns
            .Include(dr => dr.Items)
            .FirstOrDefaultAsync(dr => dr.Id == id, cancellationToken);

        if (deliveryReturn == null)
            return null;

        if (deliveryReturn.Status != DeliveryReturnStatus.Draft)
            throw new InvalidOperationException("Only draft delivery returns can be updated");

        deliveryReturn.ReturnDate = DateTime.SpecifyKind(dto.ReturnDate, DateTimeKind.Utc);
        deliveryReturn.DeliveryNo = dto.DeliveryNo;
        deliveryReturn.DeliveredDate = DateTime.SpecifyKind(dto.DeliveredDate, DateTimeKind.Utc);
        deliveryReturn.OutletId = dto.OutletId;
        deliveryReturn.Reason = dto.Reason;
        deliveryReturn.UpdatedById = userId;
        deliveryReturn.UpdatedAt = DateTime.UtcNow;

        _context.DeliveryReturnItems.RemoveRange(deliveryReturn.Items);

        foreach (var itemDto in dto.Items)
        {
            var item = new DeliveryReturnItem
            {
                Id = itemDto.Id ?? Guid.NewGuid(),
                DeliveryReturnId = deliveryReturn.Id,
                ProductId = itemDto.ProductId,
                Quantity = itemDto.Quantity,
                CreatedAt = DateTime.UtcNow,
                UpdatedAt = DateTime.UtcNow
            };
            deliveryReturn.Items.Add(item);
        }

        deliveryReturn.TotalItems = deliveryReturn.Items.Count;

        await _context.SaveChangesAsync(cancellationToken);

        return await GetByIdAsync(id, cancellationToken);
    }

    public async Task<bool> DeleteAsync(Guid id, CancellationToken cancellationToken = default)
    {
        var deliveryReturn = await _context.DeliveryReturns
            .FirstOrDefaultAsync(dr => dr.Id == id, cancellationToken);

        if (deliveryReturn == null)
            return false;

        if (deliveryReturn.Status != DeliveryReturnStatus.Draft)
            throw new InvalidOperationException("Only draft delivery returns can be deleted");

        deliveryReturn.IsActive = false;
        deliveryReturn.UpdatedAt = DateTime.UtcNow;

        await _context.SaveChangesAsync(cancellationToken);

        return true;
    }

    public async Task<DeliveryReturnDetailDto?> SubmitAsync(Guid id, Guid userId, CancellationToken cancellationToken = default)
    {
        var deliveryReturn = await _context.DeliveryReturns
            .FirstOrDefaultAsync(dr => dr.Id == id, cancellationToken);

        if (deliveryReturn == null)
            return null;

        if (deliveryReturn.Status != DeliveryReturnStatus.Draft)
            throw new InvalidOperationException("Only draft delivery returns can be submitted");

        deliveryReturn.Status = DeliveryReturnStatus.Pending;
        deliveryReturn.UpdatedById = userId;
        deliveryReturn.UpdatedAt = DateTime.UtcNow;

        await _context.SaveChangesAsync(cancellationToken);

        return await GetByIdAsync(id, cancellationToken);
    }

    public async Task<DeliveryReturnDetailDto?> ApproveAsync(Guid id, Guid userId, CancellationToken cancellationToken = default)
    {
        var deliveryReturn = await _context.DeliveryReturns
            .FirstOrDefaultAsync(dr => dr.Id == id, cancellationToken);

        if (deliveryReturn == null)
            return null;

        if (deliveryReturn.Status != DeliveryReturnStatus.Pending)
            throw new InvalidOperationException("Only pending delivery returns can be approved");

        deliveryReturn.Status = DeliveryReturnStatus.Approved;
        deliveryReturn.ApprovedById = userId;
        deliveryReturn.ApprovedDate = DateTime.UtcNow;
        deliveryReturn.UpdatedById = userId;
        deliveryReturn.UpdatedAt = DateTime.UtcNow;

        await _context.SaveChangesAsync(cancellationToken);

        return await GetByIdAsync(id, cancellationToken);
    }

    public async Task<DeliveryReturnDetailDto?> RejectAsync(Guid id, Guid userId, CancellationToken cancellationToken = default)
    {
        var deliveryReturn = await _context.DeliveryReturns
            .FirstOrDefaultAsync(dr => dr.Id == id, cancellationToken);

        if (deliveryReturn == null)
            return null;

        if (deliveryReturn.Status != DeliveryReturnStatus.Pending)
            throw new InvalidOperationException("Only pending delivery returns can be rejected");

        deliveryReturn.Status = DeliveryReturnStatus.Draft;
        deliveryReturn.UpdatedById = userId;
        deliveryReturn.UpdatedAt = DateTime.UtcNow;

        await _context.SaveChangesAsync(cancellationToken);

        return await GetByIdAsync(id, cancellationToken);
    }
}
