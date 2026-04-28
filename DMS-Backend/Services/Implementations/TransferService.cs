using Microsoft.EntityFrameworkCore;
using AutoMapper;
using DMS_Backend.Data;
using DMS_Backend.Models.Entities;
using DMS_Backend.Models.DTOs.Transfers;
using DMS_Backend.Services.Interfaces;

namespace DMS_Backend.Services.Implementations;

public class TransferService : ITransferService
{
    private readonly ApplicationDbContext _context;
    private readonly IMapper _mapper;

    public TransferService(ApplicationDbContext context, IMapper mapper)
    {
        _context = context;
        _mapper = mapper;
    }

    public async Task<(List<TransferListDto> Transfers, int TotalCount)> GetAllAsync(
        int page, int pageSize, DateTime? fromDate, DateTime? toDate,
        Guid? fromOutletId, Guid? toOutletId, string? status, CancellationToken cancellationToken = default)
    {
        var query = _context.Transfers
            .Include(t => t.FromOutlet)
            .Include(t => t.ToOutlet)
            .Include(t => t.CreatedBy)
            .Include(t => t.ApprovedBy)
            .AsQueryable();

        if (fromDate.HasValue)
            query = query.Where(t => t.TransferDate >= fromDate.Value);

        if (toDate.HasValue)
            query = query.Where(t => t.TransferDate <= toDate.Value);

        if (fromOutletId.HasValue)
            query = query.Where(t => t.FromOutletId == fromOutletId.Value);

        if (toOutletId.HasValue)
            query = query.Where(t => t.ToOutletId == toOutletId.Value);

        if (!string.IsNullOrWhiteSpace(status) && Enum.TryParse<TransferStatus>(status, true, out var statusEnum))
            query = query.Where(t => t.Status == statusEnum);

        var totalCount = await query.CountAsync(cancellationToken);

        var transfers = await query
            .OrderByDescending(t => t.TransferDate)
            .ThenByDescending(t => t.CreatedAt)
            .Skip((page - 1) * pageSize)
            .Take(pageSize)
            .ToListAsync(cancellationToken);

        return (_mapper.Map<List<TransferListDto>>(transfers), totalCount);
    }

    public async Task<TransferDetailDto?> GetByIdAsync(Guid id, CancellationToken cancellationToken = default)
    {
        var transfer = await _context.Transfers
            .Include(t => t.FromOutlet)
            .Include(t => t.ToOutlet)
            .Include(t => t.CreatedBy)
            .Include(t => t.ApprovedBy)
            .Include(t => t.Items)
                .ThenInclude(i => i.Product)
            .FirstOrDefaultAsync(t => t.Id == id, cancellationToken);

        if (transfer == null)
            return null;

        return _mapper.Map<TransferDetailDto>(transfer);
    }

    public async Task<TransferDetailDto?> GetByTransferNoAsync(string transferNo, CancellationToken cancellationToken = default)
    {
        var transfer = await _context.Transfers
            .Include(t => t.FromOutlet)
            .Include(t => t.ToOutlet)
            .Include(t => t.CreatedBy)
            .Include(t => t.ApprovedBy)
            .Include(t => t.Items)
                .ThenInclude(i => i.Product)
            .FirstOrDefaultAsync(t => t.TransferNo == transferNo, cancellationToken);

        if (transfer == null)
            return null;

        return _mapper.Map<TransferDetailDto>(transfer);
    }

    public async Task<TransferDetailDto> CreateAsync(CreateTransferDto dto, Guid userId, CancellationToken cancellationToken = default)
    {
        if (dto.FromOutletId == dto.ToOutletId)
            throw new InvalidOperationException("From outlet and To outlet must be different");

        var transfer = new Transfer
        {
            Id = Guid.NewGuid(),
            TransferDate = DateTime.SpecifyKind(dto.TransferDate, DateTimeKind.Utc),
            FromOutletId = dto.FromOutletId,
            ToOutletId = dto.ToOutletId,
            Status = TransferStatus.Draft,
            Notes = dto.Notes,
            CreatedById = userId,
            CreatedAt = DateTime.UtcNow,
            UpdatedAt = DateTime.UtcNow
        };

        foreach (var itemDto in dto.Items)
        {
            var item = new TransferItem
            {
                Id = Guid.NewGuid(),
                TransferId = transfer.Id,
                ProductId = itemDto.ProductId,
                Quantity = itemDto.Quantity,
                CreatedAt = DateTime.UtcNow,
                UpdatedAt = DateTime.UtcNow
            };
            transfer.Items.Add(item);
        }

        transfer.TotalItems = transfer.Items.Count;

        _context.Transfers.Add(transfer);
        await _context.SaveChangesAsync(cancellationToken);

        return await GetByIdAsync(transfer.Id, cancellationToken) 
            ?? throw new InvalidOperationException("Failed to retrieve created transfer");
    }

