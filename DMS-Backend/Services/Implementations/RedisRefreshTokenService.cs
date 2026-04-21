using Microsoft.Extensions.Options;
using StackExchange.Redis;
using DMS_Backend.Configuration;
using DMS_Backend.Services.Interfaces;

namespace DMS_Backend.Services.Implementations;

/// <summary>
/// Redis-based refresh token storage for production use.
/// </summary>
public sealed class RedisRefreshTokenService : IRefreshTokenService
{
    private readonly IConnectionMultiplexer _redis;
    private readonly RedisOptions _redisOptions;

    public RedisRefreshTokenService(
        IConnectionMultiplexer redis,
        IOptions<RedisOptions> redisOptions)
    {
        _redis = redis;
        _redisOptions = redisOptions.Value;
    }

    public async Task StoreRefreshTokenAsync(Guid userId, string refreshToken, int expiryDays)
    {
        var db = _redis.GetDatabase();
        var key = $"{_redisOptions.InstanceName}refresh_token:{refreshToken}";
        var expiry = TimeSpan.FromDays(expiryDays);
        await db.StringSetAsync(key, userId.ToString(), expiry);
    }

    public async Task<Guid?> ValidateRefreshTokenAsync(string refreshToken)
    {
        var db = _redis.GetDatabase();
        var key = $"{_redisOptions.InstanceName}refresh_token:{refreshToken}";
        var userIdStr = await db.StringGetAsync(key);

        if (userIdStr.IsNullOrEmpty)
            return null;

        return Guid.TryParse(userIdStr.ToString(), out var userId) ? userId : null;
    }

    public async Task RevokeRefreshTokenAsync(string refreshToken)
    {
        var db = _redis.GetDatabase();
        var key = $"{_redisOptions.InstanceName}refresh_token:{refreshToken}";
        await db.KeyDeleteAsync(key);
    }
}
