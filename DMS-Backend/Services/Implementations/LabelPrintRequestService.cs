using Microsoft.EntityFrameworkCore;
using AutoMapper;
using DMS_Backend.Data;
using DMS_Backend.Models.Entities;
using DMS_Backend.Models.DTOs.LabelPrintRequests;
using DMS_Backend.Services.Interfaces;

namespace DMS_Backend.Services.Implementations;

public class LabelPrintRequestService : ILabelPrintRequestService
{
    private readonly ApplicationDbContext _context;
    private readonly IMapper _mapper;

    public LabelPrintRequestService(ApplicationDbContext context, IMapper mapper)
    {
        _context = context;
        _mapper = mapper;
    }

    public async Task<(List<LabelPrintRequestListDto> LabelPrintRequests, int TotalCount)> GetAllAsync(
        int page, int pageSize, DateTime? fromDate, DateTime? toDate,
        Guid? productId, string? status, CancellationToken cancellationToken = default)
    {
        var query = _context.LabelPrintRequests
            .Include(l => l.Product)
            .Include(l => l.UpdatedBy)
            .Include(l => l.ApprovedBy)
            .AsQueryable();

        if (fromDate.HasValue)
            query = query.Where(l => l.Date >= fromDate.Value);

        if (toDate.HasValue)
            query = query.Where(l => l.Date <= toDate.Value);

        if (productId.HasValue)
            query = query.Where(l => l.ProductId == productId.Value);

        if (!string.IsNullOrWhiteSpace(status) && Enum.TryParse<LabelPrintStatus>(status, true, out var statusEnum))
            query = query.Where(l => l.Status == statusEnum);

        var totalCount = await query.CountAsync(cancellationToken);

        var labelPrintRequests = await query
            .OrderByDescending(l => l.Date)
            .ThenByDescending(l => l.CreatedAt)
            .Skip((page - 1) * pageSize)
            .Take(pageSize)
            .ToListAsync(cancellationToken);

        return (_mapper.Map<List<LabelPrintRequestListDto>>(labelPrintRequests), totalCount);
    }

    public async Task<LabelPrintRequestDetailDto?> GetByIdAsync(Guid id, CancellationToken cancellationToken = default)
    {
        var labelPrintRequest = await _context.LabelPrintRequests
            .Include(l => l.Product)
            .Include(l => l.ApprovedBy)
            .FirstOrDefaultAsync(l => l.Id == id, cancellationToken);

        if (labelPrintRequest == null)
            return null;

        return _mapper.Map<LabelPrintRequestDetailDto>(labelPrintRequest);
    }

    public async Task<LabelPrintRequestDetailDto?> GetByDisplayNoAsync(string displayNo, CancellationToken cancellationToken = default)
    {
        var labelPrintRequest = await _context.LabelPrintRequests
            .Include(l => l.Product)
            .Include(l => l.ApprovedBy)
            .FirstOrDefaultAsync(l => l.DisplayNo == displayNo, cancellationToken);

        if (labelPrintRequest == null)
            return null;

        return _mapper.Map<LabelPrintRequestDetailDto>(labelPrintRequest);
    }

    public async Task<LabelPrintRequestDetailDto> CreateAsync(CreateLabelPrintRequestDto dto, Guid userId, CancellationToken cancellationToken = default)
    {
        var product = await _context.Products
            .FirstOrDefaultAsync(p => p.Id == dto.ProductId, cancellationToken);

        if (product == null)
            throw new InvalidOperationException("Product not found");

        if (!product.EnableLabelPrint)
            throw new InvalidOperationException("Label printing is not enabled for this product");

        var labelPrintRequest = new LabelPrintRequest
        {
            Id = Guid.NewGuid(),
            Date = DateTime.SpecifyKind(dto.Date, DateTimeKind.Utc),
            ProductId = dto.ProductId,
            LabelCount = dto.LabelCount,
            StartDate = DateTime.SpecifyKind(dto.StartDate, DateTimeKind.Utc),
            ExpiryDays = dto.ExpiryDays,
            PriceOverride = dto.PriceOverride,
            Status = LabelPrintStatus.Pending,
            CreatedById = userId,
            CreatedAt = DateTime.UtcNow,
            UpdatedAt = DateTime.UtcNow
        };

        _context.LabelPrintRequests.Add(labelPrintRequest);
        await _context.SaveChangesAsync(cancellationToken);

        return await GetByIdAsync(labelPrintRequest.Id, cancellationToken) 
            ?? throw new InvalidOperationException("Failed to retrieve created label print request");
    }

