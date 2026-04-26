using NewsLetterSender.Core.Entities;

namespace NewsLetterSender.Core.Interfaces;

public interface IAuditLogRepository
{
    Task LogAsync(AuditLog entry, CancellationToken ct = default);
    Task<List<AuditLog>> GetByCampaignAsync(Guid campaignId, CancellationToken ct = default);
}
