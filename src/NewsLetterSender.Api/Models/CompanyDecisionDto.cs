namespace NewsLetterSender.Api.Models;

public record CompanyDecisionDto(string CompanyId, string CompanyName, bool Selected, string? DecidedBy);

public record SaveDecisionsRequest(List<CompanyDecisionItem> Decisions);

public record CompanyDecisionItem(string CompanyId, string CompanyName, bool Selected);
