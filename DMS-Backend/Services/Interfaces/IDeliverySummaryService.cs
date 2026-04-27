using DMS_Backend.Models.DTOs.DeliverySummary;

namespace DMS_Backend.Services.Interfaces;

public interface IDeliverySummaryService
{
    Task<DeliverySummaryDto?> GetDeliverySummaryAsync(DateTime date, int turnId, CancellationToken cancellationToken = default);
}
