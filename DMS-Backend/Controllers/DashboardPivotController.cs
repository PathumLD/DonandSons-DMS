using Microsoft.AspNetCore.Mvc;
using DMS_Backend.Services.Interfaces;

namespace DMS_Backend.Controllers;

[ApiController]
[Route("api/dashboard-pivot")]
public class DashboardPivotController : ControllerBase
{
    private readonly IDashboardPivotService _dashboardPivotService;
    private readonly ILogger<DashboardPivotController> _logger;

    public DashboardPivotController(
        IDashboardPivotService dashboardPivotService,
        ILogger<DashboardPivotController> logger)
    {
        _dashboardPivotService = dashboardPivotService;
        _logger = logger;
    }

    [HttpGet]
    public async Task<IActionResult> GetDashboardPivot(
        [FromQuery] DateTime fromDate,
        [FromQuery] DateTime toDate,
        CancellationToken cancellationToken)
    {
        try
        {
            var pivot = await _dashboardPivotService.GetDashboardPivotAsync(fromDate, toDate, cancellationToken);
            return Ok(pivot);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error getting dashboard pivot from {FromDate} to {ToDate}", fromDate, toDate);
            return StatusCode(500, new { message = "An error occurred while retrieving dashboard pivot" });
        }
    }
}
