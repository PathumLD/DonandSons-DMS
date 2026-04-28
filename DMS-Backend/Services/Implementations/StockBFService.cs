using Microsoft.EntityFrameworkCore;
using AutoMapper;
using DMS_Backend.Data;
using DMS_Backend.Models.Entities;
using DMS_Backend.Models.DTOs.StockBF;
using DMS_Backend.Services.Interfaces;

namespace DMS_Backend.Services.Implementations;

public class StockBFService : IStockBFService
{
    private readonly ApplicationDbContext _context;
    private readonly IMapper _mapper;

    private static DateTime EnsureUtc(DateTime dt)
    {
        return dt.Kind switch
        {
            DateTimeKind.Utc => dt,
            DateTimeKind.Local => dt.ToUniversalTime(),
            _ => DateTime.SpecifyKind(dt, DateTimeKind.Utc),
        };
    }

    private static void ValidateBfDateRules(DateTime bfDateUtc, bool relaxedBfDateRules)
    {
        if (relaxedBfDateRules)
            return;

        var utcDate = EnsureUtc(bfDateUtc).Date;
        var today = DateTime.UtcNow.Date;
        if (utcDate > today)
            throw new ArgumentException("BF date cannot be in the future.");
        if (utcDate < today.AddDays(-3))
            throw new ArgumentException("BF date cannot be more than 3 days in the past.");
    }

    public StockBFService(ApplicationDbContext context, IMapper mapper)
    {
        _context = context;
        _mapper = mapper;
    }

    public async Task<(List<StockBFListDto> StockBFs, int TotalCount)> GetAllAsync(
        int page, int pageSize, DateTime? fromDate, DateTime? toDate,
        Guid? outletId, Guid? productId, string? status,
        Guid requestingUserId,
        bool viewAllRecords,
        bool showPreviousRecords,
        CancellationToken cancellationToken = default)
    {
        var query = _context.StockBFs
            .Include(s => s.Outlet)
            .Include(s => s.Product)
            .Include(s => s.UpdatedBy)
            .Include(s => s.ApprovedBy)
            .Include(s => s.RejectedBy)
            .Where(s => s.IsActive)
            .AsQueryable();

        if (!viewAllRecords)
        {
            query = query.Where(s => s.CreatedById == requestingUserId);
            if (!showPreviousRecords)
            {
                var minBfDate = DateTime.UtcNow.Date.AddDays(-3);
                query = query.Where(s => s.BFDate >= minBfDate);
            }
        }

        if (fromDate.HasValue)
            query = query.Where(s => s.BFDate >= EnsureUtc(fromDate.Value));

        if (toDate.HasValue)
            query = query.Where(s => s.BFDate <= EnsureUtc(toDate.Value));

        if (outletId.HasValue)
            query = query.Where(s => s.OutletId == outletId.Value);

        if (productId.HasValue)
            query = query.Where(s => s.ProductId == productId.Value);

        if (!string.IsNullOrWhiteSpace(status) && Enum.TryParse<StockBFStatus>(status, true, out var statusEnum))
            query = query.Where(s => s.Status == statusEnum);

        var totalCount = await query.CountAsync(cancellationToken);

        var stockBFs = await query
            .OrderByDescending(s => s.BFDate)
            .ThenByDescending(s => s.CreatedAt)
            .Skip((page - 1) * pageSize)
            .Take(pageSize)
            .ToListAsync(cancellationToken);

        return (_mapper.Map<List<StockBFListDto>>(stockBFs), totalCount);
    }

    public async Task<StockBFDetailDto?> GetByIdAsync(
        Guid id,
        Guid requestingUserId,
        bool viewAllRecords,
        CancellationToken cancellationToken = default,
        bool ignoreOwnership = false)
    {
        var stockBF = await _context.StockBFs
            .Include(s => s.Outlet)
            .Include(s => s.Product)
            .Include(s => s.CreatedBy)
            .Include(s => s.UpdatedBy)
            .Include(s => s.ApprovedBy)
            .Include(s => s.RejectedBy)
            .FirstOrDefaultAsync(s => s.Id == id && s.IsActive, cancellationToken);

        if (stockBF == null)
            return null;

        if (!ignoreOwnership && !viewAllRecords && stockBF.CreatedById != requestingUserId)
            return null;

        return _mapper.Map<StockBFDetailDto>(stockBF);
    }

