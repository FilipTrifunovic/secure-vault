namespace security_file_share_api.Domain.Entities
{
    public class Folder
    {
        public Guid Id { get; set; }
        public string UserId { get; set; }
        public User User { get; set; }
        public string Name { get; set; }
        public Guid? ParentFolderId { get; set; }
        public Folder ParentFolder { get; set; }
        public DateTime CreatedAt { get; set; }

        public ICollection<Folder> Children { get; set; } = new List<Folder>();
        public ICollection<VaultEntry> Entries { get; set; } = new List<VaultEntry>();
    }
}
