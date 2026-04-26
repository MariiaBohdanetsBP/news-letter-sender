namespace NewsLetterSender.Infrastructure.ExternalServices;

/// <summary>
/// Configuration for Ecomail API integration.
/// Leave ApiKey empty to use mock service.
/// </summary>
public sealed class EcomailSettings
{
    public const string SectionName = "Ecomail";

    /// <summary>API key from Ecomail → Settings → API integration.</summary>
    public string ApiKey { get; set; } = string.Empty;

    /// <summary>Base URL. Defaults to Ecomail v2 API.</summary>
    public string BaseUrl { get; set; } = "https://api2.ecomailapp.cz";

    /// <summary>Default list ID to sync subscribers to.</summary>
    public string DefaultListId { get; set; } = string.Empty;

    public bool IsConfigured => !string.IsNullOrWhiteSpace(ApiKey);
}
