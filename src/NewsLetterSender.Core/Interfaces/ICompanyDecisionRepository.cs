using NewsLetterSender.Core.Entities;

namespace NewsLetterSender.Core.Interfaces;

public interface ICompanyDecisionRepository
{
    Task<List<CompanyDecision>> GetByCampaignAsync(Guid campaignId, CancellationToken ct = default);
    Task SaveDecisionsAsync(Guid campaignId, List<CompanyDecision> decisions, CancellationToken ct = default);
}
