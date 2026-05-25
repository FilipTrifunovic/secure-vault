using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using security_file_share_api.Domain.Entities;

namespace security_file_share_api.Infrastructure.Persistence.Configurations
{
    public class UserConfiguration : IEntityTypeConfiguration<User>
    {
        public void Configure(EntityTypeBuilder<User> builder)
        {
            builder.HasKey(u => u.Id);
            builder.Property(u => u.Id).HasMaxLength(128);
            builder.Property(u => u.Email).IsRequired().HasMaxLength(256);
            builder.Property(u => u.EncryptedVaultKey).HasMaxLength(4096);
            builder.Property(u => u.VaultKeyIv).HasMaxLength(64);
            builder.HasIndex(u => u.Email).IsUnique();
        }
    }
}
