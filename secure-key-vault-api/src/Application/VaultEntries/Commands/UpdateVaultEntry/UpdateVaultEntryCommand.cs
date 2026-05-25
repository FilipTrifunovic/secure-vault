using MediatR;
using Microsoft.EntityFrameworkCore;
using security_file_share_api.Application.Common.Exceptions;
using security_file_share_api.Application.Common.Interfaces;
using security_file_share_api.Domain.Enums;

namespace security_file_share_api.Application.VaultEntries.Commands.UpdateVaultEntry
{
    public class UpdateVaultEntryCommand : IRequest<Unit>
    {
        public Guid Id { get; set; }
        public EntryType EntryType { get; set; }
        public string EncryptedData { get; set; }
        public string Iv { get; set; }
        public Guid? FolderId { get; set; }
    }

    public class UpdateVaultEntryCommandHandler : IRequestHandler<UpdateVaultEntryCommand, Unit>
    {
        private readonly IApplicationDbContext _context;
        private readonly ICurrentUserService _currentUser;
        private readonly IDateTime _dateTime;

        public UpdateVaultEntryCommandHandler(
            IApplicationDbContext context,
            ICurrentUserService currentUser,
            IDateTime dateTime)
        {
            _context = context;
            _currentUser = currentUser;
            _dateTime = dateTime;
        }

        public async Task<Unit> Handle(UpdateVaultEntryCommand request, CancellationToken cancellationToken)
        {
            var entry = await _context.VaultEntries
                .FirstOrDefaultAsync(e => e.Id == request.Id, cancellationToken);

            if (entry == null)
                throw new NotFoundException("VaultEntry", request.Id);

            if (entry.UserId != _currentUser.UserId)
                throw new ForbiddenAccessException();

            entry.EntryType = request.EntryType;
            entry.EncryptedData = request.EncryptedData;
            entry.Iv = request.Iv;
            entry.FolderId = request.FolderId;
            entry.UpdatedAt = _dateTime.Now;

            await _context.SaveChangesAsync(cancellationToken);
            return Unit.Value;
        }
    }
}
