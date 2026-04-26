namespace NewsLetterSender.Core.Entities;

public class AuditLog
{
    public Guid Id { get; set; }
    public Guid CampaignId { get; set; }
    public string Action { get; set; } = string.Empty;
    public string PerformedBy { get; set; } = string.Empty;
    public string? Details { get; set; }
    public DateTime Timestamp { get; set; } = DateTime.UtcNow;
}
