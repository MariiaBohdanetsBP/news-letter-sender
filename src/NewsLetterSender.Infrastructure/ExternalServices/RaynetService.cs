using System.Net.Http.Headers;
using System.Net.Http.Json;
using System.Text.Json;
using System.Text.Json.Serialization;
using Microsoft.Extensions.Logging;
using Microsoft.Extensions.Options;
using NewsLetterSender.Core.Interfaces;
using NewsLetterSender.Core.Models;

namespace NewsLetterSender.Infrastructure.ExternalServices;

/// <summary>
/// Fetches companies from the Raynet CRM REST API v2.
/// Docs: https://raynet.cz/api/
/// </summary>
public sealed class RaynetService : IRaynetService, IDisposable
{
    private readonly HttpClient _http;
    private readonly ILogger<RaynetService> _logger;
    private readonly RaynetSettings _settings;

    private static readonly JsonSerializerOptions JsonOptions = new()
    {
        PropertyNameCaseInsensitive = true,
        DefaultIgnoreCondition = JsonIgnoreCondition.WhenWritingNull
    };

    public RaynetService(HttpClient http, IOptions<RaynetSettings> settings, ILogger<RaynetService> logger)
    {
        _http = http;
        _settings = settings.Value;
        _logger = logger;

        _http.BaseAddress = new Uri(_settings.BaseUrl.TrimEnd('/') + "/");
        _http.DefaultRequestHeaders.Accept.Add(new MediaTypeWithQualityHeaderValue("application/json"));
        _http.DefaultRequestHeaders.Add("X-Instance-Name", _settings.InstanceName);
        _http.DefaultRequestHeaders.Authorization =
            new AuthenticationHeaderValue("Basic",
                Convert.ToBase64String(System.Text.Encoding.UTF8.GetBytes($"{_settings.ApiKey}:X")));
    }

    public async Task<IReadOnlyList<RaynetCompany>> GetActiveCompaniesAsync(CancellationToken ct = default)
    {
        var companies = new List<RaynetCompany>();
        var offset = 0;
        const int limit = 100;

        try
        {
            while (true)
            {
                var url = $"company/?offset={offset}&limit={limit}&status[eq]=ACTIVE";
                var response = await _http.GetAsync(url, ct);
                response.EnsureSuccessStatusCode();

                var result = await response.Content.ReadFromJsonAsync<RaynetApiResponse>(JsonOptions, ct);
                if (result?.Data is null || result.Data.Count == 0)
                    break;

                foreach (var company in result.Data)
                {
                    var accountManager = company.Owner?.FullName ?? "Nepřiřazeno";
                    var systemType = DetectSystemType(company.Category?.Value);

                    companies.Add(new RaynetCompany(
                        CompanyId: company.Id.ToString(),
                        CompanyName: company.Name ?? $"Company #{company.Id}",
                        AccountManager: accountManager,
                        SystemType: systemType,
                        Category: company.Category?.Value));
                }

                offset += limit;
                if (result.Data.Count < limit)
                    break;
            }

            _logger.LogInformation("Fetched {Count} active companies from Raynet", companies.Count);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Failed to fetch companies from Raynet API");
            throw;
        }

        return companies;
    }

    private static string DetectSystemType(string? category) =>
        category?.Contains("BP1", StringComparison.OrdinalIgnoreCase) == true ? "BP1" : "Muza";

    public void Dispose() => _http.Dispose();

    // Raynet API response models (internal)
    private sealed class RaynetApiResponse
    {
        public bool Success { get; set; }
        public int TotalCount { get; set; }
        public List<RaynetCompanyDto>? Data { get; set; }
    }

    private sealed class RaynetCompanyDto
    {
        public long Id { get; set; }
        public string? Name { get; set; }
        public RaynetOwnerDto? Owner { get; set; }
        public RaynetCategoryDto? Category { get; set; }
    }

    private sealed class RaynetOwnerDto
    {
        public string? FullName { get; set; }
    }

    private sealed class RaynetCategoryDto
    {
        public long Id { get; set; }
        public string? Value { get; set; }
    }
}
