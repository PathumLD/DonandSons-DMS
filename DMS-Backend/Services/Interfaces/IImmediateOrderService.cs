using DMS_Backend.Models.DTOs.ImmediateOrders;

namespace DMS_Backend.Services.Interfaces;

public interface IImmediateOrderService
{
    Task<(IEnumerable<ImmediateOrderListDto> orders, int totalCount)> GetAllAsync(
        int page,
        int pageSize,
        DateTime? fromDate = null,
        DateTime? toDate = null,
        string? status = null,
        Guid? outletId = null,
        Guid? deliveryTurnId = null,
        CancellationToken cancellationToken = default);

    Task<IEnumerable<ImmediateOrderListDto>> GetByDateAndTurnAsync(
        DateTime date,
        Guid turnId,
        CancellationToken cancellationToken = default);

    Task<ImmediateOrderDetailDto?> GetByIdAsync(Guid id, CancellationToken cancellationToken = default);

    Task<ImmediateOrderDetailDto> CreateAsync(
        CreateImmediateOrderDto dto,
        Guid userId,
        CancellationToken cancellationToken = default);

    Task<ImmediateOrderDetailDto> UpdateAsync(
        Guid id,
        UpdateImmediateOrderDto dto,
        Guid userId,
        CancellationToken cancellationToken = default);

    Task DeleteAsync(Guid id, CancellationToken cancellationToken = default);

    Task<ImmediateOrderDetailDto> ApproveAsync(
        Guid id,
        Guid approvedBy,
        CancellationToken cancellationToken = default);

    Task<ImmediateOrderDetailDto> RejectAsync(
        Guid id,
        string reason,
        Guid userId,
        CancellationToken cancellationToken = default);
}
