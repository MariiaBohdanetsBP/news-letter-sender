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
        new("R001", "Alza.cz", "Mariya Ivanova"),
        new("R002", "Mall.cz", "Jan Novák"),
        new("R003", "Rohlik.cz", "Mariya Ivanova"),
        new("R004", "Zásilkovna", "Petra Horáková"),
        new("R005", "Notino", "Jan Novák"),
        new("R006", "CZC.cz", "Petra Horáková"),
        new("R007", "Lékárna.cz", "Mariya Ivanova"),
        new("R008", "Knihy Dobrovský", "Jan Novák"),
        new("R009", "Pilulka", "Petra Horáková"),
        new("R010", "Bonami", "Mariya Ivanova"),
        new("R011", "Datart", "Jan Novák"),
        new("R012", "Mountfield", "Petra Horáková"),
        new("R013", "Okay.cz", "Mariya Ivanova"),
        new("R014", "Sportisimo", "Jan Novák"),
        new("R015", "Tescoma", "Petra Horáková"),
    ];

    public Task<IReadOnlyList<RaynetCompany>> GetActiveCompaniesAsync(CancellationToken ct = default)
        => Task.FromResult<IReadOnlyList<RaynetCompany>>(Companies);
}
