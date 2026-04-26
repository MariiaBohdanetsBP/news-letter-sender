namespace NewsLetterSender.Core.Interfaces;

/// <summary>
/// Manages subscriber lists in Ecomail.
/// Does NOT send emails — Ecomail handles delivery separately.
/// </summary>
public interface IEcomailService
{
    /// <summary>
    /// Updates the subscriber list in Ecomail with the given email addresses.
    /// Adds new subscribers and optionally removes those not in the list.
    /// </summary>
    Task UpdateSubscriberListAsync(
        string listId,
        IReadOnlyList<string> emails,
        CancellationToken ct = default);
}
