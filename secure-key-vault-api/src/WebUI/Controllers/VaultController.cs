using System;
using System.Collections.Generic;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using security_file_share_api.Application.VaultEntries.Commands.CreateVaultEntry;
using security_file_share_api.Application.VaultEntries.Commands.DeleteVaultEntry;
using security_file_share_api.Application.VaultEntries.Commands.SetupVault;
using security_file_share_api.Application.VaultEntries.Commands.UpdateVaultEntry;
using security_file_share_api.Application.VaultEntries.Queries.GetVaultEntries;
using security_file_share_api.Application.VaultEntries.Queries.GetVaultEntry;
using security_file_share_api.Application.VaultEntries.Queries.GetVaultStatus;
using security_file_share_api.Domain.Enums;

namespace security_file_share_api.WebUI.Controllers
{
    [Authorize]
    public class VaultController : ApiControllerBase
    {
        [HttpPost("setup")]
        public async Task<ActionResult> Setup([FromBody] SetupVaultRequest request)
        {
            await Mediator.Send(new SetupVaultCommand
            {
                EncryptedVaultKey = request.EncryptedVaultKey,
                Iv = request.Iv
            });
            return NoContent();
        }

        [HttpPost("entries")]
        public async Task<ActionResult<CreateEntryResponse>> CreateEntry([FromBody] CreateEntryRequest request)
        {
            var id = await Mediator.Send(new CreateVaultEntryCommand
            {
                EntryType = request.EntryType,
                EncryptedData = request.EncryptedData,
                Iv = request.Iv,
                FolderId = request.FolderId
            });

            return Ok(new CreateEntryResponse { Id = id });
        }

        [HttpGet("entries")]
        public async Task<ActionResult<List<VaultEntryDto>>> ListEntries()
        {
            var entries = await Mediator.Send(new GetVaultEntriesQuery());
            return Ok(entries);
        }

        [HttpGet("entries/{id}")]
        public async Task<ActionResult<VaultEntryDetailDto>> GetEntry(Guid id)
        {
            var entry = await Mediator.Send(new GetVaultEntryQuery { Id = id });
            return Ok(entry);
        }

        [HttpPut("entries/{id}")]
        public async Task<ActionResult> UpdateEntry(Guid id, [FromBody] UpdateEntryRequest request)
        {
            await Mediator.Send(new UpdateVaultEntryCommand
            {
                Id = id,
                EntryType = request.EntryType,
                EncryptedData = request.EncryptedData,
                Iv = request.Iv,
                FolderId = request.FolderId
            });
            return NoContent();
        }

        [HttpDelete("entries/{id}")]
        public async Task<ActionResult> DeleteEntry(Guid id)
        {
            await Mediator.Send(new DeleteVaultEntryCommand { Id = id });
            return NoContent();
        }

        [HttpGet("status")]
        public async Task<ActionResult<VaultStatusDto>> GetStatus()
        {
            var isSetup = await Mediator.Send(new GetVaultStatusQuery());
            return Ok(new VaultStatusDto { IsSetup = isSetup });
        }
    }

    public class VaultStatusDto
    {
        public bool IsSetup { get; set; }
    }

    public class SetupVaultRequest
    {
        public string EncryptedVaultKey { get; set; }
        public string Iv { get; set; }
    }

    public class CreateEntryRequest
    {
        public EntryType EntryType { get; set; }
        public string EncryptedData { get; set; }
        public string Iv { get; set; }
        public Guid? FolderId { get; set; }
    }

    public class CreateEntryResponse
    {
        public Guid Id { get; set; }
    }

    public class UpdateEntryRequest
    {
        public EntryType EntryType { get; set; }
        public string EncryptedData { get; set; }
        public string Iv { get; set; }
        public Guid? FolderId { get; set; }
    }
}
