
using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;
using Daycare.Api.DTOs;
using Daycare.Api.Identity;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;
using Microsoft.IdentityModel.Tokens;

namespace Daycare.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
public class AuthController : ControllerBase
{
    private readonly UserManager<ApplicationUser> _userManager;
    private readonly IConfiguration _configuration;

    public AuthController(
        UserManager<ApplicationUser> userManager,
        IConfiguration configuration)
    {
        _userManager = userManager;
        _configuration = configuration;
    }

    [AllowAnonymous]
    [HttpPost("register")]
    public async Task<IActionResult> Register(RegisterRequest request)
    {
        var existing = await _userManager.FindByEmailAsync(request.Email);

        if (existing != null)
            return Conflict(new { message = "Email is already registered." });

        var user = new ApplicationUser
        {
            UserName = request.Email.Trim(),
            Email = request.Email.Trim(),
            FirstName = request.FirstName.Trim(),
            LastName = request.LastName.Trim(),
            PhoneNumber = request.PhoneNumber
        };

        var result = await _userManager.CreateAsync(user, request.Password);

        if (!result.Succeeded)
        {
            return BadRequest(new
            {
                errors = result.Errors.Select(e => e.Description)
            });
        }

        var roleResult = await _userManager.AddToRoleAsync(
            user, AppRoles.Parent);

        if (!roleResult.Succeeded)
        {
            // Avoid leaving a registered account without its required role.
            await _userManager.DeleteAsync(user);

            return StatusCode(500, new
            {
                message = "Could not assign the Parent role."
            });
        }

        var response = await CreateAuthResponse(user);

        return StatusCode(StatusCodes.Status201Created, response);
    }

    [AllowAnonymous]
    [HttpPost("login")]
    public async Task<IActionResult> Login(LoginRequest request)
    {
        var user = await _userManager.FindByEmailAsync(request.Email);

        if (user == null ||
            !await _userManager.CheckPasswordAsync(user, request.Password))
        {
            return Unauthorized(new
            {
                message = "Invalid email or password."
            });
        }

        if (await _userManager.IsLockedOutAsync(user))
        {
            return Unauthorized(new
            {
                message = "Account is temporarily locked."
            });
        }

        var response = await CreateAuthResponse(user);

        return Ok(response);
    }

    private async Task<AuthResponse> CreateAuthResponse(
        ApplicationUser user)
    {
        var roles = await _userManager.GetRolesAsync(user);

        var keyText = _configuration["Jwt:Key"]
            ?? throw new InvalidOperationException("JWT key is missing.");

        var keyBytes = Encoding.UTF8.GetBytes(keyText);

        if (keyBytes.Length < 32)
            throw new InvalidOperationException(
                "JWT signing key must be at least 32 bytes.");

        var issuer = _configuration["Jwt:Issuer"]
            ?? throw new InvalidOperationException("JWT issuer is missing.");

        var audience = _configuration["Jwt:Audience"]
            ?? throw new InvalidOperationException("JWT audience is missing.");

        var expiresMinutes =
            _configuration.GetValue<int>("Jwt:ExpiresMinutes", 30);

        var expires = DateTime.UtcNow.AddMinutes(expiresMinutes);

        var claims = new List<Claim>
        {
            new(JwtRegisteredClaimNames.Sub, user.Id),
            new(JwtRegisteredClaimNames.Email, user.Email ?? ""),
            new(ClaimTypes.NameIdentifier, user.Id),
            new(ClaimTypes.Name, user.UserName ?? user.Email ?? ""),
            new(JwtRegisteredClaimNames.Jti, Guid.NewGuid().ToString())
        };

        claims.AddRange(roles.Select(role =>
            new Claim(ClaimTypes.Role, role)));

        var credentials = new SigningCredentials(
            new SymmetricSecurityKey(keyBytes),
            SecurityAlgorithms.HmacSha256);

        var token = new JwtSecurityToken(
            issuer: issuer,
            audience: audience,
            claims: claims,
            expires: expires,
            signingCredentials: credentials);

        return new AuthResponse
        {
            Token = new JwtSecurityTokenHandler().WriteToken(token),
            ExpiresAtUtc = expires,
            UserId = user.Id,
            FirstName = user.FirstName,
            LastName = user.LastName,
            Email = user.Email ?? "",
            Roles = roles
        };
    }
}
