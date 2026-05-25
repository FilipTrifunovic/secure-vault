using Duende.IdentityServer;
using Duende.IdentityServer.Models;
using Duende.IdentityServer.Services;
using IdentityServerAspNetIdentity.Models;
using Microsoft.AspNetCore.Authentication;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Mvc.RazorPages;

namespace identityserver.Pages.Create;

[SecurityHeaders]
[AllowAnonymous]
public class Index : PageModel
{
    private readonly UserManager<ApplicationUser> _userManager;
    private readonly IIdentityServerInteractionService _interaction;

    [BindProperty]
    public InputModel Input { get; set; } = default!;

    public Index(
        UserManager<ApplicationUser> userManager,
        IIdentityServerInteractionService interaction)
    {
        _userManager = userManager;
        _interaction = interaction;
    }

    public IActionResult OnGet(string? returnUrl)
    {
        Input = new InputModel { ReturnUrl = returnUrl };
        return Page();
    }

    public async Task<IActionResult> OnPost()
    {
        var context = await _interaction.GetAuthorizationContextAsync(Input.ReturnUrl);

        if (Input.Button != "create")
        {
            if (context != null)
            {
                await _interaction.DenyAuthorizationAsync(context, AuthorizationError.AccessDenied);
                return Redirect(Input.ReturnUrl ?? "~/");
            }
            return Redirect("http://localhost:4200/login");
        }

        if (Input.Password != Input.ConfirmPassword)
        {
            ModelState.AddModelError("Input.ConfirmPassword", "Passwords do not match");
        }

        if (await _userManager.FindByNameAsync(Input.Username!) != null)
        {
            ModelState.AddModelError("Input.Username", "Username already taken");
        }

        if (ModelState.IsValid)
        {
            var user = new ApplicationUser
            {
                UserName = Input.Username,
                Email = Input.Email,
                FirstName = "",
                LastName = "",
                Address = "",
                Country = ""
            };

            var result = await _userManager.CreateAsync(user, Input.Password!);

            if (!result.Succeeded)
            {
                foreach (var error in result.Errors)
                    ModelState.AddModelError(string.Empty, error.Description);
                return Page();
            }

            await HttpContext.SignInAsync(new IdentityServerUser(user.Id) { DisplayName = user.UserName });

            if (context != null)
                return Redirect(Input.ReturnUrl!);

            if (Url.IsLocalUrl(Input.ReturnUrl))
                return Redirect(Input.ReturnUrl!);

            return Redirect("http://localhost:4200/login?registered=true");
        }

        return Page();
    }
}
