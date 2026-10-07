using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Daycare.Api.Migrations
{
    /// <inheritdoc />
    public partial class ChangeMealNametoDescription : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.RenameColumn(
                name: "MealName",
                table: "Meals",
                newName: "Description");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.RenameColumn(
                name: "Description",
                table: "Meals",
                newName: "MealName");
        }
    }
}
