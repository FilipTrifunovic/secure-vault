using MediatR;
using Microsoft.EntityFrameworkCore;
using security_file_share_api.Application.Common.Interfaces;
using security_file_share_api.Domain.Entities;

namespace security_file_share_api.Application.Folders.Commands.CreateFolder
{
    public class CreateFolderCommand : IRequest<Guid>
    {
        public string Name { get; set; }
        public Guid? ParentFolderId { get; set; }
    }

    public class CreateFolderCommandHandler : IRequestHandler<CreateFolderCommand, Guid>
    {
        private readonly IApplicationDbContext _context;
        private readonly ICurrentUserService _currentUser;
        private readonly IDateTime _dateTime;

        public CreateFolderCommandHandler(
            IApplicationDbContext context,
            ICurrentUserService currentUser,
            IDateTime dateTime)
        {
            _context = context;
            _currentUser = currentUser;
            _dateTime = dateTime;
        }

        public async Task<Guid> Handle(CreateFolderCommand request, CancellationToken cancellationToken)
        {
            var folder = new Folder
            {
                Id = Guid.NewGuid(),
                UserId = _currentUser.UserId,
                Name = request.Name,
                ParentFolderId = request.ParentFolderId,
                CreatedAt = _dateTime.Now
            };

            _context.Folders.Add(folder);
            await _context.SaveChangesAsync(cancellationToken);

            return folder.Id;
        }
    }
}
