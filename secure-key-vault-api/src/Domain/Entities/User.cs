namespace security_file_share_api.Domain.Entities
{
    public class User
    {
        public string Id { get; set; }
        public string Email { get; set; }
        public string EncryptedVaultKey { get; set; }
        public string VaultKeyIv { get; set; }

        public ICollection<VaultEntry> VaultEntries { get; set; } = new List<VaultEntry>();
        public ICollection<Folder> Folders { get; set; } = new List<Folder>();
    }
}
