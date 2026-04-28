using Microsoft.EntityFrameworkCore;
using AutoMapper;
using DMS_Backend.Data;
using DMS_Backend.Models.Entities;
using DMS_Backend.Models.DTOs.Deliveries;
using DMS_Backend.Services.Interfaces;

namespace DMS_Backend.Services.Implementations;

public class DeliveryService : IDeliveryService
{
    private readonly ApplicationDbContext _context;
    private readonly IMapper _mapper;

    public DeliveryService(ApplicationDbContext context, IMapper mapper)
    {
        _context = context;
        _mapper = mapper;
    }

    public async Task<(List<DeliveryListDto> Deliveries, int TotalCount)> GetAllAsync(
        int page, int pageSize, DateTime? fromDate, DateTime? toDate,
        Guid? outletId, string? status, CancellationToken cancellationToken = default)
    {
        var query = _context.Deliveries
            .Include(d => d.Outlet)
            .Include(d => d.CreatedBy)
            .Include(d => d.ApprovedBy)
            .AsQueryable();

        if (fromDate.HasValue)
            query = query.Where(d => d.DeliveryDate >= fromDate.Value);

        if (toDate.HasValue)
            query = query.Where(d => d.DeliveryDate <= toDate.Value);

        if (outletId.HasValue)
            query = query.Where(d => d.OutletId == outletId.Value);

        if (!string.IsNullOrWhiteSpace(status) && Enum.TryParse<DeliveryStatus>(status, true, out var statusEnum))
            query = query.Where(d => d.Status == statusEnum);

        var totalCount = await query.CountAsync(cancellationToken);

        var deliveries = await query
            .OrderByDescending(d => d.DeliveryDate)
            .ThenByDescending(d => d.CreatedAt)
            .Skip((page - 1) * pageSize)
            .Take(pageSize)
            .ToListAsync(cancellationToken);

        return (_mapper.Map<List<DeliveryListDto>>(deliveries), totalCount);
    }

    public async Task<DeliveryDetailDto?> GetByIdAsync(Guid id, CancellationToken cancellationToken = default)
    {
        var delivery = await _context.Deliveries
            .Include(d => d.Outlet)
            .Include(d => d.CreatedBy)
            .Include(d => d.ApprovedBy)
            .Include(d => d.Items)
                .ThenInclude(i => i.Product)
            .FirstOrDefaultAsync(d => d.Id == id, cancellationToken);

        if (delivery == null)
            return null;

        return _mapper.Map<DeliveryDetailDto>(delivery);
    }

    public async Task<DeliveryDetailDto?> GetByDeliveryNoAsync(string deliveryNo, CancellationToken cancellationToken = default)
    {
        var delivery = await _context.Deliveries
            .Include(d => d.Outlet)
            .Include(d => d.ApprovedBy)
            .Include(d => d.Items)
                .ThenInclude(i => i.Product)
            .FirstOrDefaultAsync(d => d.DeliveryNo == deliveryNo, cancellationToken);

        if (delivery == null)
            return null;

        return _mapper.Map<DeliveryDetailDto>(delivery);
    }

    public async Task<DeliveryDetailDto> CreateAsync(CreateDeliveryDto dto, Guid userId, CancellationToken cancellationToken = default)
    {
        var delivery = new Delivery
        {
            Id = Guid.NewGuid(),
            DeliveryDate = DateTime.SpecifyKind(dto.DeliveryDate, DateTimeKind.Utc),
            OutletId = dto.OutletId,
            Status = DeliveryStatus.Draft,
            Notes = dto.Notes,
            CreatedById = userId,
            CreatedAt = DateTime.UtcNow,
            UpdatedAt = DateTime.UtcNow
        };

        foreach (var itemDto in dto.Items)
        {
            var item = new DeliveryItem
            {
                Id = Guid.NewGuid(),
                DeliveryId = delivery.Id,
                ProductId = itemDto.ProductId,
                Quantity = itemDto.Quantity,
                UnitPrice = itemDto.UnitPrice,
                Total = itemDto.Quantity * itemDto.UnitPrice,
                CreatedAt = DateTime.UtcNow,
                UpdatedAt = DateTime.UtcNow
            };
            delivery.Items.Add(item);
        }

        delivery.TotalItems = delivery.Items.Count;
        delivery.TotalValue = delivery.Items.Sum(i => i.Total);

        _context.Deliveries.Add(delivery);
        await _context.SaveChangesAsync(cancellationToken);

        return await GetByIdAsync(delivery.Id, cancellationToken) 
            ?? throw new InvalidOperationException("Failed to retrieve created delivery");
    }

