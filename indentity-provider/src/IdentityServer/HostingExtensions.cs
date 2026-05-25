using Duende.IdentityServer.EntityFramework.DbContexts;
using Duende.IdentityServer.EntityFramework.Mappers;
using identityserver;
using IdentityServer.Common;
using IdentityServerAspNetIdentity.Data;
using IdentityServerAspNetIdentity.Models;
using Microsoft.AspNetCore.CookiePolicy;
using Microsoft.AspNetCore.DataProtection;
using Microsoft.AspNetCore.HttpOverrides;
using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;
using Serilog;

namespace IdentityServer;

internal static class HostingExtensions
{
    public static WebApplication ConfigureServices(this WebApplicationBuilder builder)
    {
        builder.Services.AddRazorPages();
        builder.Services.AddControllers();

        var migrationsAssembly = typeof(Program).Assembly.GetName().Name;
        var connectionString = builder.Configuration.GetConnectionString("DefaultConnection");
        var identityConnectionString = builder.Configuration.GetConnectionString("IdentityDefaultConnection");

        var frontendUrl = builder.Configuration.GetValue<string>("FrontendUrl") ?? "http://localhost:4200";
        Config.FrontendUrl = frontendUrl;

        var issuerUri = builder.Configuration.GetValue<string>("IssuerUri");

        builder.Services.AddCors(options =>
        {
            options.AddPolicy("CorsPolicy",
                b => b.WithOrigins(frontendUrl)
               .AllowAnyHeader()
               .AllowAnyMethod()
               .AllowCredentials()
               );
        });

        builder.Services.AddDbContext<ApplicationDbContext>(options =>
            options.UseSqlite(identityConnectionString));

        builder.Services.AddIdentity<ApplicationUser, IdentityRole>(options =>
        {
            options.Password.RequireDigit = false;
            options.Password.RequiredLength = 1;
            options.Password.RequireNonAlphanumeric = false;
            options.Password.RequireUppercase = false;
            options.Password.RequireLowercase = false;
            options.Password.RequiredUniqueChars = 1;
        })
            .AddEntityFrameworkStores<ApplicationDbContext>()
            .AddDefaultTokenProviders();

        builder.Services.AddIdentityServer(options =>
            {
                options.Events.RaiseErrorEvents = true;
                options.Events.RaiseInformationEvents = true;
                options.Events.RaiseFailureEvents = true;
                options.Events.RaiseSuccessEvents = true;

                options.EmitStaticAudienceClaim = true;

                if (!string.IsNullOrEmpty(issuerUri))
                {
                    options.IssuerUri = issuerUri;
                }
            })
             .AddConfigurationStore(options =>
             {
                 options.ConfigureDbContext = b => b.UseSqlite(connectionString,
                     sql => sql.MigrationsAssembly(migrationsAssembly));
             })
            .AddOperationalStore(options =>
            {
                options.ConfigureDbContext = b => b.UseSqlite(connectionString,
                    sql => sql.MigrationsAssembly(migrationsAssembly));
            })
            .AddAspNetIdentity<ApplicationUser>()
            .AddInMemoryIdentityResources(Config.IdentityResources)
            .AddInMemoryApiScopes(Config.ApiScopes)
            .AddInMemoryApiResources(Config.Apis)
            .AddInMemoryClients(Config.Clients)
            .AddProfileService<CustomProfileService>();

        builder.Services.AddDataProtection()
            .PersistKeysToFileSystem(new DirectoryInfo("/app/data/dp-keys"))
            .SetApplicationName("IdentityServer");

        builder.Services.ConfigureApplicationCookie(config =>
        {
            config.Cookie.Name = "Identity.Cookie";
            config.Cookie.SameSite = Microsoft.AspNetCore.Http.SameSiteMode.Lax;
            config.Cookie.SecurePolicy = CookieSecurePolicy.SameAsRequest;
        });


        return builder.Build();
    }

    public static WebApplication ConfigurePipeline(this WebApplication app)
    {
        app.UseForwardedHeaders(new ForwardedHeadersOptions
        {
            ForwardedHeaders = ForwardedHeaders.XForwardedFor | ForwardedHeaders.XForwardedProto
        });

        app.UseSerilogRequestLogging();

        if (app.Environment.IsDevelopment())
        {
            app.UseDeveloperExceptionPage();
        }

        app.UseStaticFiles();
        app.UseRouting();
        app.UseCors("CorsPolicy");

        app.UseCookiePolicy(new CookiePolicyOptions
        {
            MinimumSameSitePolicy = Microsoft.AspNetCore.Http.SameSiteMode.Lax,
        });

        app.UseIdentityServer();

        app.UseAuthorization();

        app.UseEndpoints(endpoints =>
        {
            endpoints.MapControllers();
        });

        app.MapRazorPages().RequireAuthorization();

        return app;
    }
}
