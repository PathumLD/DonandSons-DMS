using BCrypt.Net;
using DMS_Backend.Models.DTOs.Auth;
using DMS_Backend.Services.Interfaces;

namespace DMS_Backend.Services.Implementations;

public sealed class AuthService : IAuthService
{
    private readonly IUserService _userService;
    private readonly IJwtService _jwtService;
    private readonly IAuthenticationLogService _authLogService;
    private readonly ISystemLogService _systemLogService;

    public AuthService(
        IUserService userService,
        IJwtService jwtService,
        IAuthenticationLogService authLogService,
        ISystemLogService systemLogService)
    {
        _userService = userService;
        _jwtService = jwtService;
        _authLogService = authLogService;
        _systemLogService = systemLogService;
    }

    public async Task<LoginResponseDto> LoginAsync(
        LoginRequestDto request,
        string? ipAddress,
        string? userAgent,
        CancellationToken cancellationToken = default)
    {
        try
        {
            var user = await _userService.GetByEmailAsync(request.Email, cancellationToken);

            if (user == null)
            {
                await _authLogService.LogLoginFailureAsync(request.Email, "UserNotFound", ipAddress, userAgent);
                throw new UnauthorizedAccessException("Invalid email or password");
            }

            if (!user.IsActive)
            {
                await _authLogService.LogLoginFailureAsync(request.Email, "AccountInactive", ipAddress, userAgent);
                throw new UnauthorizedAccessException("Account is inactive");
            }

            if (!BCrypt.Net.BCrypt.Verify(request.Password, user.PasswordHash))
            {
                await _authLogService.LogLoginFailureAsync(request.Email, "InvalidPassword", ipAddress, userAgent);
                throw new UnauthorizedAccessException("Invalid email or password");
            }

            // Get user permissions
            var permissions = await _userService.GetUserPermissionsAsync(user.Id, cancellationToken);

            // Generate tokens
            var accessToken = _jwtService.GenerateAccessToken(user, permissions);
            var refreshToken = _jwtService.GenerateRefreshToken();
            await _jwtService.StoreRefreshTokenAsync(user.Id, refreshToken, cancellationToken);

            // Update last login
            await _userService.UpdateLastLoginAsync(user.Id, cancellationToken);

            // Log success
            await _authLogService.LogLoginSuccessAsync(user.Email, user.Id, ipAddress, userAgent);

            var userWithRoles = await _userService.GetByIdWithRolesAndPermissionsAsync(user.Id, cancellationToken);

            return new LoginResponseDto
            {
                AccessToken = accessToken,
                User = MapToUserDto(userWithRoles!, permissions),
                ExpiresIn = 900 // 15 minutes in seconds
            };
        }
        catch (UnauthorizedAccessException)
        {
            throw;
        }
        catch (Exception ex)
        {
            await _systemLogService.LogErrorAsync("Authentication", "Login failed", ex);
            throw;
        }
    }

    public async Task<(string AccessToken, UserDto User)?> RefreshTokenAsync(
        string refreshToken,
        string? ipAddress,
        CancellationToken cancellationToken = default)
    {
        var userId = await _jwtService.ValidateRefreshTokenAsync(refreshToken, cancellationToken);
        if (userId == null)
            return null;

        var user = await _userService.GetByIdWithRolesAndPermissionsAsync(userId.Value, cancellationToken);
        if (user == null || !user.IsActive)
            return null;

        var permissions = await _userService.GetUserPermissionsAsync(user.Id, cancellationToken);
        var newAccessToken = _jwtService.GenerateAccessToken(user, permissions);

        await _authLogService.LogTokenRefreshAsync(user.Email, user.Id, ipAddress);

        return (newAccessToken, MapToUserDto(user, permissions));
    }

    public async Task LogoutAsync(
        string refreshToken,
        string? email,
        string? ipAddress,
        string? userAgent,
        CancellationToken cancellationToken = default)
    {
        var userId = await _jwtService.ValidateRefreshTokenAsync(refreshToken, cancellationToken);
        if (userId.HasValue && email != null)
        {
            await _authLogService.LogLogoutAsync(email, userId.Value, ipAddress, userAgent);
        }

        await _jwtService.RevokeRefreshTokenAsync(refreshToken, cancellationToken);
    }

    public async Task<UserDto?> GetCurrentUserAsync(Guid userId, CancellationToken cancellationToken = default)
    {
        var user = await _userService.GetByIdWithRolesAndPermissionsAsync(userId, cancellationToken);
        if (user == null)
            return null;

        var permissions = await _userService.GetUserPermissionsAsync(user.Id, cancellationToken);
        return MapToUserDto(user, permissions);
    }

    private static UserDto MapToUserDto(Models.Entities.User user, List<string> permissions)
    {
        return new UserDto
        {
            Id = user.Id,
            Email = user.Email,
            FirstName = user.FirstName,
            LastName = user.LastName,
            IsSuperAdmin = user.IsSuperAdmin,
            IsActive = user.IsActive,
            Roles = user.UserRoles?
                .Where(ur => ur.Role?.IsActive == true)
                .Select(ur => new RoleDto
                {
                    Id = ur.Role.Id,
                    Name = ur.Role.Name,
                    Description = ur.Role.Description
                })
                .ToList() ?? new List<RoleDto>(),
            Permissions = permissions
        };
    }
}
