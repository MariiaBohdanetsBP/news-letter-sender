namespace NewsLetterSender.Infrastructure.ExternalServices;

/// <summary>
/// Configuration for Raynet CRM API integration.
/// Leave ApiKey empty to use mock data.
/// </summary>
public sealed class RaynetSettings
{
    public const string SectionName = "Raynet";

    /// <summary>API key from Raynet → Settings → API.</summary>
    public string ApiKey { get; set; } = string.Empty;

    /// <summary>Raynet instance name (subdomain). E.g. "benefitplus" for benefitplus.raynet.cz.</summary>
    public string InstanceName { get; set; } = string.Empty;

    /// <summary>Base URL override. Defaults to https://app.raynet.cz/api/v2.</summary>
    public string BaseUrl { get; set; } = "https://app.raynet.cz/api/v2";

    public bool IsConfigured => !string.IsNullOrWhiteSpace(ApiKey) && !string.IsNullOrWhiteSpace(InstanceName);
}
