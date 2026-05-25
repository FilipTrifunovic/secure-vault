using MediatR;
using Microsoft.EntityFrameworkCore;
using security_file_share_api.Application.Common.Interfaces;
using security_file_share_api.Domain.Enums;

namespace security_file_share_api.Application.VaultEntries.Queries.GetVaultEntries
{
    public class VaultEntryDto
    {
        public Guid Id { get; set; }
        public EntryType EntryType { get; set; }
        public string EncryptedData { get; set; }
        public string Iv { get; set; }
        public Guid? FolderId { get; set; }
        public DateTime CreatedAt { get; set; }
        public DateTime UpdatedAt { get; set; }
    }

    public class GetVaultEntriesQuery : IRequest<List<VaultEntryDto>>
    {
    }

    public class GetVaultEntriesQueryHandler : IRequestHandler<GetVaultEntriesQuery, List<VaultEntryDto>>
    {
        private readonly IApplicationDbContext _context;
        private readonly ICurrentUserService _currentUser;

        public GetVaultEntriesQueryHandler(IApplicationDbContext context, ICurrentUserService currentUser)
        {
            _context = context;
            _currentUser = currentUser;
        }

        public async Task<List<VaultEntryDto>> Handle(GetVaultEntriesQuery request, CancellationToken cancellationToken)
        {
            return await _context.VaultEntries
                .Where(e => e.UserId == _currentUser.UserId)
                .OrderByDescending(e => e.UpdatedAt)
                .Select(e => new VaultEntryDto
                {
                    Id = e.Id,
                    EntryType = e.EntryType,
                    EncryptedData = e.EncryptedData,
                    Iv = e.Iv,
                    FolderId = e.FolderId,
                    CreatedAt = e.CreatedAt,
                    UpdatedAt = e.UpdatedAt
                })
                .ToListAsync(cancellationToken);
        }
    }
}
