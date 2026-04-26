using NewsLetterSender.Core.Enums;

namespace NewsLetterSender.Core.Entities;

public class Campaign
{
    public Guid Id { get; set; }
    public required string Name { get; set; }
    public CampaignStatus Status { get; set; } = CampaignStatus.Processed;
    public DateOnly? PlanDate { get; set; }
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;

    public ICollection<CompanyDecision> Decisions { get; set; } = [];
}
