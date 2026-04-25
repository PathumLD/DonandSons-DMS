using AutoMapper;
using DMS_Backend.Data;
using DMS_Backend.Models.DTOs.Products;
using DMS_Backend.Models.Entities;
using DMS_Backend.Services.Interfaces;
using Microsoft.EntityFrameworkCore;

namespace DMS_Backend.Services.Implementations;

public class ProductService : IProductService
{
    private readonly ApplicationDbContext _context;
    private readonly IMapper _mapper;
    private readonly ISystemLogService _systemLogService;

    public ProductService(
        ApplicationDbContext context,
        IMapper mapper,
        ISystemLogService systemLogService)
    {
        _context = context;
        _mapper = mapper;
        _systemLogService = systemLogService;
    }

    public async Task<(List<ProductListItemDto> products, int totalCount)> GetAllAsync(
        int page,
        int pageSize,
        string? searchTerm = null,
        Guid? categoryId = null,
        bool? activeOnly = null,
        CancellationToken cancellationToken = default)
    {
        var query = _context.Products
            .Include(p => p.Category)
            .Include(p => p.UnitOfMeasure)
            .AsQueryable();

        if (activeOnly == true)
        {
            query = query.Where(p => p.IsActive);
        }

        if (categoryId.HasValue)
        {
            query = query.Where(p => p.CategoryId == categoryId.Value);
        }

        if (!string.IsNullOrWhiteSpace(searchTerm))
        {
            query = query.Where(p =>
                p.Code.Contains(searchTerm) ||
                p.Name.Contains(searchTerm) ||
                (p.Description != null && p.Description.Contains(searchTerm)));
        }

        var totalCount = await query.CountAsync(cancellationToken);

        var products = await query
            .OrderBy(p => p.SortOrder)
            .ThenBy(p => p.Code)
            .Skip((page - 1) * pageSize)
            .Take(pageSize)
            .ToListAsync(cancellationToken);

        var productDtos = _mapper.Map<List<ProductListItemDto>>(products);

        return (productDtos, totalCount);
    }

    public async Task<ProductDetailDto?> GetByIdAsync(Guid id, CancellationToken cancellationToken = default)
    {
        var product = await _context.Products
            .Include(p => p.Category)
            .Include(p => p.UnitOfMeasure)
            .FirstOrDefaultAsync(p => p.Id == id, cancellationToken);

        if (product == null)
        {
            return null;
        }

        return _mapper.Map<ProductDetailDto>(product);
    }

    public async Task<ProductDetailDto> CreateAsync(
        CreateProductDto dto,
        Guid userId,
        CancellationToken cancellationToken = default)
    {
        // Check if code already exists
        if (await CodeExistsAsync(dto.Code, null, cancellationToken))
        {
            throw new InvalidOperationException($"Product with code '{dto.Code}' already exists");
        }

        // Verify category exists
        var categoryExists = await _context.Categories.AnyAsync(c => c.Id == dto.CategoryId, cancellationToken);
        if (!categoryExists)
        {
            throw new InvalidOperationException("Category not found");
        }

        // Verify unit of measure exists
        var uomExists = await _context.UnitOfMeasures.AnyAsync(u => u.Id == dto.UnitOfMeasureId, cancellationToken);
        if (!uomExists)
        {
            throw new InvalidOperationException("Unit of measure not found");
        }

        var product = _mapper.Map<Product>(dto);
        product.CreatedById = userId;
        product.UpdatedById = userId;

        _context.Products.Add(product);
        await _context.SaveChangesAsync(cancellationToken);

        await _systemLogService.LogInfoAsync("ProductService", $"Product created: {product.Code} by user {userId}");

        // Reload with includes
        return (await GetByIdAsync(product.Id, cancellationToken))!;
    }

    public async Task<ProductDetailDto> UpdateAsync(
        Guid id,
        UpdateProductDto dto,
        Guid userId,
        CancellationToken cancellationToken = default)
    {
        var product = await _context.Products.FindAsync(new object[] { id }, cancellationToken);
        if (product == null)
        {
            throw new InvalidOperationException("Product not found");
        }

        // Check if code is being changed and if the new code already exists
        if (product.Code != dto.Code && await CodeExistsAsync(dto.Code, id, cancellationToken))
        {
            throw new InvalidOperationException($"Product with code '{dto.Code}' already exists");
        }

        // Verify category exists
        var categoryExists = await _context.Categories.AnyAsync(c => c.Id == dto.CategoryId, cancellationToken);
        if (!categoryExists)
        {
            throw new InvalidOperationException("Category not found");
        }

        // Verify unit of measure exists
        var uomExists = await _context.UnitOfMeasures.AnyAsync(u => u.Id == dto.UnitOfMeasureId, cancellationToken);
        if (!uomExists)
        {
            throw new InvalidOperationException("Unit of measure not found");
        }

        product.Code = dto.Code;
        product.Name = dto.Name;
        product.Description = dto.Description;
        product.CategoryId = dto.CategoryId;
        product.UnitOfMeasureId = dto.UnitOfMeasureId;
        product.UnitPrice = dto.UnitPrice;
        product.ProductType = dto.ProductType;
        product.ProductionSection = dto.ProductionSection;
        product.HasFullSize = dto.HasFullSize;
        product.HasMiniSize = dto.HasMiniSize;
        product.AllowDecimal = dto.AllowDecimal;
        product.DecimalPlaces = dto.DecimalPlaces;
        product.RoundingValue = dto.RoundingValue;
        product.IsPlainRollItem = dto.IsPlainRollItem;
        product.RequireOpenStock = dto.RequireOpenStock;
        product.EnableLabelPrint = dto.EnableLabelPrint;
        product.AllowFutureLabelPrint = dto.AllowFutureLabelPrint;
        product.SortOrder = dto.SortOrder;
        product.DefaultDeliveryTurns = dto.DefaultDeliveryTurns;
        product.AvailableInTurns = dto.AvailableInTurns;
        product.IsActive = dto.IsActive;
        product.UpdatedById = userId;
        product.UpdatedAt = DateTime.UtcNow;

        await _context.SaveChangesAsync(cancellationToken);

        await _systemLogService.LogInfoAsync("ProductService", $"Product updated: {product.Code} by user {userId}");

        // Reload with includes
        return (await GetByIdAsync(product.Id, cancellationToken))!;
    }

    public async Task DeleteAsync(Guid id, Guid userId, CancellationToken cancellationToken = default)
    {
        var product = await _context.Products
            .FirstOrDefaultAsync(p => p.Id == id, cancellationToken);

        if (product == null)
        {
            throw new InvalidOperationException("Product not found");
        }

        // Soft delete
        product.IsActive = false;
        product.UpdatedById = userId;
        product.UpdatedAt = DateTime.UtcNow;

        await _context.SaveChangesAsync(cancellationToken);

        await _systemLogService.LogInfoAsync("ProductService", $"Product soft-deleted: {product.Code} by user {userId}");
    }

    public async Task<bool> CodeExistsAsync(
        string code,
        Guid? excludeId = null,
        CancellationToken cancellationToken = default)
    {
        var query = _context.Products.Where(p => p.Code == code);

        if (excludeId.HasValue)
        {
            query = query.Where(p => p.Id != excludeId.Value);
        }

        return await query.AnyAsync(cancellationToken);
    }
}
