

using Microsoft.AspNetCore.Identity;

namespace Daycare.Api.Identity;

public static class IdentitySeeder
{
    public static async Task SeedAsync(
        IServiceProvider services)
    {
        var roleManager =
            services.GetRequiredService<RoleManager<IdentityRole>>();

        var userManager =
            services.GetRequiredService<UserManager<ApplicationUser>>();

        string[] roles =
        {
            AppRoles.Admin,
            AppRoles.Staff,
            AppRoles.Parent
        };

        foreach (var role in roles)
        {
            if (!await roleManager.RoleExistsAsync(role))
            {
                var result = await roleManager.CreateAsync(
                    new IdentityRole(role));

                if (!result.Succeeded)
                {
                    throw new InvalidOperationException(
                        $"Could not create role {role}: " +
                        string.Join("; ",
                            result.Errors.Select(e => e.Description)));
                }
            }
        }

        var email = Environment.GetEnvironmentVariable(
            "DAYCARE_ADMIN_EMAIL");

        var password = Environment.GetEnvironmentVariable(
            "DAYCARE_ADMIN_PASSWORD");

        // Create the initial Admin only when credentials are configured.
        if (string.IsNullOrWhiteSpace(email) ||
            string.IsNullOrWhiteSpace(password))
        {
            return;
        }

        var user = await userManager.FindByEmailAsync(email);

        if (user == null)
        {
            user = new ApplicationUser
            {
                UserName = email,
                Email = email,
                EmailConfirmed = false,
                FirstName = "System",
                LastName = "Administrator"
            };

            var createResult = await userManager.CreateAsync(
                user, password);

            if (!createResult.Succeeded)
            {
                throw new InvalidOperationException(
                    "Could not create initial Admin: " +
                    string.Join("; ",
                        createResult.Errors.Select(e => e.Description)));
            }
        }

        if (!await userManager.IsInRoleAsync(user, AppRoles.Admin))
        {
            var roleResult = await userManager.AddToRoleAsync(
                user, AppRoles.Admin);

            if (!roleResult.Succeeded)
            {
                throw new InvalidOperationException(
                    "Could not assign initial Admin role: " +
                    string.Join("; ",
                        roleResult.Errors.Select(e => e.Description)));
            }
        }
    }
}
