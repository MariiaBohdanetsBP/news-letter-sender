namespace NewsLetterSender.Core.Entities;

public class CompanyDecision
{
    public Guid Id { get; set; }
    public Guid CampaignId { get; set; }
    public required string CompanyId { get; set; }
    public required string CompanyName { get; set; }
    public bool Selected { get; set; }
    public required string DecidedBy { get; set; }
    public DateTime DecidedAt { get; set; } = DateTime.UtcNow;

    public Campaign Campaign { get; set; } = null!;
}
