using AutoMapper;
using Microsoft.EntityFrameworkCore;
using DMS_Backend.Data;
using DMS_Backend.Models.DTOs.ImmediateOrders;
using DMS_Backend.Models.Entities;
using DMS_Backend.Services.Interfaces;

namespace DMS_Backend.Services.Implementations;

public sealed class ImmediateOrderService : IImmediateOrderService
{
    private readonly ApplicationDbContext _context;
    private readonly IMapper _mapper;
    private readonly ILogger<ImmediateOrderService> _logger;

    public ImmediateOrderService(
        ApplicationDbContext context,
        IMapper mapper,
        ILogger<ImmediateOrderService> logger)
    {
        _context = context;
        _mapper = mapper;
        _logger = logger;
    }

    public async Task<(IEnumerable<ImmediateOrderListDto> orders, int totalCount)> GetAllAsync(
        int page,
        int pageSize,
        DateTime? fromDate = null,
        DateTime? toDate = null,
        string? status = null,
        Guid? outletId = null,
        Guid? deliveryTurnId = null,
        CancellationToken cancellationToken = default)
    {
        var query = _context.Set<ImmediateOrder>()
            .Include(io => io.DeliveryTurn)
            .Include(io => io.Outlet)
            .Include(io => io.Product)
            .AsQueryable();

        if (fromDate.HasValue)
        {
            query = query.Where(io => io.OrderDate >= fromDate.Value);
        }

        if (toDate.HasValue)
        {
            query = query.Where(io => io.OrderDate <= toDate.Value);
        }

        if (!string.IsNullOrWhiteSpace(status))
        {
            query = query.Where(io => io.Status == status);
        }

        if (outletId.HasValue)
        {
            query = query.Where(io => io.OutletId == outletId.Value);
        }

        if (deliveryTurnId.HasValue)
        {
            query = query.Where(io => io.DeliveryTurnId == deliveryTurnId.Value);
        }

        var totalCount = await query.CountAsync(cancellationToken);

        var orders = await query
            .OrderByDescending(io => io.OrderDate)
            .ThenBy(io => io.OrderNo)
            .Skip((page - 1) * pageSize)
            .Take(pageSize)
            .Select(io => new ImmediateOrderListDto
            {
                Id = io.Id,
                OrderNo = io.OrderNo,
                OrderDate = io.OrderDate,
                DeliveryTurnId = io.DeliveryTurnId,
                DeliveryTurnName = io.DeliveryTurn!.Name,
                OutletId = io.OutletId,
                OutletName = io.Outlet!.Name,
                ProductId = io.ProductId,
                ProductName = io.Product!.Name,
                FullQuantity = io.FullQuantity,
                MiniQuantity = io.MiniQuantity,
                RequestedBy = io.RequestedBy,
                Status = io.Status,
                CreatedAt = io.CreatedAt
            })
            .ToListAsync(cancellationToken);

        return (orders, totalCount);
    }

    public async Task<IEnumerable<ImmediateOrderListDto>> GetByDateAndTurnAsync(
        DateTime date,
        Guid turnId,
        CancellationToken cancellationToken = default)
    {
        var orders = await _context.Set<ImmediateOrder>()
            .Include(io => io.DeliveryTurn)
            .Include(io => io.Outlet)
            .Include(io => io.Product)
            .Where(io => io.OrderDate.Date == date.Date && io.DeliveryTurnId == turnId)
            .Select(io => new ImmediateOrderListDto
            {
                Id = io.Id,
                OrderNo = io.OrderNo,
                OrderDate = io.OrderDate,
                DeliveryTurnId = io.DeliveryTurnId,
                DeliveryTurnName = io.DeliveryTurn!.Name,
                OutletId = io.OutletId,
                OutletName = io.Outlet!.Name,
                ProductId = io.ProductId,
                ProductName = io.Product!.Name,
                FullQuantity = io.FullQuantity,
                MiniQuantity = io.MiniQuantity,
                RequestedBy = io.RequestedBy,
                Status = io.Status,
                CreatedAt = io.CreatedAt
            })
            .ToListAsync(cancellationToken);

        return orders;
    }

    public async Task<ImmediateOrderDetailDto?> GetByIdAsync(Guid id, CancellationToken cancellationToken = default)
    {
        var order = await _context.Set<ImmediateOrder>()
            .Include(io => io.DeliveryTurn)
            .Include(io => io.Outlet)
            .Include(io => io.Product)
            .FirstOrDefaultAsync(io => io.Id == id, cancellationToken);

        if (order == null)
        {
            return null;
        }

        return new ImmediateOrderDetailDto
        {
            Id = order.Id,
            OrderNo = order.OrderNo,
            OrderDate = order.OrderDate,
            DeliveryTurnId = order.DeliveryTurnId,
            DeliveryTurnName = order.DeliveryTurn!.Name,
            OutletId = order.OutletId,
            OutletName = order.Outlet!.Name,
            ProductId = order.ProductId,
            ProductName = order.Product!.Name,
            FullQuantity = order.FullQuantity,
            MiniQuantity = order.MiniQuantity,
            RequestedBy = order.RequestedBy,
            Reason = order.Reason,
            Status = order.Status,
            ApprovedBy = order.ApprovedBy,
            ApprovedAt = order.ApprovedAt,
            RejectionReason = order.RejectionReason,
            IsActive = order.IsActive,
            CreatedAt = order.CreatedAt,
            UpdatedAt = order.UpdatedAt,
            CreatedById = order.CreatedById,
            UpdatedById = order.UpdatedById
        };
    }

