using MediatR;
using Microsoft.EntityFrameworkCore;
using security_file_share_api.Application.Common.Exceptions;
using security_file_share_api.Application.Common.Interfaces;

namespace security_file_share_api.Application.Folders.Commands.DeleteFolder
{
    public class DeleteFolderCommand : IRequest<Unit>
    {
        public Guid Id { get; set; }
    }

    public class DeleteFolderCommandHandler : IRequestHandler<DeleteFolderCommand, Unit>
    {
        private readonly IApplicationDbContext _context;
        private readonly ICurrentUserService _currentUser;

        public DeleteFolderCommandHandler(IApplicationDbContext context, ICurrentUserService currentUser)
        {
            _context = context;
            _currentUser = currentUser;
        }

        public async Task<Unit> Handle(DeleteFolderCommand request, CancellationToken cancellationToken)
        {
            var folder = await _context.Folders
                .FirstOrDefaultAsync(f => f.Id == request.Id, cancellationToken);

            if (folder == null)
                throw new NotFoundException("Folder", request.Id);

            if (folder.UserId != _currentUser.UserId)
                throw new ForbiddenAccessException();

            _context.Folders.Remove(folder);
            await _context.SaveChangesAsync(cancellationToken);

            return Unit.Value;
        }
    }
}
