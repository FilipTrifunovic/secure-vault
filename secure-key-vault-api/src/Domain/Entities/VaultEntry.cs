using security_file_share_api.Domain.Enums;

namespace security_file_share_api.Domain.Entities
{
    public class VaultEntry
    {
        public Guid Id { get; set; }
        public string UserId { get; set; }
        public User User { get; set; }
        public EntryType EntryType { get; set; }
        public string EncryptedData { get; set; }
        public string Iv { get; set; }
        public DateTime CreatedAt { get; set; }
        public DateTime UpdatedAt { get; set; }

        public Guid? FolderId { get; set; }
        public Folder Folder { get; set; }
    }
}
