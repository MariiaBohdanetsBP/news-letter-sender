using NewsLetterSender.Core.Entities;

namespace NewsLetterSender.Core.Interfaces;

public interface IUserRepository
{
    Task<User?> GetByUsernameAsync(string username, CancellationToken ct = default);
    Task<User> CreateAsync(User user, CancellationToken ct = default);
}