    public async Task<StockBFDetailDto?> GetByBFNoAsync(string bfNo, CancellationToken cancellationToken = default)
    {
        var stockBF = await _context.StockBFs
            .Include(s => s.Outlet)
            .Include(s => s.Product)
            .Include(s => s.CreatedBy)
            .Include(s => s.UpdatedBy)
            .Include(s => s.ApprovedBy)
            .Include(s => s.RejectedBy)
            .FirstOrDefaultAsync(s => s.BFNo == bfNo && s.IsActive, cancellationToken);

        if (stockBF == null)
            return null;

        return _mapper.Map<StockBFDetailDto>(stockBF);
    }

    public async Task<StockBFDetailDto> CreateAsync(
        CreateStockBFDto dto,
        Guid userId,
        bool relaxedBfDateRules,
        CancellationToken cancellationToken = default)
    {
        var bfDateUtc = EnsureUtc(dto.BFDate);
        ValidateBfDateRules(bfDateUtc, relaxedBfDateRules);

        var existing = await _context.StockBFs
            .FirstOrDefaultAsync(s => s.OutletId == dto.OutletId &&
                                     s.BFDate == bfDateUtc &&
                                     s.ProductId == dto.ProductId &&
                                     s.IsActive,
                                cancellationToken);

        if (existing != null)
            throw new InvalidOperationException("Stock BF already exists for this outlet, date, and product combination");

        var stockBF = new StockBF
        {
            Id = Guid.NewGuid(),
            BFDate = bfDateUtc,
            OutletId = dto.OutletId,
            ProductId = dto.ProductId,
            Quantity = dto.Quantity,
            Status = StockBFStatus.Pending,
            CreatedById = userId,
            CreatedAt = DateTime.UtcNow,
            UpdatedAt = DateTime.UtcNow
        };

        _context.StockBFs.Add(stockBF);
        await _context.SaveChangesAsync(cancellationToken);

        return await GetByIdAsync(stockBF.Id, userId, viewAllRecords: false, cancellationToken)
            ?? throw new InvalidOperationException("Failed to retrieve created stock BF");
    }

    public async Task<List<StockBFDetailDto>> CreateBulkAsync(
        CreateBulkStockBFDto dto,
        Guid userId,
        bool relaxedBfDateRules,
        CancellationToken cancellationToken = default)
    {
        if (dto.Items == null || dto.Items.Count == 0)
            throw new ArgumentException("At least one item is required");

        var bfDateUtc = EnsureUtc(dto.BFDate);
        ValidateBfDateRules(bfDateUtc, relaxedBfDateRules);

        // Check for duplicates within the request
        var duplicateProducts = dto.Items
            .GroupBy(i => i.ProductId)
            .Where(g => g.Count() > 1)
            .Select(g => g.Key)
            .ToList();

        if (duplicateProducts.Any())
            throw new ArgumentException("Duplicate products found in the request");

        // Check for existing records
        var productIds = dto.Items.Select(i => i.ProductId).ToList();
        var existingRecords = await _context.StockBFs
            .Where(s => s.OutletId == dto.OutletId &&
                       s.BFDate == bfDateUtc &&
                       productIds.Contains(s.ProductId) &&
                       s.IsActive)
            .Select(s => s.ProductId)
            .ToListAsync(cancellationToken);

        if (existingRecords.Any())
        {
            var existingProductNames = await _context.Products
                .Where(p => existingRecords.Contains(p.Id))
                .Select(p => p.Name)
                .ToListAsync(cancellationToken);

            throw new InvalidOperationException(
                $"Stock BF already exists for: {string.Join(", ", existingProductNames)}");
        }

        var now = DateTime.UtcNow;
        var createdIds = new List<Guid>();

        foreach (var item in dto.Items)
        {
            var stockBF = new StockBF
            {
                Id = Guid.NewGuid(),
                BFDate = bfDateUtc,
                OutletId = dto.OutletId,
                ProductId = item.ProductId,
                Quantity = item.Quantity,
                Status = StockBFStatus.Pending,
                CreatedById = userId,
                CreatedAt = now,
                UpdatedAt = now
            };

            _context.StockBFs.Add(stockBF);
            createdIds.Add(stockBF.Id);
        }

        await _context.SaveChangesAsync(cancellationToken);

        // Retrieve all created records
        var createdRecords = await _context.StockBFs
            .Include(s => s.Outlet)
            .Include(s => s.Product)
            .Include(s => s.CreatedBy)
            .Include(s => s.UpdatedBy)
            .Include(s => s.ApprovedBy)
            .Include(s => s.RejectedBy)
            .Where(s => createdIds.Contains(s.Id))
            .ToListAsync(cancellationToken);

        return _mapper.Map<List<StockBFDetailDto>>(createdRecords);
    }