    public async Task<LabelPrintRequestDetailDto?> UpdateAsync(Guid id, UpdateLabelPrintRequestDto dto, Guid userId, CancellationToken cancellationToken = default)
    {
        var labelPrintRequest = await _context.LabelPrintRequests
            .FirstOrDefaultAsync(l => l.Id == id, cancellationToken);

        if (labelPrintRequest == null)
            return null;

        if (labelPrintRequest.Status != LabelPrintStatus.Pending)
            throw new InvalidOperationException("Only pending label print requests can be updated");

        var product = await _context.Products
            .FirstOrDefaultAsync(p => p.Id == dto.ProductId, cancellationToken);

        if (product == null)
            throw new InvalidOperationException("Product not found");

        if (!product.EnableLabelPrint)
            throw new InvalidOperationException("Label printing is not enabled for this product");

        labelPrintRequest.Date = DateTime.SpecifyKind(dto.Date, DateTimeKind.Utc);
        labelPrintRequest.ProductId = dto.ProductId;
        labelPrintRequest.LabelCount = dto.LabelCount;
        labelPrintRequest.StartDate = DateTime.SpecifyKind(dto.StartDate, DateTimeKind.Utc);
        labelPrintRequest.ExpiryDays = dto.ExpiryDays;
        labelPrintRequest.PriceOverride = dto.PriceOverride;
        labelPrintRequest.UpdatedById = userId;
        labelPrintRequest.UpdatedAt = DateTime.UtcNow;

        await _context.SaveChangesAsync(cancellationToken);

        return await GetByIdAsync(id, cancellationToken);
    }

    public async Task<bool> DeleteAsync(Guid id, CancellationToken cancellationToken = default)
    {
        var labelPrintRequest = await _context.LabelPrintRequests
            .FirstOrDefaultAsync(l => l.Id == id, cancellationToken);

        if (labelPrintRequest == null)
            return false;

        if (labelPrintRequest.Status != LabelPrintStatus.Pending)
            throw new InvalidOperationException("Only pending label print requests can be deleted");

        labelPrintRequest.IsActive = false;
        labelPrintRequest.UpdatedAt = DateTime.UtcNow;

        await _context.SaveChangesAsync(cancellationToken);

        return true;
    }

    public async Task<LabelPrintRequestDetailDto?> ApproveAsync(Guid id, Guid userId, CancellationToken cancellationToken = default)
    {
        var labelPrintRequest = await _context.LabelPrintRequests
            .FirstOrDefaultAsync(l => l.Id == id, cancellationToken);

        if (labelPrintRequest == null)
            return null;

        if (labelPrintRequest.Status != LabelPrintStatus.Pending)
            throw new InvalidOperationException("Only pending label print requests can be approved");

        labelPrintRequest.Status = LabelPrintStatus.Approved;
        labelPrintRequest.ApprovedById = userId;
        labelPrintRequest.ApprovedDate = DateTime.UtcNow;
        labelPrintRequest.UpdatedById = userId;
        labelPrintRequest.UpdatedAt = DateTime.UtcNow;

        await _context.SaveChangesAsync(cancellationToken);

        return await GetByIdAsync(id, cancellationToken);
    }

    public async Task<LabelPrintRequestDetailDto?> RejectAsync(Guid id, Guid userId, CancellationToken cancellationToken = default)
    {
        var labelPrintRequest = await _context.LabelPrintRequests
            .FirstOrDefaultAsync(l => l.Id == id, cancellationToken);

        if (labelPrintRequest == null)
            return null;

        if (labelPrintRequest.Status != LabelPrintStatus.Pending)
            throw new InvalidOperationException("Only pending label print requests can be rejected");

        labelPrintRequest.Status = LabelPrintStatus.Rejected;
        labelPrintRequest.UpdatedById = userId;
        labelPrintRequest.UpdatedAt = DateTime.UtcNow;

        await _context.SaveChangesAsync(cancellationToken);

        return await GetByIdAsync(id, cancellationToken);
    }
}
