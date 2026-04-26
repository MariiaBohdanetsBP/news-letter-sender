using Microsoft.EntityFrameworkCore;
using NewsLetterSender.Core.Entities;
using NewsLetterSender.Core.Interfaces;
using NewsLetterSender.Infrastructure.Data;

namespace NewsLetterSender.Infrastructure.Repositories;

public class UserRepository(AppDbContext db) : IUserRepository
{
    public async Task<User?> GetByUsernameAsync(string username, CancellationToken ct = default) =>
        await db.Users.FirstOrDefaultAsync(u => u.Username == username, ct);

    public async Task<User> CreateAsync(User user, CancellationToken ct = default)
    {
        db.Users.Add(user);
        await db.SaveChangesAsync(ct);
        return user;
    }
}
