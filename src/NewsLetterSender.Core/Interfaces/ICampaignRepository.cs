using NewsLetterSender.Core.Entities;

namespace NewsLetterSender.Core.Interfaces;

public interface ICampaignRepository
{
    Task<List<Campaign>> GetAllAsync(CancellationToken ct = default);
    Task<Campaign?> GetByIdAsync(Guid id, CancellationToken ct = default);
    Task<Campaign> CreateAsync(Campaign campaign, CancellationToken ct = default);
    Task<Campaign> UpdateAsync(Campaign campaign, CancellationToken ct = default);
}
