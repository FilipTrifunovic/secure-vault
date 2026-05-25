using MediatR;
using Microsoft.EntityFrameworkCore;
using security_file_share_api.Application.Common.Interfaces;
using security_file_share_api.Domain.Entities;
using security_file_share_api.Domain.Enums;

namespace security_file_share_api.Application.VaultEntries.Commands.CreateVaultEntry
{
    public class CreateVaultEntryCommand : IRequest<Guid>
    {
        public EntryType EntryType { get; set; }
        public string EncryptedData { get; set; }
        public string Iv { get; set; }
        public Guid? FolderId { get; set; }
    }

    public class CreateVaultEntryCommandHandler : IRequestHandler<CreateVaultEntryCommand, Guid>
    {
        private readonly IApplicationDbContext _context;
        private readonly ICurrentUserService _currentUser;
        private readonly IDateTime _dateTime;

        public CreateVaultEntryCommandHandler(
            IApplicationDbContext context,
            ICurrentUserService currentUser,
            IDateTime dateTime)
        {
            _context = context;
            _currentUser = currentUser;
            _dateTime = dateTime;
        }

        public async Task<Guid> Handle(CreateVaultEntryCommand request, CancellationToken cancellationToken)
        {
            // Ensure user exists
            var user = await _context.Users
                .FirstOrDefaultAsync(u => u.Id == _currentUser.UserId, cancellationToken);

            if (user == null)
            {
                user = new User
                {
                    Id = _currentUser.UserId,
                    Email = _currentUser.Email
                };
                _context.Users.Add(user);
            }

            var entry = new VaultEntry
            {
                Id = Guid.NewGuid(),
                UserId = _currentUser.UserId,
                EntryType = request.EntryType,
                EncryptedData = request.EncryptedData,
                Iv = request.Iv,
                FolderId = request.FolderId,
                CreatedAt = _dateTime.Now,
                UpdatedAt = _dateTime.Now
            };

            _context.VaultEntries.Add(entry);
            await _context.SaveChangesAsync(cancellationToken);

            return entry.Id;
        }
    }
}
