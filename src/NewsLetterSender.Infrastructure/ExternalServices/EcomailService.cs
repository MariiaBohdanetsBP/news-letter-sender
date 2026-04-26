using System.Net.Http.Headers;
using System.Net.Http.Json;
using Microsoft.Extensions.Logging;
using Microsoft.Extensions.Options;
using NewsLetterSender.Core.Interfaces;

namespace NewsLetterSender.Infrastructure.ExternalServices;

/// <summary>
/// Syncs subscriber lists via Ecomail API v2.
/// Docs: https://ecomailczv2.docs.apiary.io/
/// </summary>
public sealed class EcomailService : IEcomailService, IDisposable
{
    private readonly HttpClient _http;
    private readonly ILogger<EcomailService> _logger;
    private readonly EcomailSettings _settings;

    public EcomailService(HttpClient http, IOptions<EcomailSettings> settings, ILogger<EcomailService> logger)
    {
        _http = http;
        _settings = settings.Value;
        _logger = logger;

        _http.BaseAddress = new Uri(_settings.BaseUrl.TrimEnd('/') + "/");
        _http.DefaultRequestHeaders.Accept.Add(new MediaTypeWithQualityHeaderValue("application/json"));
        _http.DefaultRequestHeaders.Add("key", _settings.ApiKey);
    }

    public async Task UpdateSubscriberListAsync(
        string listId,
        IReadOnlyList<string> emails,
        CancellationToken ct = default)
    {
        var targetListId = string.IsNullOrWhiteSpace(listId) ? _settings.DefaultListId : listId;

        if (string.IsNullOrWhiteSpace(targetListId))
        {
            _logger.LogWarning("No Ecomail list ID provided and no default configured. Skipping sync.");
            return;
        }

        _logger.LogInformation("Syncing {Count} subscribers to Ecomail list {ListId}", emails.Count, targetListId);

        try
        {
            // Ecomail bulk subscribe endpoint
            var payload = new
            {
                subscriber_data = emails.Select(email => new
                {
                    email,
                    status = "subscribed"
                }).ToArray(),
                update_existing = true,
                resubscribe = true
            };

            var response = await _http.PostAsJsonAsync($"lists/{targetListId}/subscribe-bulk", payload, ct);
            response.EnsureSuccessStatusCode();

            _logger.LogInformation("Successfully synced {Count} subscribers to Ecomail list {ListId}",
                emails.Count, targetListId);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Failed to sync subscribers to Ecomail list {ListId}", targetListId);
            throw;
        }
    }

    public void Dispose() => _http.Dispose();
}
