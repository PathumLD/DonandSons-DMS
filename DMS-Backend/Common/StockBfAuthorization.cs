using System.Linq;
using System.Security.Claims;

namespace DMS_Backend.Common;

/// <summary>
/// Stock BF visibility and BF-date rules aligned with dashboard date-restrictions / requirements (4.iv).
/// </summary>
public static class StockBfAuthorization
{
    public static bool CanViewAllStockBfRecords(ClaimsPrincipal user)
    {
        if (user.FindFirst("isSuperAdmin")?.Value.Equals("true", StringComparison.OrdinalIgnoreCase) == true)
            return true;
        return user.HasClaim("permission", "*");
    }

    /// <summary>
    /// Super-admin, wildcard permission, or explicit flex-date grant (matches frontend optional permissions).
    /// </summary>
    public static bool HasRelaxedBfDateRules(ClaimsPrincipal user)
    {
        if (CanViewAllStockBfRecords(user))
            return true;
        return user.FindAll("permission").Any(c =>
            string.Equals(c.Value, "operation:stock-bf:flex-date", StringComparison.Ordinal) ||
            string.Equals(c.Value, "operation.stock-bf.allow-back-future", StringComparison.Ordinal));
    }
}