    public async Task<ImmediateOrderDetailDto> CreateAsync(
        CreateImmediateOrderDto dto,
        Guid userId,
        CancellationToken cancellationToken = default)
    {
        var count = await _context.Set<ImmediateOrder>()
            .CountAsync(cancellationToken);

        var orderNo = $"IMM-{DateTime.UtcNow.Year}-{(count + 1).ToString("D6")}";

        var order = _mapper.Map<ImmediateOrder>(dto);
        order.Id = Guid.NewGuid();
        order.OrderNo = orderNo;
        order.Status = "Pending";
        order.CreatedById = userId;
        order.UpdatedById = userId;
        order.CreatedAt = DateTime.UtcNow;
        order.UpdatedAt = DateTime.UtcNow;

        _context.Set<ImmediateOrder>().Add(order);
        await _context.SaveChangesAsync(cancellationToken);

        _logger.LogInformation("Immediate order created: {OrderNo} for outlet {OutletId}", 
            order.OrderNo, order.OutletId);

        return (await GetByIdAsync(order.Id, cancellationToken))!;
    }

    public async Task<ImmediateOrderDetailDto> UpdateAsync(
        Guid id,
        UpdateImmediateOrderDto dto,
        Guid userId,
        CancellationToken cancellationToken = default)
    {
        var order = await _context.Set<ImmediateOrder>()
            .FirstOrDefaultAsync(io => io.Id == id, cancellationToken);

        if (order == null)
        {
            throw new InvalidOperationException($"Immediate order with ID '{id}' not found.");
        }

        if (order.Status != "Pending")
        {
            throw new InvalidOperationException("Only pending orders can be updated.");
        }

        _mapper.Map(dto, order);
        order.UpdatedById = userId;
        order.UpdatedAt = DateTime.UtcNow;

        await _context.SaveChangesAsync(cancellationToken);

        _logger.LogInformation("Immediate order updated: {OrderNo}", order.OrderNo);

        return (await GetByIdAsync(id, cancellationToken))!;
    }

    public async Task DeleteAsync(Guid id, CancellationToken cancellationToken = default)
    {
        var order = await _context.Set<ImmediateOrder>()
            .FirstOrDefaultAsync(io => io.Id == id, cancellationToken);

        if (order == null)
        {
            throw new InvalidOperationException($"Immediate order with ID '{id}' not found.");
        }

        if (order.Status != "Pending")
        {
            throw new InvalidOperationException("Only pending orders can be deleted.");
        }

        order.IsActive = false;
        order.UpdatedAt = DateTime.UtcNow;

        await _context.SaveChangesAsync(cancellationToken);

        _logger.LogInformation("Immediate order soft-deleted: {OrderNo}", order.OrderNo);
    }

    public async Task<ImmediateOrderDetailDto> ApproveAsync(
        Guid id,
        Guid approvedBy,
        CancellationToken cancellationToken = default)
    {
        var order = await _context.Set<ImmediateOrder>()
            .FirstOrDefaultAsync(io => io.Id == id, cancellationToken);

        if (order == null)
        {
            throw new InvalidOperationException($"Immediate order with ID '{id}' not found.");
        }

        if (order.Status != "Pending")
        {
            throw new InvalidOperationException("Only pending orders can be approved.");
        }

        order.Status = "Approved";
        order.ApprovedBy = approvedBy;
        order.ApprovedAt = DateTime.UtcNow;
        order.UpdatedById = approvedBy;
        order.UpdatedAt = DateTime.UtcNow;

        await _context.SaveChangesAsync(cancellationToken);

        _logger.LogInformation("Immediate order approved: {OrderNo} by user {UserId}", 
            order.OrderNo, approvedBy);

        return (await GetByIdAsync(id, cancellationToken))!;
    }

    public async Task<ImmediateOrderDetailDto> RejectAsync(
        Guid id,
        string reason,
        Guid userId,
        CancellationToken cancellationToken = default)
    {
        var order = await _context.Set<ImmediateOrder>()
            .FirstOrDefaultAsync(io => io.Id == id, cancellationToken);

        if (order == null)
        {
            throw new InvalidOperationException($"Immediate order with ID '{id}' not found.");
        }

        if (order.Status != "Pending")
        {
            throw new InvalidOperationException("Only pending orders can be rejected.");
        }

        order.Status = "Rejected";
        order.RejectionReason = reason;
        order.UpdatedById = userId;
        order.UpdatedAt = DateTime.UtcNow;

        await _context.SaveChangesAsync(cancellationToken);

        _logger.LogInformation("Immediate order rejected: {OrderNo} by user {UserId}", 
            order.OrderNo, userId);

        return (await GetByIdAsync(id, cancellationToken))!;
    }
}