    public async Task<TransferDetailDto?> UpdateAsync(Guid id, UpdateTransferDto dto, Guid userId, CancellationToken cancellationToken = default)
    {
        var transfer = await _context.Transfers
            .Include(t => t.Items)
            .FirstOrDefaultAsync(t => t.Id == id, cancellationToken);

        if (transfer == null)
            return null;

        if (transfer.Status != TransferStatus.Draft)
            throw new InvalidOperationException("Only draft transfers can be updated");

        if (dto.FromOutletId == dto.ToOutletId)
            throw new InvalidOperationException("From outlet and To outlet must be different");

        transfer.TransferDate = DateTime.SpecifyKind(dto.TransferDate, DateTimeKind.Utc);
        transfer.FromOutletId = dto.FromOutletId;
        transfer.ToOutletId = dto.ToOutletId;
        transfer.Notes = dto.Notes;
        transfer.UpdatedById = userId;
        transfer.UpdatedAt = DateTime.UtcNow;

        _context.TransferItems.RemoveRange(transfer.Items);

        foreach (var itemDto in dto.Items)
        {
            var item = new TransferItem
            {
                Id = itemDto.Id ?? Guid.NewGuid(),
                TransferId = transfer.Id,
                ProductId = itemDto.ProductId,
                Quantity = itemDto.Quantity,
                CreatedAt = DateTime.UtcNow,
                UpdatedAt = DateTime.UtcNow
            };
            transfer.Items.Add(item);
        }

        transfer.TotalItems = transfer.Items.Count;

        await _context.SaveChangesAsync(cancellationToken);

        return await GetByIdAsync(id, cancellationToken);
    }

    public async Task<bool> DeleteAsync(Guid id, CancellationToken cancellationToken = default)
    {
        var transfer = await _context.Transfers
            .FirstOrDefaultAsync(t => t.Id == id, cancellationToken);

        if (transfer == null)
            return false;

        if (transfer.Status != TransferStatus.Draft)
            throw new InvalidOperationException("Only draft transfers can be deleted");

        transfer.IsActive = false;
        transfer.UpdatedAt = DateTime.UtcNow;

        await _context.SaveChangesAsync(cancellationToken);

        return true;
    }

    public async Task<TransferDetailDto?> SubmitAsync(Guid id, Guid userId, CancellationToken cancellationToken = default)
    {
        var transfer = await _context.Transfers
            .FirstOrDefaultAsync(t => t.Id == id, cancellationToken);

        if (transfer == null)
            return null;

        if (transfer.Status != TransferStatus.Draft)
            throw new InvalidOperationException("Only draft transfers can be submitted");

        transfer.Status = TransferStatus.Pending;
        transfer.UpdatedById = userId;
        transfer.UpdatedAt = DateTime.UtcNow;

        await _context.SaveChangesAsync(cancellationToken);

        return await GetByIdAsync(id, cancellationToken);
    }

    public async Task<TransferDetailDto?> ApproveAsync(Guid id, Guid userId, CancellationToken cancellationToken = default)
    {
        var transfer = await _context.Transfers
            .FirstOrDefaultAsync(t => t.Id == id, cancellationToken);

        if (transfer == null)
            return null;

        if (transfer.Status != TransferStatus.Pending)
            throw new InvalidOperationException("Only pending transfers can be approved");

        transfer.Status = TransferStatus.Approved;
        transfer.ApprovedById = userId;
        transfer.ApprovedDate = DateTime.UtcNow;
        transfer.UpdatedById = userId;
        transfer.UpdatedAt = DateTime.UtcNow;

        await _context.SaveChangesAsync(cancellationToken);

        return await GetByIdAsync(id, cancellationToken);
    }

    public async Task<TransferDetailDto?> RejectAsync(Guid id, Guid userId, CancellationToken cancellationToken = default)
    {
        var transfer = await _context.Transfers
            .FirstOrDefaultAsync(t => t.Id == id, cancellationToken);

        if (transfer == null)
            return null;

        if (transfer.Status != TransferStatus.Pending)
            throw new InvalidOperationException("Only pending transfers can be rejected");

        transfer.Status = TransferStatus.Rejected;
        transfer.UpdatedById = userId;
        transfer.UpdatedAt = DateTime.UtcNow;

        await _context.SaveChangesAsync(cancellationToken);

        return await GetByIdAsync(id, cancellationToken);
    }
}
