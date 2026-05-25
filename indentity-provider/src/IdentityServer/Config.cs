using Duende.IdentityServer.Models;
using IdentityModel;

namespace IdentityServer;

public static class Config
{
    public static string FrontendUrl { get; set; } = "http://localhost:4200";

    public static IEnumerable<IdentityResource> IdentityResources =>
        [
            new IdentityResources.OpenId(),
            new IdentityResources.Profile(),
            new IdentityResource
            {
                Name = "email",
                UserClaims = { JwtClaimTypes.Email },
            }
        ];

    public static IEnumerable<ApiScope> ApiScopes =>
        new ApiScope[]
            {
                new ApiScope(name: "vault", displayName: "Vault Access")
            };

    public static IEnumerable<ApiResource> Apis => new ApiResource[] {
         new ApiResource("vault-api", "SecureVault API")
            {
                Scopes = { "vault" },
                UserClaims = { JwtClaimTypes.Email }
            },
    };

    public static IEnumerable<Client> Clients =>
        [
             new Client
            {
                ClientId = "angular_spa",
                AllowedGrantTypes = GrantTypes.Code,
                RequireClientSecret = false,
                RedirectUris = { $"{FrontendUrl}/callback" },
                PostLogoutRedirectUris = { FrontendUrl, $"{FrontendUrl}/login" },
                AllowedCorsOrigins = { FrontendUrl },
                AllowedScopes = { "openid", "profile","email","vault" },
                RequirePkce = true,
                AllowAccessTokensViaBrowser = true,
                AllowOfflineAccess = true,
                RefreshTokenUsage = TokenUsage.ReUse,
                RefreshTokenExpiration = TokenExpiration.Absolute,
                AbsoluteRefreshTokenLifetime = 2592000,
            }
        ];
}
