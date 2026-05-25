using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using security_file_share_api.Domain.Entities;

namespace security_file_share_api.Infrastructure.Persistence.Configurations
{
    public class VaultEntryConfiguration : IEntityTypeConfiguration<VaultEntry>
    {
        public void Configure(EntityTypeBuilder<VaultEntry> builder)
        {
            builder.HasKey(e => e.Id);
            builder.Property(e => e.EncryptedData).IsRequired();
            builder.Property(e => e.Iv).IsRequired().HasMaxLength(64);
            builder.Property(e => e.EntryType).IsRequired();

            builder.HasOne(e => e.User)
                .WithMany(u => u.VaultEntries)
                .HasForeignKey(e => e.UserId)
                .OnDelete(DeleteBehavior.Cascade);

            builder.HasOne(e => e.Folder)
                .WithMany(f => f.Entries)
                .HasForeignKey(e => e.FolderId)
                .OnDelete(DeleteBehavior.SetNull);

            builder.HasIndex(e => e.UserId);
            builder.HasIndex(e => e.FolderId);
        }
    }
}
