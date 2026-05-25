using MediatR;
using Microsoft.EntityFrameworkCore;
using security_file_share_api.Application.Common.Exceptions;
using security_file_share_api.Application.Common.Interfaces;

namespace security_file_share_api.Application.Folders.Commands.UpdateFolder
{
    public class UpdateFolderCommand : IRequest<Unit>
    {
        public Guid Id { get; set; }
        public string Name { get; set; }
        public Guid? ParentFolderId { get; set; }
    }

    public class UpdateFolderCommandHandler : IRequestHandler<UpdateFolderCommand, Unit>
    {
        private readonly IApplicationDbContext _context;
        private readonly ICurrentUserService _currentUser;

        public UpdateFolderCommandHandler(IApplicationDbContext context, ICurrentUserService currentUser)
        {
            _context = context;
            _currentUser = currentUser;
        }

        public async Task<Unit> Handle(UpdateFolderCommand request, CancellationToken cancellationToken)
        {
            var folder = await _context.Folders
                .FirstOrDefaultAsync(f => f.Id == request.Id, cancellationToken);

            if (folder == null)
                throw new NotFoundException("Folder", request.Id);

            if (folder.UserId != _currentUser.UserId)
                throw new ForbiddenAccessException();

            folder.Name = request.Name;
            folder.ParentFolderId = request.ParentFolderId;

            await _context.SaveChangesAsync(cancellationToken);
            return Unit.Value;
        }
    }
}
