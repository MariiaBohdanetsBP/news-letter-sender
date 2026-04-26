using Microsoft.EntityFrameworkCore;
using NewsLetterSender.Core.Entities;
using NewsLetterSender.Core.Interfaces;
using NewsLetterSender.Infrastructure.Data;

namespace NewsLetterSender.Infrastructure.Repositories;

public class CompanyDecisionRepository(AppDbContext db) : ICompanyDecisionRepository
{
    public async Task<List<CompanyDecision>> GetByCampaignAsync(Guid campaignId, CancellationToken ct = default) =>
        await db.CompanyDecisions
            .Where(d => d.CampaignId == campaignId)
            .OrderBy(d => d.CompanyName)
            .ToListAsync(ct);

    public async Task SaveDecisionsAsync(Guid campaignId, List<CompanyDecision> decisions, CancellationToken ct = default)
    {
        // Remove existing decisions for this campaign and replace (last save wins)
        var existing = await db.CompanyDecisions
            .Where(d => d.CampaignId == campaignId)
            .ToListAsync(ct);

        db.CompanyDecisions.RemoveRange(existing);
        db.CompanyDecisions.AddRange(decisions);
        await db.SaveChangesAsync(ct);
    }
}
