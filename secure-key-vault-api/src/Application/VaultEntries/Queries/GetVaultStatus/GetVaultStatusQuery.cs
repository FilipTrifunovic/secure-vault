using MediatR;
using Microsoft.EntityFrameworkCore;
using security_file_share_api.Application.Common.Interfaces;

namespace security_file_share_api.Application.VaultEntries.Queries.GetVaultStatus
{
    public class GetVaultStatusQuery : IRequest<bool>
    {
    }

    public class GetVaultStatusQueryHandler : IRequestHandler<GetVaultStatusQuery, bool>
    {
        private readonly IApplicationDbContext _context;
        private readonly ICurrentUserService _currentUser;

        public GetVaultStatusQueryHandler(IApplicationDbContext context, ICurrentUserService currentUser)
        {
            _context = context;
            _currentUser = currentUser;
        }

        public async Task<bool> Handle(GetVaultStatusQuery request, CancellationToken cancellationToken)
        {
            var user = await _context.Users
                .FirstOrDefaultAsync(u => u.Id == _currentUser.UserId, cancellationToken);

            return user != null && !string.IsNullOrEmpty(user.EncryptedVaultKey);
        }
    }
}