    public async Task<DeliveryDetailDto?> UpdateAsync(Guid id, UpdateDeliveryDto dto, Guid userId, CancellationToken cancellationToken = default)
    {
        var delivery = await _context.Deliveries
            .Include(d => d.Items)
            .FirstOrDefaultAsync(d => d.Id == id, cancellationToken);

        if (delivery == null)
            return null;

        if (delivery.Status != DeliveryStatus.Draft)
            throw new InvalidOperationException("Only draft deliveries can be updated");

        delivery.DeliveryDate = DateTime.SpecifyKind(dto.DeliveryDate, DateTimeKind.Utc);
        delivery.OutletId = dto.OutletId;
        delivery.Notes = dto.Notes;
        delivery.UpdatedById = userId;
        delivery.UpdatedAt = DateTime.UtcNow;

        _context.DeliveryItems.RemoveRange(delivery.Items);

        foreach (var itemDto in dto.Items)
        {
            var item = new DeliveryItem
            {
                Id = itemDto.Id ?? Guid.NewGuid(),
                DeliveryId = delivery.Id,
                ProductId = itemDto.ProductId,
                Quantity = itemDto.Quantity,
                UnitPrice = itemDto.UnitPrice,
                Total = itemDto.Quantity * itemDto.UnitPrice,
                CreatedAt = DateTime.UtcNow,
                UpdatedAt = DateTime.UtcNow
            };
            delivery.Items.Add(item);
        }

        delivery.TotalItems = delivery.Items.Count;
        delivery.TotalValue = delivery.Items.Sum(i => i.Total);

        await _context.SaveChangesAsync(cancellationToken);

        return await GetByIdAsync(id, cancellationToken);
    }

    public async Task<bool> DeleteAsync(Guid id, CancellationToken cancellationToken = default)
    {
        var delivery = await _context.Deliveries
            .FirstOrDefaultAsync(d => d.Id == id, cancellationToken);

        if (delivery == null)
            return false;

        if (delivery.Status != DeliveryStatus.Draft)
            throw new InvalidOperationException("Only draft deliveries can be deleted");

        delivery.IsActive = false;
        delivery.UpdatedAt = DateTime.UtcNow;

        await _context.SaveChangesAsync(cancellationToken);

        return true;
    }

    public async Task<DeliveryDetailDto?> SubmitAsync(Guid id, Guid userId, CancellationToken cancellationToken = default)
    {
        var delivery = await _context.Deliveries
            .FirstOrDefaultAsync(d => d.Id == id, cancellationToken);

        if (delivery == null)
            return null;

        if (delivery.Status != DeliveryStatus.Draft)
            throw new InvalidOperationException("Only draft deliveries can be submitted");

        delivery.Status = DeliveryStatus.Pending;
        delivery.UpdatedById = userId;
        delivery.UpdatedAt = DateTime.UtcNow;

        await _context.SaveChangesAsync(cancellationToken);

        return await GetByIdAsync(id, cancellationToken);
    }

    public async Task<DeliveryDetailDto?> ApproveAsync(Guid id, Guid userId, CancellationToken cancellationToken = default)
    {
        var delivery = await _context.Deliveries
            .FirstOrDefaultAsync(d => d.Id == id, cancellationToken);

        if (delivery == null)
            return null;

        if (delivery.Status != DeliveryStatus.Pending)
            throw new InvalidOperationException("Only pending deliveries can be approved");

        delivery.Status = DeliveryStatus.Approved;
        delivery.ApprovedById = userId;
        delivery.ApprovedDate = DateTime.UtcNow;
        delivery.UpdatedById = userId;
        delivery.UpdatedAt = DateTime.UtcNow;

        await _context.SaveChangesAsync(cancellationToken);

        return await GetByIdAsync(id, cancellationToken);
    }

    public async Task<DeliveryDetailDto?> RejectAsync(Guid id, Guid userId, CancellationToken cancellationToken = default)
    {
        var delivery = await _context.Deliveries
            .FirstOrDefaultAsync(d => d.Id == id, cancellationToken);

        if (delivery == null)
            return null;

        if (delivery.Status != DeliveryStatus.Pending)
            throw new InvalidOperationException("Only pending deliveries can be rejected");

        delivery.Status = DeliveryStatus.Rejected;
        delivery.UpdatedById = userId;
        delivery.UpdatedAt = DateTime.UtcNow;

        await _context.SaveChangesAsync(cancellationToken);

        return await GetByIdAsync(id, cancellationToken);
    }
}
