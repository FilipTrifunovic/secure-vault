using Microsoft.EntityFrameworkCore;
using security_file_share_api.Domain.Entities;

namespace security_file_share_api.Application.Common.Interfaces
{
    public interface IApplicationDbContext
    {
        DbSet<User> Users { get; }
        DbSet<VaultEntry> VaultEntries { get; }
        DbSet<Folder> Folders { get; }

        Task<int> SaveChangesAsync(CancellationToken cancellationToken);
    }
}
