using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.DependencyInjection;
using NewsLetterSender.Core.Interfaces;
using NewsLetterSender.Infrastructure.Data;
using NewsLetterSender.Infrastructure.Repositories;

namespace NewsLetterSender.Infrastructure;

public static class DependencyInjection
{
    public static IServiceCollection AddInfrastructure(this IServiceCollection services, string connectionString)
    {
        services.AddDbContext<AppDbContext>(options =>
            options.UseNpgsql(connectionString));

        services.AddScoped<ICampaignRepository, CampaignRepository>();
        services.AddScoped<ICompanyDecisionRepository, CompanyDecisionRepository>();
        services.AddScoped<IUserRepository, UserRepository>();
        services.AddScoped<IAuditLogRepository, AuditLogRepository>();

        return services;
    }
}
