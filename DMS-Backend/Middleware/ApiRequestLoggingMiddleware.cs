using System.Diagnostics;
using System.Security.Claims;
using System.Text;
using System.Text.Json;
using DMS_Backend.Data;
using DMS_Backend.Models.Entities;

namespace DMS_Backend.Middleware;

/// <summary>
/// Middleware that logs all API requests to the api_request_logs table
/// </summary>
public sealed class ApiRequestLoggingMiddleware
{
    private readonly RequestDelegate _next;
    private readonly ILogger<ApiRequestLoggingMiddleware> _logger;

    public ApiRequestLoggingMiddleware(RequestDelegate next, ILogger<ApiRequestLoggingMiddleware> logger)
    {
        _next = next;
        _logger = logger;
    }

    public async Task InvokeAsync(HttpContext context, ApplicationDbContext dbContext)
    {
        // Skip DB-backed request logging for health probes (high frequency, no value)
        if (context.Request.Path.StartsWithSegments("/health"))
        {
            await _next(context);
            return;
        }

        var requestId = context.TraceIdentifier;
        var stopwatch = Stopwatch.StartNew();
        
        // Capture request body if present
        string? requestBody = null;
        if (context.Request.ContentLength > 0 && context.Request.ContentType?.Contains("application/json") == true)
        {
            context.Request.EnableBuffering();
            using var reader = new StreamReader(
                context.Request.Body,
                Encoding.UTF8,
                leaveOpen: true);
            requestBody = await reader.ReadToEndAsync();
            context.Request.Body.Position = 0;
        }

        // Capture original response body stream
        var originalBodyStream = context.Response.Body;
        using var responseBody = new MemoryStream();
        context.Response.Body = responseBody;

        Exception? exception = null;
        try
        {
            await _next(context);
        }
        catch (Exception ex)
        {
            exception = ex;
            throw;
        }
        finally
        {
            stopwatch.Stop();

            // Extract user info from claims
            Guid? userId = null;
            string? email = null;
            if (context.User?.Identity?.IsAuthenticated == true)
            {
                var userIdClaim = context.User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
                if (Guid.TryParse(userIdClaim, out var parsedUserId))
                    userId = parsedUserId;
                
                email = context.User.FindFirst(ClaimTypes.Email)?.Value;
            }

            // Create log entry
            var apiRequestLog = new ApiRequestLog
            {
                UserId = userId,
                Email = email,
                RequestId = requestId,
                Endpoint = $"{context.Request.Path}{context.Request.QueryString}",
                HttpMethod = context.Request.Method,
                QueryString = context.Request.QueryString.HasValue ? context.Request.QueryString.Value : null,
                RequestBody = !string.IsNullOrEmpty(requestBody) ? JsonDocument.Parse(requestBody) : null,
                ResponseStatusCode = context.Response.StatusCode,
                ResponseTimeMs = (int)stopwatch.ElapsedMilliseconds,
                IpAddress = context.Connection.RemoteIpAddress?.ToString(),
                UserAgent = context.Request.Headers["User-Agent"].FirstOrDefault(),
                IsSuccessful = context.Response.StatusCode < 400 && exception == null,
                ErrorMessage = exception?.Message,
                Timestamp = DateTime.UtcNow
            };

            try
            {
                // Only log if not already disposed (e.g., during shutdown)
                if (dbContext.Database.CanConnect())
                {
                    dbContext.ApiRequestLogs.Add(apiRequestLog);
                    await dbContext.SaveChangesAsync();
                }
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Failed to log API request to database");
            }

            // Copy response body back to original stream
            responseBody.Seek(0, SeekOrigin.Begin);
            await responseBody.CopyToAsync(originalBodyStream);
        }
    }
}
