namespace NewsLetterSender.Core.Models;

/// <summary>
/// Company data from Raynet CRM.
/// </summary>
public record RaynetCompany(
    string CompanyId,
    string CompanyName,
    string AccountManager,
    string? Category = null);
