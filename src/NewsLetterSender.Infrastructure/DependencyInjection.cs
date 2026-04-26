using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using NewsLetterSender.Core.Interfaces;
using NewsLetterSender.Infrastructure.Data;
using NewsLetterSender.Infrastructure.ExternalServices;
using NewsLetterSender.Infrastructure.Repositories;

namespace NewsLetterSender.Infrastructure;

public static class DependencyInjection
{
    public static IServiceCollection AddInfrastructure(
        this IServiceCollection services,
        string connectionString,
        IConfiguration configuration)
    {
        services.AddDbContext<AppDbContext>(options =>
            options.UseNpgsql(connectionString));

        services.AddScoped<ICampaignRepository, CampaignRepository>();
        services.AddScoped<ICompanyDecisionRepository, CompanyDecisionRepository>();
        services.AddScoped<IUserRepository, UserRepository>();
        services.AddScoped<IAuditLogRepository, AuditLogRepository>();

        // Raynet CRM — uses real API when ApiKey is configured, mock otherwise
        var raynetSettings = configuration.GetSection(RaynetSettings.SectionName).Get<RaynetSettings>() ?? new();
        services.Configure<RaynetSettings>(configuration.GetSection(RaynetSettings.SectionName));

        if (raynetSettings.IsConfigured)
        {
            services.AddHttpClient<IRaynetService, RaynetService>();
        }
        else
        {
            services.AddSingleton<IRaynetService, MockRaynetService>();
        }

        // Ecomail — uses real API when ApiKey is configured, mock otherwise
        var ecomailSettings = configuration.GetSection(EcomailSettings.SectionName).Get<EcomailSettings>() ?? new();
        services.Configure<EcomailSettings>(configuration.GetSection(EcomailSettings.SectionName));

        if (ecomailSettings.IsConfigured)
        {
            services.AddHttpClient<IEcomailService, EcomailService>();
        }
        else
        {
            services.AddSingleton<IEcomailService, MockEcomailService>();
        }

        return services;
    }
}
