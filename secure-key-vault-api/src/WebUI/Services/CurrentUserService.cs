using System.Security.Claims;
using security_file_share_api.Application.Common.Interfaces;

namespace security_file_share_api.WebUI.Services
{
    public class CurrentUserService : ICurrentUserService
    {
        private readonly IHttpContextAccessor _httpContextAccessor;

        public CurrentUserService(IHttpContextAccessor httpContextAccessor)
        {
            _httpContextAccessor = httpContextAccessor;
        }

        public string UserId =>
            _httpContextAccessor.HttpContext?.User?.FindFirstValue(ClaimTypes.NameIdentifier)
            ?? _httpContextAccessor.HttpContext?.User?.FindFirstValue("sub")
            ?? string.Empty;

        public string Email =>
            _httpContextAccessor.HttpContext?.User?.FindFirstValue(ClaimTypes.Email)
            ?? _httpContextAccessor.HttpContext?.User?.FindFirstValue("email")
            ?? string.Empty;
    }
}
