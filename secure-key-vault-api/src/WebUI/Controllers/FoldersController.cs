using System;
using System.Collections.Generic;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using security_file_share_api.Application.Folders.Commands.CreateFolder;
using security_file_share_api.Application.Folders.Commands.DeleteFolder;
using security_file_share_api.Application.Folders.Commands.UpdateFolder;
using security_file_share_api.Application.Folders.Queries.GetFolders;

namespace security_file_share_api.WebUI.Controllers
{
    [Authorize]
    public class FoldersController : ApiControllerBase
    {
        [HttpPost]
        public async Task<ActionResult<CreateFolderResponse>> Create([FromBody] CreateFolderRequest request)
        {
            var id = await Mediator.Send(new CreateFolderCommand
            {
                Name = request.Name,
                ParentFolderId = request.ParentFolderId
            });

            return Ok(new CreateFolderResponse { Id = id });
        }

        [HttpGet]
        public async Task<ActionResult<List<FolderDto>>> List()
        {
            var folders = await Mediator.Send(new GetFoldersQuery());
            return Ok(folders);
        }

        [HttpPut("{id}")]
        public async Task<ActionResult> Update(Guid id, [FromBody] UpdateFolderRequest request)
        {
            await Mediator.Send(new UpdateFolderCommand
            {
                Id = id,
                Name = request.Name,
                ParentFolderId = request.ParentFolderId
            });
            return NoContent();
        }

        [HttpDelete("{id}")]
        public async Task<ActionResult> Delete(Guid id)
        {
            await Mediator.Send(new DeleteFolderCommand { Id = id });
            return NoContent();
        }
    }

    public class CreateFolderRequest
    {
        public string Name { get; set; }
        public Guid? ParentFolderId { get; set; }
    }

    public class CreateFolderResponse
    {
        public Guid Id { get; set; }
    }

    public class UpdateFolderRequest
    {
        public string Name { get; set; }
        public Guid? ParentFolderId { get; set; }
    }
}
