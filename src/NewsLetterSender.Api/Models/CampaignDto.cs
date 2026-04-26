using NewsLetterSender.Core.Enums;

namespace NewsLetterSender.Api.Models;

public record CampaignDto(Guid Id, string Name, CampaignStatus Status, DateOnly? PlanDate, DateTime CreatedAt);

public record CreateCampaignRequest(string Name, DateOnly? PlanDate);

public record RenameCampaignRequest(string Name);
