using Microsoft.EntityFrameworkCore;
using AutoMapper;
using DMS_Backend.Data;
using DMS_Backend.Models.Entities;
using DMS_Backend.Models.DTOs.ShowroomOpenStock;
using DMS_Backend.Services.Interfaces;

namespace DMS_Backend.Services.Implementations;

public class ShowroomOpenStockService : IShowroomOpenStockService
{
    private readonly ApplicationDbContext _context;
    private readonly IMapper _mapper;

    public ShowroomOpenStockService(ApplicationDbContext context, IMapper mapper)
    {
        _context = context;
        _mapper = mapper;
    }

    public async Task<List<ShowroomOpenStockListDto>> GetAllAsync(CancellationToken cancellationToken = default)
    {
        var showroomOpenStocks = await _context.ShowroomOpenStocks
            .Include(s => s.Outlet)
            .OrderBy(s => s.Outlet.Name)
            .ToListAsync(cancellationToken);

        return _mapper.Map<List<ShowroomOpenStockListDto>>(showroomOpenStocks);
    }

    public async Task<ShowroomOpenStockDetailDto?> GetByIdAsync(Guid id, CancellationToken cancellationToken = default)
    {
        var showroomOpenStock = await _context.ShowroomOpenStocks
            .Include(s => s.Outlet)
            .FirstOrDefaultAsync(s => s.Id == id, cancellationToken);

        if (showroomOpenStock == null)
            return null;

        return _mapper.Map<ShowroomOpenStockDetailDto>(showroomOpenStock);
    }

    public async Task<ShowroomOpenStockDetailDto?> GetByOutletIdAsync(Guid outletId, CancellationToken cancellationToken = default)
    {
        var showroomOpenStock = await _context.ShowroomOpenStocks
            .Include(s => s.Outlet)
            .FirstOrDefaultAsync(s => s.OutletId == outletId, cancellationToken);

        if (showroomOpenStock == null)
            return null;

        return _mapper.Map<ShowroomOpenStockDetailDto>(showroomOpenStock);
    }

    public async Task<ShowroomOpenStockDetailDto> CreateAsync(CreateShowroomOpenStockDto dto, Guid userId, CancellationToken cancellationToken = default)
    {
        var existing = await _context.ShowroomOpenStocks
            .FirstOrDefaultAsync(s => s.OutletId == dto.OutletId, cancellationToken);

        if (existing != null)
            throw new InvalidOperationException("Showroom open stock already exists for this outlet");

        var showroomOpenStock = new ShowroomOpenStock
        {
            Id = Guid.NewGuid(),
            OutletId = dto.OutletId,
            StockAsAt = dto.StockAsAt,
            CreatedById = userId,
            CreatedAt = DateTime.UtcNow,
            UpdatedAt = DateTime.UtcNow
        };

        _context.ShowroomOpenStocks.Add(showroomOpenStock);
        await _context.SaveChangesAsync(cancellationToken);

        return await GetByIdAsync(showroomOpenStock.Id, cancellationToken) 
            ?? throw new InvalidOperationException("Failed to retrieve created showroom open stock");
    }

    public async Task<ShowroomOpenStockDetailDto?> UpdateAsync(Guid id, UpdateShowroomOpenStockDto dto, Guid userId, CancellationToken cancellationToken = default)
    {
        var showroomOpenStock = await _context.ShowroomOpenStocks
            .FirstOrDefaultAsync(s => s.Id == id, cancellationToken);

        if (showroomOpenStock == null)
            return null;

        showroomOpenStock.StockAsAt = dto.StockAsAt;
        showroomOpenStock.UpdatedById = userId;
        showroomOpenStock.UpdatedAt = DateTime.UtcNow;

        await _context.SaveChangesAsync(cancellationToken);

        return await GetByIdAsync(id, cancellationToken);
    }

    public async Task<bool> DeleteAsync(Guid id, CancellationToken cancellationToken = default)
    {
        var showroomOpenStock = await _context.ShowroomOpenStocks
            .FirstOrDefaultAsync(s => s.Id == id, cancellationToken);

        if (showroomOpenStock == null)
            return false;

        showroomOpenStock.IsActive = false;
        showroomOpenStock.UpdatedAt = DateTime.UtcNow;

        await _context.SaveChangesAsync(cancellationToken);

        return true;
    }
}
