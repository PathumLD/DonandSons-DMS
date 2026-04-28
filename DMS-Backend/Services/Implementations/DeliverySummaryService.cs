using Microsoft.EntityFrameworkCore;
using DMS_Backend.Data;
using DMS_Backend.Models.DTOs.DeliverySummary;
using DMS_Backend.Services.Interfaces;

namespace DMS_Backend.Services.Implementations;

public class DeliverySummaryService : IDeliverySummaryService
{
    private readonly ApplicationDbContext _context;

    public DeliverySummaryService(ApplicationDbContext context)
    {
        _context = context;
    }

    public async Task<DeliverySummaryDto?> GetDeliverySummaryAsync(DateTime date, int turnId, CancellationToken cancellationToken = default)
    {
        date = DateTime.SpecifyKind(date.Date, DateTimeKind.Utc);
        var deliveryPlan = await _context.DeliveryPlans
            .Include(dp => dp.DeliveryTurn)
            .FirstOrDefaultAsync(dp => dp.PlanDate.Date == date && dp.DeliveryTurnId == new Guid(), cancellationToken);

        if (deliveryPlan == null)
            return null;

        // Get order items with outlet and product info
        var orderItems = await _context.OrderItems
            .Include(oi => oi.Outlet)
            .Include(oi => oi.Product)
            .Include(oi => oi.OrderHeader)
            .Where(oi => oi.OrderHeader!.DeliveryPlanId == deliveryPlan.Id)
            .ToListAsync(cancellationToken);

        var outletSummaries = orderItems
            .GroupBy(oi => oi.Outlet)
            .Select(outletGroup => new DeliveryOutletSummaryDto
            {
                OutletId = outletGroup.Key!.Id,
                OutletCode = outletGroup.Key.Code,
                OutletName = outletGroup.Key.Name,
                Products = outletGroup
                    .GroupBy(oi => oi.Product)
                    .Select(productGroup => new DeliveryProductSummaryDto
                    {
                        ProductId = productGroup.Key!.Id,
                        ProductCode = productGroup.Key.Code,
                        ProductName = productGroup.Key.Name,
                        RegularFullQty = productGroup.Where(oi => !oi.IsCustomized).Sum(oi => oi.FullQuantity),
                        RegularMiniQty = productGroup.Where(oi => !oi.IsCustomized).Sum(oi => oi.MiniQuantity),
                        CustomizedFullQty = productGroup.Where(oi => oi.IsCustomized).Sum(oi => oi.FullQuantity),
                        CustomizedMiniQty = productGroup.Where(oi => oi.IsCustomized).Sum(oi => oi.MiniQuantity),
                        TotalQty = productGroup.Sum(oi => oi.FullQuantity + oi.MiniQuantity)
                    })
                    .OrderBy(p => p.ProductCode)
                    .ToList()
            })
            .OrderBy(o => o.OutletCode)
            .ToList();

        var productTotals = orderItems
            .GroupBy(oi => oi.Product)
            .Select(productGroup => new DeliveryProductTotalDto
            {
                ProductId = productGroup.Key!.Id,
                ProductCode = productGroup.Key.Code,
                ProductName = productGroup.Key.Name,
                TotalRegularFull = productGroup.Where(oi => !oi.IsCustomized).Sum(oi => oi.FullQuantity),
                TotalRegularMini = productGroup.Where(oi => !oi.IsCustomized).Sum(oi => oi.MiniQuantity),
                TotalCustomizedFull = productGroup.Where(oi => oi.IsCustomized).Sum(oi => oi.FullQuantity),
                TotalCustomizedMini = productGroup.Where(oi => oi.IsCustomized).Sum(oi => oi.MiniQuantity),
                GrandTotal = productGroup.Sum(oi => oi.FullQuantity + oi.MiniQuantity)
            })
            .OrderBy(p => p.ProductCode)
            .ToList();

        return new DeliverySummaryDto
        {
            DeliveryDate = deliveryPlan.PlanDate,
            TurnId = turnId,
            TurnName = deliveryPlan.DeliveryTurn?.Name ?? string.Empty,
            Outlets = outletSummaries,
            ProductTotals = productTotals
        };
    }
}
