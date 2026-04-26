using NewsLetterSender.Core.Interfaces;
using NewsLetterSender.Core.Models;

namespace NewsLetterSender.Infrastructure.ExternalServices;

/// <summary>
/// Returns hardcoded company data for development.
/// Replace with real Raynet API client when credentials are available.
/// </summary>
public class MockRaynetService : IRaynetService
{
    private static readonly RaynetCompany[] Companies =
    [
        new("R001", "Alza.cz", "Mariya Ivanova", "Muza"),
        new("R002", "Mall.cz", "Jan Novák", "BP1"),
        new("R003", "Rohlik.cz", "Mariya Ivanova", "Muza"),
        new("R004", "Zásilkovna", "Petra Horáková", "BP1"),
        new("R005", "Notino", "Jan Novák", "Muza"),
        new("R006", "CZC.cz", "Petra Horáková", "BP1"),
        new("R007", "Lékárna.cz", "Mariya Ivanova", "Muza"),
        new("R008", "Knihy Dobrovský", "Jan Novák", "BP1"),
        new("R009", "Pilulka", "Petra Horáková", "Muza"),
        new("R010", "Bonami", "Mariya Ivanova", "BP1"),
        new("R011", "Datart", "Jan Novák", "Muza"),
        new("R012", "Mountfield", "Petra Horáková", "BP1"),
        new("R013", "Okay.cz", "Mariya Ivanova", "Muza"),
        new("R014", "Sportisimo", "Jan Novák", "BP1"),
        new("R015", "Tescoma", "Petra Horáková", "Muza"),
    ];

    public Task<IReadOnlyList<RaynetCompany>> GetActiveCompaniesAsync(CancellationToken ct = default)
        => Task.FromResult<IReadOnlyList<RaynetCompany>>(Companies);
}
