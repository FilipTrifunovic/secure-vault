using MediatR;
using Microsoft.EntityFrameworkCore;
using security_file_share_api.Application.Common.Exceptions;
using security_file_share_api.Application.Common.Interfaces;
using security_file_share_api.Domain.Enums;

namespace security_file_share_api.Application.VaultEntries.Queries.GetVaultEntry
{
    public class VaultEntryDetailDto
    {
        public Guid Id { get; set; }
        public EntryType EntryType { get; set; }
        public string EncryptedData { get; set; }
        public string Iv { get; set; }
        public Guid? FolderId { get; set; }
        public DateTime CreatedAt { get; set; }
        public DateTime UpdatedAt { get; set; }
    }

    public class GetVaultEntryQuery : IRequest<VaultEntryDetailDto>
    {
        public Guid Id { get; set; }
    }

    public class GetVaultEntryQueryHandler : IRequestHandler<GetVaultEntryQuery, VaultEntryDetailDto>
    {
        private readonly IApplicationDbContext _context;
        private readonly ICurrentUserService _currentUser;

        public GetVaultEntryQueryHandler(IApplicationDbContext context, ICurrentUserService currentUser)
        {
            _context = context;
            _currentUser = currentUser;
        }

        public async Task<VaultEntryDetailDto> Handle(GetVaultEntryQuery request, CancellationToken cancellationToken)
        {
            var entry = await _context.VaultEntries
                .FirstOrDefaultAsync(e => e.Id == request.Id, cancellationToken);

            if (entry == null)
                throw new NotFoundException("VaultEntry", request.Id);

            if (entry.UserId != _currentUser.UserId)
                throw new ForbiddenAccessException();

            return new VaultEntryDetailDto
            {
                Id = entry.Id,
                EntryType = entry.EntryType,
                EncryptedData = entry.EncryptedData,
                Iv = entry.Iv,
                FolderId = entry.FolderId,
                CreatedAt = entry.CreatedAt,
                UpdatedAt = entry.UpdatedAt
            };
        }
    }
}
