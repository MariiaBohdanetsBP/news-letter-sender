using System.Security.Claims;
using NewsLetterSender.Api.Models;
using NewsLetterSender.Core.Entities;
using NewsLetterSender.Core.Enums;
using NewsLetterSender.Core.Interfaces;

namespace NewsLetterSender.Api.Endpoints;

public static class CampaignEndpoints
{
    public static void MapCampaignEndpoints(this WebApplication app)
    {
        var group = app.MapGroup("/api/campaigns")
            .WithTags("Campaigns")
            .RequireAuthorization();

        // GET /api/campaigns — list active (Processed) campaigns
        group.MapGet("/", async (ICampaignRepository repo) =>
        {
            var campaigns = await repo.GetAllAsync();
            var dtos = campaigns
                .Where(c => c.Status == CampaignStatus.Processed)
                .Select(c => new CampaignDto(c.Id, c.Name, c.Status, c.PlanDate, c.CreatedAt))
                .ToList();
            return Results.Ok(dtos);
        })
        .WithName("GetCampaigns");

        // GET /api/campaigns/history — list sent campaigns
        group.MapGet("/history", async (ICampaignRepository repo) =>
        {
            var campaigns = await repo.GetAllAsync();
            var dtos = campaigns
                .Where(c => c.Status == CampaignStatus.Sent)
                .Select(c => new CampaignDto(c.Id, c.Name, c.Status, c.PlanDate, c.CreatedAt))
                .ToList();
            return Results.Ok(dtos);
        })
        .WithName("GetCampaignHistory");

        // GET /api/campaigns/{id} — single campaign
        group.MapGet("/{id:guid}", async (Guid id, ICampaignRepository repo) =>
        {
            var campaign = await repo.GetByIdAsync(id);
            return campaign is null
                ? Results.NotFound()
                : Results.Ok(new CampaignDto(campaign.Id, campaign.Name, campaign.Status, campaign.PlanDate, campaign.CreatedAt));
        })
        .WithName("GetCampaign");

        // POST /api/campaigns — create
        group.MapPost("/", async (CreateCampaignRequest request, ICampaignRepository repo, IAuditLogRepository audit, ClaimsPrincipal principal) =>
        {
            var username = principal.FindFirstValue(ClaimTypes.Name) ?? "unknown";
            var campaign = new Campaign
            {
                Id = Guid.NewGuid(),
                Name = request.Name,
                PlanDate = request.PlanDate,
                Status = CampaignStatus.Processed
            };
            var created = await repo.CreateAsync(campaign);

            await audit.LogAsync(new AuditLog
            {
                CampaignId = created.Id,
                Action = "CampaignCreated",
                PerformedBy = username,
                Details = $"Created campaign '{created.Name}'"
            });

            var dto = new CampaignDto(created.Id, created.Name, created.Status, created.PlanDate, created.CreatedAt);
            return Results.Created($"/api/campaigns/{dto.Id}", dto);
        })
        .WithName("CreateCampaign");

        // PUT /api/campaigns/{id}/rename — rename
        group.MapPut("/{id:guid}/rename", async (Guid id, RenameCampaignRequest request, ICampaignRepository repo, IAuditLogRepository audit, ClaimsPrincipal principal) =>
        {
            var username = principal.FindFirstValue(ClaimTypes.Name) ?? "unknown";
            var campaign = await repo.GetByIdAsync(id);
            if (campaign is null) return Results.NotFound();

            var oldName = campaign.Name;
            campaign.Name = request.Name;
            campaign.UpdatedAt = DateTime.UtcNow;
            await repo.UpdateAsync(campaign);

            await audit.LogAsync(new AuditLog
            {
                CampaignId = id,
                Action = "CampaignRenamed",
                PerformedBy = username,
                Details = $"Renamed '{oldName}' → '{request.Name}'"
            });

            return Results.Ok(new CampaignDto(campaign.Id, campaign.Name, campaign.Status, campaign.PlanDate, campaign.CreatedAt));
        })
        .WithName("RenameCampaign");

        // PUT /api/campaigns/{id}/send — mark campaign as sent
        group.MapPut("/{id:guid}/send", async (Guid id, ICampaignRepository repo, IAuditLogRepository audit, ClaimsPrincipal principal) =>
        {
            var username = principal.FindFirstValue(ClaimTypes.Name) ?? "unknown";
            var campaign = await repo.GetByIdAsync(id);
            if (campaign is null) return Results.NotFound();
            if (campaign.Status == CampaignStatus.Sent)
                return Results.Conflict("Campaign is already sent.");

            campaign.Status = CampaignStatus.Sent;
            campaign.UpdatedAt = DateTime.UtcNow;
            await repo.UpdateAsync(campaign);

            await audit.LogAsync(new AuditLog
            {
                CampaignId = id,
                Action = "CampaignSent",
                PerformedBy = username,
                Details = $"Marked campaign '{campaign.Name}' as sent"
            });

            return Results.Ok(new CampaignDto(campaign.Id, campaign.Name, campaign.Status, campaign.PlanDate, campaign.CreatedAt));
        })
        .WithName("SendCampaign");

        // GET /api/campaigns/{id}/decisions — get company decisions
        group.MapGet("/{id:guid}/decisions", async (Guid id, ICompanyDecisionRepository decisionRepo) =>
        {
            var decisions = await decisionRepo.GetByCampaignAsync(id);
            var dtos = decisions.Select(d => new CompanyDecisionDto(
                d.CompanyId, d.CompanyName, d.Selected, d.DecidedBy)).ToList();
            return Results.Ok(dtos);
        })
        .WithName("GetDecisions");

        // PUT /api/campaigns/{id}/decisions — save company decisions
        group.MapPut("/{id:guid}/decisions", async (
            Guid id,
            SaveDecisionsRequest request,
            ICompanyDecisionRepository decisionRepo,
            IAuditLogRepository audit,
            ClaimsPrincipal principal) =>
        {
            var username = principal.FindFirstValue(ClaimTypes.Name) ?? "unknown";
            var decisions = request.Decisions.Select(d => new CompanyDecision
            {
                CampaignId = id,
                CompanyId = d.CompanyId,
                CompanyName = d.CompanyName,
                Selected = d.Selected,
                DecidedBy = username
            }).ToList();

            await decisionRepo.SaveDecisionsAsync(id, decisions);

            var selectedCount = decisions.Count(d => d.Selected);
            await audit.LogAsync(new AuditLog
            {
                CampaignId = id,
                Action = "DecisionsSaved",
                PerformedBy = username,
                Details = $"Saved decisions: {selectedCount} of {decisions.Count} companies selected"
            });

            return Results.Ok();
        })
        .WithName("SaveDecisions");

        // GET /api/campaigns/{id}/audit — get audit trail
        group.MapGet("/{id:guid}/audit", async (Guid id, IAuditLogRepository audit) =>
        {
            var logs = await audit.GetByCampaignAsync(id);
            return Results.Ok(logs.Select(a => new
            {
                a.Action,
                a.PerformedBy,
                a.Details,
                a.Timestamp
            }));
        })
        .WithName("GetAuditLog");
    }
}
