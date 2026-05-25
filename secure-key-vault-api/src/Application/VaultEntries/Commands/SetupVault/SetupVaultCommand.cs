using MediatR;
using Microsoft.EntityFrameworkCore;
using security_file_share_api.Application.Common.Interfaces;
using security_file_share_api.Domain.Entities;

namespace security_file_share_api.Application.VaultEntries.Commands.SetupVault
{
    public class SetupVaultCommand : IRequest<Unit>
    {
        public string EncryptedVaultKey { get; set; }
        public string Iv { get; set; }
    }

    public class SetupVaultCommandHandler : IRequestHandler<SetupVaultCommand, Unit>
    {
        private readonly IApplicationDbContext _context;
        private readonly ICurrentUserService _currentUser;

        public SetupVaultCommandHandler(IApplicationDbContext context, ICurrentUserService currentUser)
        {
            _context = context;
            _currentUser = currentUser;
        }

        public async Task<Unit> Handle(SetupVaultCommand request, CancellationToken cancellationToken)
        {
            var user = await _context.Users
                .FirstOrDefaultAsync(u => u.Id == _currentUser.UserId, cancellationToken);

            if (user == null)
            {
                user = new User
                {
                    Id = _currentUser.UserId,
                    Email = _currentUser.Email,
                    EncryptedVaultKey = request.EncryptedVaultKey,
                    VaultKeyIv = request.Iv
                };
                _context.Users.Add(user);
            }
            else
            {
                user.EncryptedVaultKey = request.EncryptedVaultKey;
                user.VaultKeyIv = request.Iv;
            }

            await _context.SaveChangesAsync(cancellationToken);
            return Unit.Value;
        }
    }
}
