using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Daycare.Api.Migrations
{
    /// <inheritdoc />
    public partial class AddAllergiesandHealthConditions : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<string>(
                name: "Allergies",
                table: "Children",
                type: "text",
                nullable: false,
                defaultValue: "");

            migrationBuilder.AddColumn<string>(
                name: "HealthCondition",
                table: "Children",
                type: "text",
                nullable: false,
                defaultValue: "");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "Allergies",
                table: "Children");

            migrationBuilder.DropColumn(
                name: "HealthCondition",
                table: "Children");
        }
    }
}
