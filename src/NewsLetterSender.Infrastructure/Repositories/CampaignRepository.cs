using Microsoft.EntityFrameworkCore;
using NewsLetterSender.Core.Entities;
using NewsLetterSender.Core.Interfaces;
using NewsLetterSender.Infrastructure.Data;

namespace NewsLetterSender.Infrastructure.Repositories;

public class CampaignRepository(AppDbContext db) : ICampaignRepository
{
    public async Task<List<Campaign>> GetAllAsync(CancellationToken ct = default) =>
        await db.Campaigns.OrderByDescending(c => c.CreatedAt).ToListAsync(ct);

    public async Task<Campaign?> GetByIdAsync(Guid id, CancellationToken ct = default) =>
        await db.Campaigns.FindAsync([id], ct);

    public async Task<Campaign> CreateAsync(Campaign campaign, CancellationToken ct = default)
    {
        db.Campaigns.Add(campaign);
        await db.SaveChangesAsync(ct);
        return campaign;
    }

    public async Task<Campaign> UpdateAsync(Campaign campaign, CancellationToken ct = default)
    {
        campaign.UpdatedAt = DateTime.UtcNow;
        db.Campaigns.Update(campaign);
        await db.SaveChangesAsync(ct);
        return campaign;
    }
}
