using MediatR;
using Microsoft.EntityFrameworkCore;
using security_file_share_api.Application.Common.Exceptions;
using security_file_share_api.Application.Common.Interfaces;

namespace security_file_share_api.Application.VaultEntries.Commands.DeleteVaultEntry
{
    public class DeleteVaultEntryCommand : IRequest<Unit>
    {
        public Guid Id { get; set; }
    }

    public class DeleteVaultEntryCommandHandler : IRequestHandler<DeleteVaultEntryCommand, Unit>
    {
        private readonly IApplicationDbContext _context;
        private readonly ICurrentUserService _currentUser;

        public DeleteVaultEntryCommandHandler(
            IApplicationDbContext context,
            ICurrentUserService currentUser)
        {
            _context = context;
            _currentUser = currentUser;
        }

        public async Task<Unit> Handle(DeleteVaultEntryCommand request, CancellationToken cancellationToken)
        {
            var entry = await _context.VaultEntries
                .FirstOrDefaultAsync(e => e.Id == request.Id, cancellationToken);

            if (entry == null)
                throw new NotFoundException("VaultEntry", request.Id);

            if (entry.UserId != _currentUser.UserId)
                throw new ForbiddenAccessException();

            _context.VaultEntries.Remove(entry);
            await _context.SaveChangesAsync(cancellationToken);

            return Unit.Value;
        }
    }
}
