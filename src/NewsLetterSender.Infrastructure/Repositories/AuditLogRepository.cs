using Microsoft.EntityFrameworkCore;
using NewsLetterSender.Core.Entities;
using NewsLetterSender.Core.Interfaces;
using NewsLetterSender.Infrastructure.Data;

namespace NewsLetterSender.Infrastructure.Repositories;

public class AuditLogRepository(AppDbContext db) : IAuditLogRepository
{
    public async Task LogAsync(AuditLog entry, CancellationToken ct = default)
    {
        entry.Id = Guid.NewGuid();
        entry.Timestamp = DateTime.UtcNow;
        db.AuditLogs.Add(entry);
        await db.SaveChangesAsync(ct);
    }

    public async Task<List<AuditLog>> GetByCampaignAsync(Guid campaignId, CancellationToken ct = default)
    {
        return await db.AuditLogs
            .Where(a => a.CampaignId == campaignId)
            .OrderByDescending(a => a.Timestamp)
            .ToListAsync(ct);
    }
}
