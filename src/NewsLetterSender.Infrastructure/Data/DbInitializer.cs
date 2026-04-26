using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.DependencyInjection;
using NewsLetterSender.Core.Entities;
using NewsLetterSender.Core.Enums;

namespace NewsLetterSender.Infrastructure.Data;

public static class DbInitializer
{
    public static async Task SeedAsync(IServiceProvider services)
    {
        using var scope = services.CreateScope();
        var db = scope.ServiceProvider.GetRequiredService<AppDbContext>();
        await db.Database.MigrateAsync();

        if (await db.Users.AnyAsync()) return;

        // Seed admin user (password: admin123 — POC only)
        var admin = new User
        {
            Username = "admin",
            PasswordHash = BCrypt.Net.BCrypt.HashPassword("admin123"),
            DisplayName = "Marketing Admin",
            Role = UserRole.Admin
        };

        // Seed account managers
        var managers = new[]
        {
            new User { Username = "mariya", PasswordHash = BCrypt.Net.BCrypt.HashPassword("pass123"), DisplayName = "Mariya Ivanova", Role = UserRole.AccountManager },
            new User { Username = "jan.novak", PasswordHash = BCrypt.Net.BCrypt.HashPassword("pass123"), DisplayName = "Jan Novák", Role = UserRole.AccountManager },
            new User { Username = "petra", PasswordHash = BCrypt.Net.BCrypt.HashPassword("pass123"), DisplayName = "Petra Svobodová", Role = UserRole.AccountManager },
        };

        db.Users.Add(admin);
        db.Users.AddRange(managers);

        // Seed sample campaigns
        db.Campaigns.AddRange(
            new Campaign { Name = "Slevomat", Status = CampaignStatus.Processed, PlanDate = new DateOnly(2026, 4, 30) },
            new Campaign { Name = "VIP", Status = CampaignStatus.Processed, PlanDate = new DateOnly(2026, 5, 15) }
        );

        await db.SaveChangesAsync();
    }
}
