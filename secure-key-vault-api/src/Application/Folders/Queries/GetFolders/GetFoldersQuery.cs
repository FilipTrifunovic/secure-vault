using MediatR;
using Microsoft.EntityFrameworkCore;
using security_file_share_api.Application.Common.Interfaces;

namespace security_file_share_api.Application.Folders.Queries.GetFolders
{
    public class FolderDto
    {
        public Guid Id { get; set; }
        public string Name { get; set; }
        public Guid? ParentFolderId { get; set; }
        public DateTime CreatedAt { get; set; }
    }

    public class GetFoldersQuery : IRequest<List<FolderDto>>
    {
    }

    public class GetFoldersQueryHandler : IRequestHandler<GetFoldersQuery, List<FolderDto>>
    {
        private readonly IApplicationDbContext _context;
        private readonly ICurrentUserService _currentUser;

        public GetFoldersQueryHandler(IApplicationDbContext context, ICurrentUserService currentUser)
        {
            _context = context;
            _currentUser = currentUser;
        }

        public async Task<List<FolderDto>> Handle(GetFoldersQuery request, CancellationToken cancellationToken)
        {
            return await _context.Folders
                .Where(f => f.UserId == _currentUser.UserId)
                .OrderBy(f => f.Name)
                .Select(f => new FolderDto
                {
                    Id = f.Id,
                    Name = f.Name,
                    ParentFolderId = f.ParentFolderId,
                    CreatedAt = f.CreatedAt
                })
                .ToListAsync(cancellationToken);
        }
    }
}
