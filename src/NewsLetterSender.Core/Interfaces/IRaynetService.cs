using NewsLetterSender.Core.Models;

namespace NewsLetterSender.Core.Interfaces;

/// <summary>
/// Fetches active company data from Raynet CRM.
/// </summary>
public interface IRaynetService
{
    /// <summary>
    /// Returns all active companies with their account managers.
    /// </summary>
    Task<IReadOnlyList<RaynetCompany>> GetActiveCompaniesAsync(CancellationToken ct = default);
}
