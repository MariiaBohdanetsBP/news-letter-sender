using Microsoft.Extensions.Logging;
using NewsLetterSender.Core.Interfaces;

namespace NewsLetterSender.Infrastructure.ExternalServices;

/// <summary>
/// Logs subscriber updates to console for development.
/// Replace with real Ecomail API client when API key is available.
/// </summary>
public class MockEcomailService(ILogger<MockEcomailService> logger) : IEcomailService
{
    public Task UpdateSubscriberListAsync(
        string listId,
        IReadOnlyList<string> emails,
        CancellationToken ct = default)
    {
        logger.LogInformation(
            "[MockEcomail] Would update list {ListId} with {Count} subscribers",
            listId, emails.Count);
        return Task.CompletedTask;
    }
}
