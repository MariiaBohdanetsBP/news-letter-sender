using NewsLetterSender.Api.Models;
using NewsLetterSender.Api.Services;
using NewsLetterSender.Core.Interfaces;

namespace NewsLetterSender.Api.Endpoints;

public static class AuthEndpoints
{
    public static void MapAuthEndpoints(this WebApplication app)
    {
        var group = app.MapGroup("/api/auth").WithTags("Auth");

        group.MapPost("/login", async (
            LoginRequest request,
            IUserRepository userRepo,
            TokenService tokenService) =>
        {
            var user = await userRepo.GetByUsernameAsync(request.Username);
            if (user is null || !BCrypt.Net.BCrypt.Verify(request.Password, user.PasswordHash))
                return Results.Unauthorized();

            var token = tokenService.GenerateToken(user);
            return Results.Ok(new LoginResponse(token, user.DisplayName, user.Role.ToString()));
        })
        .WithName("Login")
        .AllowAnonymous();
    }
}
