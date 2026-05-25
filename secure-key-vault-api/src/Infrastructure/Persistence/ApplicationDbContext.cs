using Microsoft.EntityFrameworkCore;
using security_file_share_api.Application.Common.Interfaces;
using security_file_share_api.Domain.Entities;
using System.Reflection;

namespace security_file_share_api.Infrastructure.Persistence
{
    public class ApplicationDbContext : DbContext, IApplicationDbContext
    {
        public ApplicationDbContext(DbContextOptions<ApplicationDbContext> options)
            : base(options)
        {
        }

        public DbSet<User> Users => Set<User>();
        public DbSet<VaultEntry> VaultEntries => Set<VaultEntry>();
        public DbSet<Folder> Folders => Set<Folder>();

        protected override void OnModelCreating(ModelBuilder builder)
        {
            builder.ApplyConfigurationsFromAssembly(Assembly.GetExecutingAssembly());
            base.OnModelCreating(builder);
        }

        public override async Task<int> SaveChangesAsync(CancellationToken cancellationToken = default)
        {
            return await base.SaveChangesAsync(cancellationToken);
        }
    }
}
