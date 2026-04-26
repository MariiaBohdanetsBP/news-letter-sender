using NewsLetterSender.Core.Interfaces;

namespace NewsLetterSender.Api.Endpoints;

public static class CompanyEndpoints
{
    public static void MapCompanyEndpoints(this WebApplication app)
    {
        var group = app.MapGroup("/api/companies")
            .WithTags("Companies")
            .RequireAuthorization();

        // GET /api/companies — active companies from Raynet CRM (or mock)
        group.MapGet("/", async (IRaynetService raynet, CancellationToken ct) =>
        {
            var companies = await raynet.GetActiveCompaniesAsync(ct);
            return Results.Ok(companies);
        })
        .WithName("GetCompanies");
    }
}
