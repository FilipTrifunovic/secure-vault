namespace security_file_share_api.Application.Common.Interfaces
{
    public interface ICurrentUserService
    {
        string UserId { get; }
        string Email { get; }
    }
}
