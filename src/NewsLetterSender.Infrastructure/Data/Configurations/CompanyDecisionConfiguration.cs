using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using NewsLetterSender.Core.Entities;

namespace NewsLetterSender.Infrastructure.Data.Configurations;

public class CompanyDecisionConfiguration : IEntityTypeConfiguration<CompanyDecision>
{
    public void Configure(EntityTypeBuilder<CompanyDecision> builder)
    {
        builder.HasKey(d => d.Id);
        builder.Property(d => d.Id).HasDefaultValueSql("gen_random_uuid()");
        builder.Property(d => d.CompanyId).HasMaxLength(100).IsRequired();
        builder.Property(d => d.CompanyName).HasMaxLength(300).IsRequired();
        builder.Property(d => d.DecidedBy).HasMaxLength(200).IsRequired();
        builder.Property(d => d.DecidedAt).HasDefaultValueSql("now()");

        builder.HasIndex(d => new { d.CampaignId, d.CompanyId }).IsUnique();
    }
}
