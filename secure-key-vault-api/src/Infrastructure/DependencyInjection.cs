using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using security_file_share_api.Application.Common.Interfaces;
using security_file_share_api.Infrastructure.Persistence;
using security_file_share_api.Infrastructure.Services;

namespace security_file_share_api.Infrastructure
{
    public static class DependencyInjection
    {
        public static IServiceCollection AddInfrastructure(this IServiceCollection services, IConfiguration configuration)
        {
            var connectionString = configuration.GetConnectionString("DefaultConnection")
                ?? "Data Source=securevault.db";

            services.AddDbContext<ApplicationDbContext>(options =>
                options.UseSqlite(connectionString));

            services.AddScoped<IApplicationDbContext>(provider =>
                provider.GetRequiredService<ApplicationDbContext>());

            services.AddTransient<IDateTime, DateTimeService>();

            var authority = configuration.GetValue<string>("Auth:Authority") ?? "https://localhost:5001";
            var requireHttps = configuration.GetValue<bool?>("Auth:RequireHttpsMetadata") ?? true;
            var externalIssuer = configuration.GetValue<string>("Auth:ExternalIssuer");

            services.AddAuthentication("Bearer")
                .AddJwtBearer("Bearer", options =>
                {
                    options.Authority = authority;
                    options.RequireHttpsMetadata = requireHttps;
                    options.TokenValidationParameters.ValidateAudience = false;
                    options.TokenValidationParameters.ValidAudience = "api";

                    if (!string.IsNullOrEmpty(externalIssuer))
                    {
                        options.TokenValidationParameters.ValidIssuers = new[] { authority, externalIssuer };
                        options.TokenValidationParameters.ValidateIssuer = true;
                    }
                });

            services.AddAuthorization();

            return services;
        }
    }
}
