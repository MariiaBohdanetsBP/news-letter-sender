using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using NewsLetterSender.Core.Entities;

namespace NewsLetterSender.Infrastructure.Data.Configurations;

public class AuditLogConfiguration : IEntityTypeConfiguration<AuditLog>
{
    public void Configure(EntityTypeBuilder<AuditLog> builder)
    {
        builder.ToTable("audit_logs");
        builder.HasKey(a => a.Id);
        builder.Property(a => a.Action).HasMaxLength(100).IsRequired();
        builder.Property(a => a.PerformedBy).HasMaxLength(200).IsRequired();
        builder.Property(a => a.Details).HasMaxLength(2000);
        builder.HasIndex(a => a.CampaignId);
        builder.HasIndex(a => a.Timestamp);
    }
}