    public async Task<StockBFDetailDto?> UpdateAsync(
        Guid id,
        UpdateStockBFDto dto,
        Guid userId,
        bool viewAllRecords,
        bool relaxedBfDateRules,
        CancellationToken cancellationToken = default)
    {
        var stockBF = await _context.StockBFs
            .FirstOrDefaultAsync(s => s.Id == id && s.IsActive, cancellationToken);

        if (stockBF == null)
            return null;

        if (!viewAllRecords && stockBF.CreatedById != userId)
            return null;

        if (stockBF.Status != StockBFStatus.Pending)
            throw new InvalidOperationException("Only pending Stock BF records can be updated");

        var bfDateUtc = EnsureUtc(dto.BFDate);
        ValidateBfDateRules(bfDateUtc, relaxedBfDateRules);

        var existing = await _context.StockBFs
            .FirstOrDefaultAsync(s => s.Id != id &&
                                     s.OutletId == dto.OutletId &&
                                     s.BFDate == bfDateUtc &&
                                     s.ProductId == dto.ProductId &&
                                     s.IsActive,
                                cancellationToken);

        if (existing != null)
            throw new InvalidOperationException("Stock BF already exists for this outlet, date, and product combination");

        stockBF.BFDate = bfDateUtc;
        stockBF.OutletId = dto.OutletId;
        stockBF.ProductId = dto.ProductId;
        stockBF.Quantity = dto.Quantity;
        stockBF.UpdatedById = userId;
        stockBF.UpdatedAt = DateTime.UtcNow;

        await _context.SaveChangesAsync(cancellationToken);

        return await GetByIdAsync(id, userId, viewAllRecords, cancellationToken);
    }

    public async Task<StockBFDetailDto?> ApproveAsync(Guid id, Guid approverUserId, CancellationToken cancellationToken = default)
    {
        var stockBF = await _context.StockBFs
            .FirstOrDefaultAsync(s => s.Id == id && s.IsActive, cancellationToken);

        if (stockBF == null)
            return null;

        if (stockBF.Status != StockBFStatus.Pending)
            throw new InvalidOperationException("Only pending Stock BF records can be approved");

        stockBF.Status = StockBFStatus.Approved;
        stockBF.ApprovedById = approverUserId;
        stockBF.ApprovedDate = DateTime.UtcNow;
        stockBF.RejectedById = null;
        stockBF.RejectedDate = null;
        stockBF.UpdatedById = approverUserId;
        stockBF.UpdatedAt = DateTime.UtcNow;

        await _context.SaveChangesAsync(cancellationToken);

        return await GetByIdAsync(id, approverUserId, viewAllRecords: false, cancellationToken, ignoreOwnership: true);
    }

    public async Task<StockBFDetailDto?> RejectAsync(Guid id, Guid rejectorUserId, CancellationToken cancellationToken = default)
    {
        var stockBF = await _context.StockBFs
            .FirstOrDefaultAsync(s => s.Id == id && s.IsActive, cancellationToken);

        if (stockBF == null)
            return null;

        if (stockBF.Status != StockBFStatus.Pending)
            throw new InvalidOperationException("Only pending Stock BF records can be rejected");

        stockBF.Status = StockBFStatus.Rejected;
        stockBF.RejectedById = rejectorUserId;
        stockBF.RejectedDate = DateTime.UtcNow;
        stockBF.ApprovedById = null;
        stockBF.ApprovedDate = null;
        stockBF.UpdatedById = rejectorUserId;
        stockBF.UpdatedAt = DateTime.UtcNow;

        await _context.SaveChangesAsync(cancellationToken);

        return await GetByIdAsync(id, rejectorUserId, viewAllRecords: false, cancellationToken, ignoreOwnership: true);
    }

    public async Task<bool> DeleteAsync(
        Guid id,
        Guid requestingUserId,
        bool viewAllRecords,
        CancellationToken cancellationToken = default)
    {
        var stockBF = await _context.StockBFs
            .FirstOrDefaultAsync(s => s.Id == id && s.IsActive, cancellationToken);

        if (stockBF == null)
            return false;

        if (!viewAllRecords && stockBF.CreatedById != requestingUserId)
            return false;

        if (stockBF.Status != StockBFStatus.Pending)
            throw new InvalidOperationException("Only pending Stock BF records can be deleted");

        stockBF.IsActive = false;
        stockBF.UpdatedAt = DateTime.UtcNow;

        await _context.SaveChangesAsync(cancellationToken);

        return true;
    }
}
