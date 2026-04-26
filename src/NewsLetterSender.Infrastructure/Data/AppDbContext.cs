using Microsoft.EntityFrameworkCore;
using NewsLetterSender.Core.Entities;

namespace NewsLetterSender.Infrastructure.Data;

public class AppDbContext(DbContextOptions<AppDbContext> options) : DbContext(options)
{
    public DbSet<Campaign> Campaigns => Set<Campaign>();
    public DbSet<CompanyDecision> CompanyDecisions => Set<CompanyDecision>();
    public DbSet<User> Users => Set<User>();
    public DbSet<AuditLog> AuditLogs => Set<AuditLog>();

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        modelBuilder.ApplyConfigurationsFromAssembly(typeof(AppDbContext).Assembly);
    }
}
