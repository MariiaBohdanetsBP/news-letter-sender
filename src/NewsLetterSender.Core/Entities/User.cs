using NewsLetterSender.Core.Enums;

namespace NewsLetterSender.Core.Entities;

public class User
{
    public Guid Id { get; set; }
    public required string Username { get; set; }
    public required string PasswordHash { get; set; }
    public required string DisplayName { get; set; }
    public UserRole Role { get; set; } = UserRole.AccountManager;
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
}
