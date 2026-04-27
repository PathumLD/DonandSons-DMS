using Microsoft.AspNetCore.Mvc;
using DMS_Backend.Services.Interfaces;

namespace DMS_Backend.Controllers;

[ApiController]
[Route("api/delivery-summary")]
public class DeliverySummaryController : ControllerBase
{
    private readonly IDeliverySummaryService _deliverySummaryService;
    private readonly ILogger<DeliverySummaryController> _logger;

    public DeliverySummaryController(
        IDeliverySummaryService deliverySummaryService,
        ILogger<DeliverySummaryController> logger)
    {
        _deliverySummaryService = deliverySummaryService;
        _logger = logger;
    }

    [HttpGet]
    public async Task<IActionResult> GetDeliverySummary(
        [FromQuery] DateTime date,
        [FromQuery] int turnId,
        CancellationToken cancellationToken)
    {
        try
        {
            var summary = await _deliverySummaryService.GetDeliverySummaryAsync(date, turnId, cancellationToken);

            if (summary == null)
            {
                return NotFound(new { message = "Delivery plan not found for the specified date and turn" });
            }

            return Ok(summary);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error getting delivery summary for date {Date} and turn {TurnId}", date, turnId);
            return StatusCode(500, new { message = "An error occurred while retrieving delivery summary" });
        }
    }
}
